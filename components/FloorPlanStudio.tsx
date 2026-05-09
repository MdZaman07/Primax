"use client";

import { useState, useMemo } from "react";
import ManifestPanel from "./ManifestPanel";
import ViewerPanel from "./ViewerPanel";
import AnalyzeDrawer from "./AnalyzeDrawer";
import type { ProjectManifest } from "@/lib/manifest";
import { shortHash } from "@/lib/hash";

interface FloorPlanStudioProps {
  initialManifest: ProjectManifest;
}

export default function FloorPlanStudio({ initialManifest }: FloorPlanStudioProps) {
  const [manifest, setManifest] = useState<ProjectManifest>(initialManifest);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hash = useMemo(() => shortHash(manifest), [manifest]);

  return (
    <div className="flex flex-col h-screen bg-[#f0ece0]">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#410e2b] text-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-light opacity-70">PRiMAX</span>
            <h1 className="text-sm font-semibold tracking-wide leading-tight">Floor Plan Studio</h1>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <span className="text-xs text-white/60 max-w-xs truncate">{manifest.project.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setManifest(initialManifest)}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Reset Demo
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors border border-white/20"
          >
            + Analyze New Project
          </button>
        </div>
      </header>

      {/* Main split panel */}
      <div className="flex flex-1 min-h-0">
        {/* Left: manifest panel */}
        <div className="w-72 flex-shrink-0 h-full overflow-hidden">
          <ManifestPanel manifest={manifest} hash={hash} />
        </div>

        {/* Right: 3D viewer */}
        <div className="flex-1 h-full overflow-hidden">
          <ViewerPanel manifest={manifest} />
        </div>
      </div>

      {drawerOpen && (
        <AnalyzeDrawer
          onManifest={(m) => setManifest(m)}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
