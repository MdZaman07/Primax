"use client";

import { useRef, useState } from "react";
import type { ProjectManifest } from "@/lib/manifest";

interface AnalyzeDrawerProps {
  onManifest: (manifest: ProjectManifest) => void;
  onClose: () => void;
}

export default function AnalyzeDrawer({ onManifest, onClose }: AnalyzeDrawerProps) {
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [renders, setRenders] = useState<File[]>([]);
  const [brandGuide, setBrandGuide] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fpRef = useRef<HTMLInputElement>(null);
  const rendersRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!floorPlan || !projectName.trim()) {
      setError("Floor plan image and project name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [fpB64, ...renderB64s] = await Promise.all([
        toBase64(floorPlan),
        ...renders.map(toBase64),
      ]);
      const bgB64 = brandGuide ? await toBase64(brandGuide) : null;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floorPlan: fpB64,
          renders: renderB64s,
          brandGuide: bgB64,
          projectName: projectName.trim(),
          projectId: projectName.trim().toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? "Analysis failed");
      }

      const source = res.headers.get("X-Manifest-Source");
      const manifest: ProjectManifest = await res.json();
      onManifest(manifest);
      if (source === "demo-fallback") {
        // Close but leave a note — credentials not configured
        setError("No Azure credentials configured — loaded the Ascent demo manifest instead. Add real credentials to .env.local to extract from your images.");
        setLoading(false);
        return;
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#410e2b]">
          <h2 className="text-sm font-semibold text-white tracking-wide">Analyze New Project</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-lg leading-none">×</button>
        </div>

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
            <label className="block text-xs font-medium text-stone-600 mb-1">Renders (optional, multiple)</label>
            <input ref={rendersRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setRenders(Array.from(e.target.files ?? []))} />
            <button
              onClick={() => rendersRef.current?.click()}
              className="w-full text-sm border-2 border-dashed border-stone-200 rounded-lg px-3 py-3 text-stone-500 hover:border-[#410e2b]/40 hover:text-[#410e2b] transition-colors text-center"
            >
              {renders.length > 0 ? `${renders.length} render${renders.length > 1 ? "s" : ""} selected` : "Click to upload renders"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Brand Guide (optional)</label>
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
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#410e2b] hover:bg-[#5a1340] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Analyzing with GPT-4o…" : "Extract Project Manifest"}
          </button>

          <p className="text-[10px] text-stone-400 text-center">
            Requires Azure OpenAI (GPT-4o) credentials in .env.local
          </p>
        </div>
      </div>
    </div>
  );
}
