"use client";

import { useState, useEffect } from "react";
import type { ProjectManifest } from "@/lib/manifest";

interface ManifestPanelProps {
  manifest: ProjectManifest;
  hash: string;
}

function PaletteSwatch({ name, hex, role }: { name: string; hex: string; role: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className="w-5 h-5 rounded-sm flex-shrink-0 border border-black/10"
        style={{ background: hex }}
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-stone-800">{name}</span>
        <span className="text-stone-400 ml-1">{hex}</span>
        <span className="text-stone-400 ml-1">· {role}</span>
      </div>
    </div>
  );
}

function MaterialRow({ label, type, hex }: { label: string; type: string; hex: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className="w-4 h-4 rounded-sm border border-black/10 flex-shrink-0"
        style={{ background: hex }}
      />
      <span className="text-stone-500 w-12 flex-shrink-0">{label}</span>
      <span className="text-stone-700">{type}</span>
    </div>
  );
}

export default function ManifestPanel({ manifest, hash }: ManifestPanelProps) {
  const [jsonOpen, setJsonOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border-r border-stone-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-100">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-0.5">Project Manifest</p>
        <h2 className="text-sm font-semibold text-stone-800 leading-tight">{manifest.project.name}</h2>
        <p className="text-xs text-stone-400">v{manifest.project.version}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
        {/* Palette */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Colour Palette</h3>
          <div className="space-y-1.5">
            {manifest.style.palette.map((c) => (
              <PaletteSwatch key={c.hex} {...c} />
            ))}
          </div>
        </section>

        {/* Materials */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Materials</h3>
          <div className="space-y-1.5">
            <MaterialRow label="Floor" {...manifest.style.materials.flooring} />
            <MaterialRow label="Walls" {...manifest.style.materials.walls} />
            <MaterialRow label="Ceiling" {...manifest.style.materials.ceiling} />
          </div>
        </section>

        {/* Furniture */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Furniture Style</h3>
          <p className="text-xs text-stone-700 capitalize mb-1">{manifest.style.furniture.style.replace(/-/g, " ")}</p>
          <div className="flex gap-1">
            {manifest.style.furniture.primaryTones.map((hex) => (
              <div
                key={hex}
                className="w-5 h-5 rounded-sm border border-black/10"
                style={{ background: hex }}
                title={hex}
              />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Typography</h3>
          <p className="text-xs text-stone-700">
            <span className="text-stone-400">Heading</span> {manifest.style.typography.heading}
          </p>
          <p className="text-xs text-stone-700">
            <span className="text-stone-400">Body</span> {manifest.style.typography.body}
          </p>
        </section>

        {/* Rooms */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">
            Geometry · {manifest.geometry.rooms.length} rooms · {manifest.geometry.totalAreaM2} m²
          </h3>
          <div className="space-y-1">
            {manifest.geometry.rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between text-xs">
                <span className="text-stone-700">{room.label}</span>
                <span className="text-stone-400 tabular-nums">
                  {room.bounds.w.toFixed(1)} × {room.bounds.h.toFixed(1)} m
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Raw JSON toggle */}
        <section>
          <button
            onClick={() => setJsonOpen((o) => !o)}
            className="w-full text-left text-xs uppercase tracking-wider text-stone-400 hover:text-stone-600 flex items-center justify-between mb-2"
          >
            <span>Raw JSON</span>
            <span>{jsonOpen ? "▲" : "▼"}</span>
          </button>
          {jsonOpen && (
            <pre className="text-[10px] text-stone-600 bg-stone-50 rounded p-2 overflow-x-auto max-h-64 overflow-y-auto border border-stone-100">
              {JSON.stringify(manifest, null, 2)}
            </pre>
          )}
        </section>
      </div>

      {/* Hash badge */}
      <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-400">Manifest Hash</p>
          <button
            onClick={copyHash}
            className="font-mono text-xs text-stone-600 hover:text-stone-900 transition-colors"
            title="Click to copy full hash"
          >
            {hash}…
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-600">{copied ? "Copied!" : "Deterministic"}</span>
        </div>
      </div>
    </div>
  );
}
