"use client";

import dynamic from "next/dynamic";
import type { ProjectManifest } from "@/lib/manifest";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

interface ViewerPanelProps {
  manifest: ProjectManifest;
}

export default function ViewerPanel({ manifest }: ViewerPanelProps) {
  return (
    <div className="relative w-full h-full min-h-0">
      <Scene3D manifest={manifest} />
      <div className="absolute bottom-3 left-3 text-xs text-stone-500 bg-white/70 backdrop-blur-sm rounded px-2 py-1 pointer-events-none">
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
