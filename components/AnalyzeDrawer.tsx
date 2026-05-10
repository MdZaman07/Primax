"use client";

import { useRef, useState } from "react";
import type { ProjectManifest } from "@/lib/manifest";
import type { BrandRecord } from "@/lib/brandStore";
import type { ProjectEntry } from "@/lib/projectStore";

export interface AnalyzeCompleteArgs {
  project: ProjectEntry | null;
  tempManifest: ProjectManifest;
  brandKey: string | null;
}

interface AnalyzeDrawerProps {
  brands: BrandRecord[];
  onComplete: (args: AnalyzeCompleteArgs) => void;
  onClose: () => void;
}

type Step = "upload" | "save";
type BrandOption = "existing" | "new-brand";

export default function AnalyzeDrawer({ brands, onComplete, onClose }: AnalyzeDrawerProps) {
  // Step 1 — upload
  const [step, setStep] = useState<Step>("upload");
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [renders, setRenders] = useState<File[]>([]);
  const [brandGuide, setBrandGuide] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 — save options (set after analysis)
  const [analyzedManifest, setAnalyzedManifest] = useState<ProjectManifest | null>(null);
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [brandOption, setBrandOption] = useState<BrandOption>("existing");
  const [existingBrandKey, setExistingBrandKey] = useState<string>(brands[0]?.key ?? "");
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandDeveloper, setNewBrandDeveloper] = useState("");
  const [saving, setSaving] = useState(false);

  const fpRef = useRef<HTMLInputElement>(null);
  const rendersRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  const toDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAnalyze = async () => {
    if (!floorPlan || !projectName.trim()) {
      setError("Floor plan image and project name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [fpUrl, ...renderUrls] = await Promise.all([
        toDataUrl(floorPlan),
        ...renders.map(toDataUrl),
      ]);
      const bgUrl = brandGuide ? await toDataUrl(brandGuide) : null;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floorPlan: fpUrl,
          renders: renderUrls,
          brandGuide: bgUrl,
          projectName: projectName.trim(),
          projectId: projectName.trim().toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? "Analysis failed");
      }

      const manifest: ProjectManifest = await res.json();
      const source = res.headers.get("X-Manifest-Source");

      if (source === "demo-fallback") {
        setError("No API credentials configured — loaded the Ascent demo manifest. Add OPENAI_API_KEY to .env.local to analyze real images.");
      }

      setAnalyzedManifest(manifest);
      setStep("save");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!analyzedManifest) return;
    setSaving(true);
    setError(null);

    try {
      let savedProject: ProjectEntry | null = null;
      let finalBrandKey: string | null = null;

      // Save the new brand first (if chosen), then use its key
      if (brandOption === "new-brand" && newBrandName.trim()) {
        const res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: newBrandName.trim().toLowerCase().replace(/\s+/g, "-"),
            name: newBrandName.trim(),
            developer: newBrandDeveloper.trim(),
            description: "",
            style: analyzedManifest.style,
          }),
        });
        if (!res.ok) throw new Error("Failed to save brand");
        finalBrandKey = newBrandName.trim().toLowerCase().replace(/\s+/g, "-");
      } else if (brandOption === "existing") {
        finalBrandKey = existingBrandKey || null;
      }

      // Save project to DB (if requested)
      if (saveToLibrary) {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: analyzedManifest.project.id,
            name: analyzedManifest.project.name,
            geometry: analyzedManifest.geometry,
            extractedStyle: analyzedManifest.style,
            defaultBrandKey: finalBrandKey,
          }),
        });
        if (!res.ok) throw new Error("Failed to save project");
        savedProject = await res.json();
      }

      onComplete({ project: savedProject, tempManifest: analyzedManifest, brandKey: finalBrandKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#410e2b]">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              {step === "upload" ? "Analyze New Project" : "Save Options"}
            </h2>
            <p className="text-[10px] text-white/50 mt-0.5">
              {step === "upload" ? "Step 1 of 2 — Upload" : "Step 2 of 2 — What to save"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-lg leading-none">×</button>
        </div>

        {/* ── Step 1: Upload ─────────────────────────────────────────── */}
        {step === "upload" && (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Project Name *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Ascent Rouse Hill"
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#410e2b]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">2D Floor Plan *</label>
              <input ref={fpRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFloorPlan(e.target.files?.[0] ?? null)} />
              <button
                onClick={() => fpRef.current?.click()}
                className="w-full text-sm border-2 border-dashed border-stone-200 rounded-lg px-3 py-3 text-stone-500 hover:border-[#410e2b]/40 hover:text-[#410e2b] transition-colors text-center"
              >
                {floorPlan ? floorPlan.name : "Click to upload floor plan"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Renders <span className="text-stone-400">(optional)</span></label>
              <input ref={rendersRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setRenders(Array.from(e.target.files ?? []))} />
              <button
                onClick={() => rendersRef.current?.click()}
                className="w-full text-sm border-2 border-dashed border-stone-200 rounded-lg px-3 py-3 text-stone-500 hover:border-[#410e2b]/40 hover:text-[#410e2b] transition-colors text-center"
              >
                {renders.length > 0 ? `${renders.length} render${renders.length > 1 ? "s" : ""} selected` : "Click to upload renders"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Brand Guide <span className="text-stone-400">(optional)</span></label>
              <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={(e) => setBrandGuide(e.target.files?.[0] ?? null)} />
              <button
                onClick={() => bgRef.current?.click()}
                className="w-full text-sm border-2 border-dashed border-stone-200 rounded-lg px-3 py-3 text-stone-500 hover:border-[#410e2b]/40 hover:text-[#410e2b] transition-colors text-center"
              >
                {brandGuide ? brandGuide.name : "Click to upload brand guide"}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#410e2b] hover:bg-[#5a1340] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Analyzing with GPT-4o…" : "Extract Project Manifest →"}
            </button>
          </div>
        )}

        {/* ── Step 2: Save options ───────────────────────────────────── */}
        {step === "save" && analyzedManifest && (
          <div className="px-6 py-5 space-y-5">
            {/* Analysis summary */}
            <div className="bg-stone-50 rounded-lg px-3 py-2.5 border border-stone-100">
              <p className="text-xs font-semibold text-stone-700">{analyzedManifest.project.name}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {analyzedManifest.geometry.rooms.length} rooms · {analyzedManifest.geometry.totalAreaM2} m²
                · {analyzedManifest.style.palette.length} palette colours extracted
              </p>
            </div>

            {/* Save project toggle */}
            <div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                  className="w-4 h-4 accent-[#410e2b]"
                />
                <span className="text-sm font-medium text-stone-700">Save project to library</span>
              </label>
              <p className="text-[10px] text-stone-400 mt-1 ml-6.5">
                Saved projects persist across sessions and can be revisited later.
              </p>
            </div>

            {/* Brand selection */}
            <div>
              <p className="text-xs font-medium text-stone-600 mb-2">Brand / Style</p>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="radio" name="brand" value="existing" checked={brandOption === "existing"} onChange={() => setBrandOption("existing")} className="mt-0.5 accent-[#410e2b]" />
                  <div className="flex-1">
                    <span className="text-sm text-stone-700">Apply existing brand</span>
                    {brandOption === "existing" && (
                      <select
                        value={existingBrandKey}
                        onChange={(e) => setExistingBrandKey(e.target.value)}
                        className="mt-1 w-full text-xs border border-stone-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#410e2b]/30"
                      >
                        {brands.map((b) => (
                          <option key={b.key} value={b.key}>{b.name} — {b.developer}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="radio" name="brand" value="new-brand" checked={brandOption === "new-brand"} onChange={() => setBrandOption("new-brand")} className="mt-0.5 accent-[#410e2b]" />
                  <div className="flex-1">
                    <span className="text-sm text-stone-700">Save extracted style as new brand</span>
                    {brandOption === "new-brand" && (
                      <div className="mt-2 space-y-1.5">
                        <input
                          type="text"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          placeholder="Brand name (e.g. Ascent)"
                          className="w-full text-xs border border-stone-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#410e2b]/30"
                        />
                        <input
                          type="text"
                          value={newBrandDeveloper}
                          onChange={(e) => setNewBrandDeveloper(e.target.value)}
                          placeholder="Developer name (e.g. Sanctuary Quarter)"
                          className="w-full text-xs border border-stone-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#410e2b]/30"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>
            )}

            <button
              onClick={handleConfirm}
              disabled={saving}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#410e2b] hover:bg-[#5a1340] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
