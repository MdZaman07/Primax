"use client";

import { useState, useMemo } from "react";
import ManifestPanel from "./ManifestPanel";
import ViewerPanel from "./ViewerPanel";
import AnalyzeDrawer, { type AnalyzeCompleteArgs } from "./AnalyzeDrawer";
import type { ProjectManifest } from "@/lib/manifest";
import { geometryHash } from "@/lib/hash";
import type { BrandRecord } from "@/lib/brandStore";
import type { ProjectEntry } from "@/lib/projectStore";
import { ascentManifest } from "@/lib/ascent-manifest";

interface FloorPlanStudioProps {
  initialProjects: ProjectEntry[];
  initialBrands: BrandRecord[];
}

export default function FloorPlanStudio({ initialProjects, initialBrands }: FloorPlanStudioProps) {
  const [projects, setProjects] = useState<ProjectEntry[]>(initialProjects);
  const [brands, setBrands] = useState<BrandRecord[]>(initialBrands);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjects[0]?.projectId ?? null
  );
  const [selectedBrandKey, setSelectedBrandKey] = useState<string | null>(
    initialProjects[0]?.defaultBrandKey ?? initialBrands[0]?.key ?? null
  );
  // Holds an analyzed manifest that hasn't been saved — cleared on project switch
  const [tempManifest, setTempManifest] = useState<ProjectManifest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeManifest: ProjectManifest = useMemo(() => {
    const brand = selectedBrandKey ? brands.find((b) => b.key === selectedBrandKey) : null;

    if (selectedProjectId) {
      const proj = projects.find((p) => p.projectId === selectedProjectId);
      if (proj) {
        return {
          project: { id: proj.projectId, name: proj.name, version: "1.0.0" },
          geometry: proj.geometry,
          style: brand?.style ?? proj.extractedStyle ?? ascentManifest.style,
        };
      }
    }

    if (tempManifest) {
      return { ...tempManifest, style: brand?.style ?? tempManifest.style };
    }

    return { ...ascentManifest, style: brand?.style ?? ascentManifest.style };
  }, [projects, selectedProjectId, brands, selectedBrandKey, tempManifest]);

  const activeBrand = selectedBrandKey ? brands.find((b) => b.key === selectedBrandKey) : null;

  const sHash = activeBrand?.styleHash ?? "";
  const gHash = useMemo(() => geometryHash(activeManifest), [activeManifest]);

  const handleAnalyzeComplete = ({ project, tempManifest: tm, brandKey }: AnalyzeCompleteArgs) => {
    if (project) {
      setProjects((prev) => [project, ...prev.filter((p) => p.projectId !== project.projectId)]);
      setSelectedProjectId(project.projectId);
      setTempManifest(null);
    } else {
      setSelectedProjectId(null);
      setTempManifest(tm);
    }
    // If a new brand was created, reload from server to pick it up
    if (brandKey && !brands.find((b) => b.key === brandKey)) {
      fetch("/api/brands")
        .then((r) => r.json())
        .then((fresh: BrandRecord[]) => setBrands(fresh))
        .catch(() => null);
    }
    setSelectedBrandKey(brandKey ?? brands[0]?.key ?? null);
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0ece0]">
      <header className="flex items-center justify-between px-6 py-3 bg-[#410e2b] text-white shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-light opacity-70">PRiMAX</span>
            <h1 className="text-sm font-semibold tracking-wide leading-tight">Floor Plan Studio</h1>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <span className="text-xs text-white/60 max-w-xs truncate">{activeManifest.project.name}</span>
          {activeBrand && (
            <>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-xs text-white/40">Brand:</span>
              <span className="text-xs text-white/80 font-medium">{activeBrand.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedProjectId(initialProjects[0]?.projectId ?? null);
              setSelectedBrandKey(initialBrands[0]?.key ?? null);
              setTempManifest(null);
            }}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors border border-white/20"
          >
            + Analyze New Project
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="w-72 shrink-0 h-full overflow-hidden">
          <ManifestPanel
            manifest={activeManifest}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={(id) => {
              setSelectedProjectId(id);
              setTempManifest(null);
              const proj = projects.find((p) => p.projectId === id);
              if (proj) setSelectedBrandKey(proj.defaultBrandKey ?? brands[0]?.key ?? null);
            }}
            brands={brands}
            selectedBrandKey={selectedBrandKey}
            onBrandChange={setSelectedBrandKey}
            onNewProject={() => setDrawerOpen(true)}
            styleHash={sHash}
            geometryHash={gHash}
          />
        </div>
        <div className="flex-1 h-full overflow-hidden">
          <ViewerPanel manifest={activeManifest} />
        </div>
      </div>

      {drawerOpen && (
        <AnalyzeDrawer
          brands={brands}
          onComplete={handleAnalyzeComplete}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
