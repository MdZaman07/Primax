export const dynamic = "force-dynamic";

import FloorPlanStudio from "@/components/FloorPlanStudio";
import { seedBrandsIfEmpty, listBrands } from "@/lib/brandStore";
import { listProjects, seedProjectsIfEmpty } from "@/lib/projectStore";
import type { BrandRecord } from "@/lib/brandStore";
import type { ProjectEntry } from "@/lib/projectStore";

export default async function Home() {
  await seedBrandsIfEmpty();

  let brands: BrandRecord[] = [];
  try {
    brands = await listBrands();
  } catch (e) {
    console.error("[page] DB unavailable, falling back to static brands:", e);
    const { BRAND_LIBRARY } = await import("@/lib/brands");
    brands = BRAND_LIBRARY.map((b) => ({ ...b, styleHash: "00000000" }));
  }

  let projects: ProjectEntry[] = [];
  try {
    await seedProjectsIfEmpty();
    projects = await listProjects();
  } catch (e) {
    console.error("[page] Could not load projects:", e);
  }

  return <FloorPlanStudio initialProjects={projects} initialBrands={brands} />;
}
