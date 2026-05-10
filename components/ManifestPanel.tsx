"use client";

import { useState } from "react";
import type { ProjectManifest } from "@/lib/manifest";
import type { BrandRecord } from "@/lib/brandStore";
import type { ProjectEntry } from "@/lib/projectStore";

interface ManifestPanelProps {
  manifest: ProjectManifest;
  projects: ProjectEntry[];
  selectedProjectId: string | null;
  onProjectChange: (id: string | null) => void;
  brands: BrandRecord[];
  selectedBrandKey: string | null;
  onBrandChange: (key: string | null) => void;
  onNewProject: () => void;
  styleHash: string;
  geometryHash: string;
}

function Swatch({ hex, title }: { hex: string; title?: string }) {
  return (
    <div
      className="w-4 h-4 rounded-sm border border-black/10 shrink-0"
      style={{ background: hex }}
      title={title ?? hex}
    />
  );
}

function HashBadge({
  label, hash, color, copied, onClick,
}: {
  label: string; hash: string; color: string; copied: boolean; onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[9px] uppercase tracking-widest" style={{ color }}>{label}</p>
        <button
          onClick={onClick}
          className="font-mono text-xs text-stone-600 hover:text-stone-900 transition-colors"
          title="Click to copy"
        >
          {hash}…
        </button>
      </div>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
    </div>
  );
}

export default function ManifestPanel({
  manifest,
  projects,
  selectedProjectId,
  onProjectChange,
  brands,
  selectedBrandKey,
  onBrandChange,
  onNewProject,
  styleHash,
  geometryHash,
}: ManifestPanelProps) {
  const [jsonOpen, setJsonOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const tones = manifest.style.furniture.primaryTones;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border-r border-stone-200">

      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-100">
        <p className="text-[9px] uppercase tracking-widest text-stone-500 mb-0.5">Project Manifest</p>
        <h2 className="text-sm font-semibold text-stone-800 leading-tight">{manifest.project.name}</h2>
        <p className="text-[10px] text-stone-500">v{manifest.project.version}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">

        {/* ── Projects ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] uppercase tracking-wider text-stone-500 font-medium">Projects</h3>
            <button
              onClick={onNewProject}
              className="text-[9px] text-[#410e2b] hover:text-[#5a1340] font-medium transition-colors"
            >
              + New
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-[10px] text-stone-400 px-1">
              No saved projects yet. Analyze a project to get started.
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map((proj) => {
                const isActive = selectedProjectId === proj.projectId;
                return (
                  <button
                    key={proj.projectId}
                    onClick={() => onProjectChange(proj.projectId)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border transition-all ${
                      isActive
                        ? "border-[#410e2b] bg-[#410e2b]/5"
                        : "border-stone-100 hover:border-stone-200 bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold truncate pr-2 ${isActive ? "text-[#410e2b]" : "text-stone-700"}`}>
                        {proj.name}
                      </span>
                      <div className="flex gap-1 shrink-0">
                        {proj.extractedStyle?.palette.slice(0, 2).map((c) => (
                          <div
                            key={c.role}
                            className="w-3 h-3 rounded-full border border-black/10"
                            style={{ background: c.hex }}
                            title={`${c.name} · ${c.hex}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-stone-500 leading-tight">
                        {proj.geometry.rooms.length} rooms · {proj.geometry.totalAreaM2} m²
                      </p>
                      {proj.analyzedStyleHash && (
                        <span className="font-mono text-[9px] text-stone-400" title="AI-extracted style fingerprint at analysis time">
                          #{proj.analyzedStyleHash}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Brand Library ──────────────────────────────────────────── */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1.5">Brand Library</h3>
          <p className="text-[10px] text-stone-500 mb-2 leading-tight">
            Same floor plan · swap brand · different output
          </p>
          <div className="space-y-1">
            {brands.map((brand) => {
              const isActive = selectedBrandKey === brand.key;
              return (
                <button
                  key={brand.key}
                  onClick={() => onBrandChange(brand.key)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg border transition-all ${
                    isActive
                      ? "border-[#410e2b] bg-[#410e2b]/5"
                      : "border-stone-100 hover:border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${isActive ? "text-[#410e2b]" : "text-stone-700"}`}>
                      {brand.name}
                    </span>
                    <div className="flex gap-1">
                      {brand.style.palette.slice(0, 2).map((c) => (
                        <div
                          key={c.role}
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ background: c.hex }}
                          title={`${c.name} · ${c.hex}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px] text-stone-500 leading-tight">{brand.developer}</p>
                    {brand.styleHash && (
                      <span className="font-mono text-[9px] text-stone-400" title="Brand style fingerprint">
                        #{brand.styleHash}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Colour Palette ─────────────────────────────────────────── */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-2">Brand Palette</h3>
          <div className="space-y-1.5">
            {manifest.style.palette.map((c) => (
              <div key={c.role} className="flex items-center gap-2 text-xs">
                <Swatch hex={c.hex} title={`${c.name} · ${c.hex}`} />
                <span className="font-medium text-stone-700">{c.name}</span>
                <span className="text-stone-600 font-mono text-[10px]">{c.hex}</span>
                <span className="text-stone-400 text-[9px] ml-auto">{c.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Materials ──────────────────────────────────────────────── */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-2">Materials · from renders</h3>
          <div className="space-y-1.5">
            {(["flooring", "walls", "ceiling"] as const).map((key) => {
              const m = manifest.style.materials[key];
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <Swatch hex={m.hex} />
                  <span className="text-stone-500 w-11 capitalize text-[10px]">{key}</span>
                  <span className="text-stone-700">{m.type}</span>
                </div>
              );
            })}
            {manifest.style.materials.joinery && (
              <div className="flex items-center gap-2 text-xs">
                <Swatch hex={manifest.style.materials.joinery.hex} />
                <span className="text-stone-500 w-11 text-[10px]">joinery</span>
                <span className="text-stone-700">{manifest.style.materials.joinery.type}</span>
              </div>
            )}
            {manifest.style.materials.fixtures && (
              <div className="flex items-center gap-2 text-xs">
                <Swatch hex={manifest.style.materials.fixtures.hex} />
                <span className="text-stone-500 w-11 text-[10px]">fixtures</span>
                <span className="text-stone-700">{manifest.style.materials.fixtures.type}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── Furniture ──────────────────────────────────────────────── */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-2">Furniture · from renders</h3>
          <p className="text-[10px] text-stone-700 capitalize mb-2">
            {manifest.style.furniture.style.replace(/-/g, " ")}
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {tones.map((hex, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Swatch hex={hex} title={["body", "dark accent", "warm accent"][i] ?? `tone ${i + 1}`} />
                  <span className="text-[10px] text-stone-500">{["body", "dark", "warm"][i] ?? i}</span>
                </div>
              ))}
            </div>
            {manifest.style.furniture.accentTones && manifest.style.furniture.accentTones.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-stone-400 mr-0.5">extras</span>
                {manifest.style.furniture.accentTones.map((hex, i) => (
                  <Swatch key={i} hex={hex} title={hex} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Room Observations ──────────────────────────────────────── */}
        {manifest.style.roomObservations && manifest.style.roomObservations.length > 0 && (
          <section>
            <h3 className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-2">Room Observations</h3>
            <div className="space-y-1.5">
              {manifest.style.roomObservations.map((obs, i) => (
                <div key={i} className="text-[10px]">
                  <span className="font-medium text-stone-700 capitalize">{obs.roomType}: </span>
                  <span className="text-stone-500">{obs.notes}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Typography ─────────────────────────────────────────────── */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1.5">Typography</h3>
          <p className="text-[10px] text-stone-700">
            <span className="text-stone-500">Heading </span>{manifest.style.typography.heading}
          </p>
          <p className="text-[10px] text-stone-700">
            <span className="text-stone-500">Body </span>{manifest.style.typography.body}
          </p>
        </section>

        {/* ── Geometry ───────────────────────────────────────────────── */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-2">
            Geometry · {manifest.geometry.rooms.length} rooms · {manifest.geometry.totalAreaM2} m²
          </h3>
          <div className="space-y-0.5">
            {manifest.geometry.rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between text-[10px]">
                <span className="text-stone-700">{room.label}</span>
                <span className="text-stone-500 tabular-nums font-mono">
                  {room.bounds.w.toFixed(1)}×{room.bounds.h.toFixed(1)}m
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Raw JSON ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setJsonOpen((o) => !o)}
              className="text-[9px] uppercase tracking-wider text-stone-400 hover:text-stone-600 flex items-center gap-1"
            >
              <span>Raw JSON</span>
              <span>{jsonOpen ? "▲" : "▼"}</span>
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${manifest.project.id}-manifest.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-[9px] text-[#410e2b] hover:text-[#5a1340] font-medium transition-colors"
            >
              ↓ Download
            </button>
          </div>
          {jsonOpen && (
            <pre className="text-[9px] text-stone-600 bg-stone-50 rounded p-2 overflow-x-auto max-h-56 overflow-y-auto border border-stone-100 leading-relaxed">
              {JSON.stringify(manifest, null, 2)}
            </pre>
          )}
        </section>
      </div>

      {/* ── Hash badges ────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-stone-100 space-y-2">
        <HashBadge
          label="Brand hash · style fingerprint"
          hash={styleHash}
          color="#410e2b"
          copied={copiedField === "style"}
          onClick={() => copy(styleHash, "style")}
        />
        <HashBadge
          label="Geometry hash · lot fingerprint"
          hash={geometryHash}
          color="#2a5a8a"
          copied={copiedField === "geo"}
          onClick={() => copy(geometryHash, "geo")}
        />
        <p className="text-[9px] text-stone-500 leading-tight pt-0.5">
          Brand hash is identical across all lots using the same brand.
          Geometry hash is unique per floor plan.
        </p>
      </div>
    </div>
  );
}
