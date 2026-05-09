import FloorPlanStudio from "@/components/FloorPlanStudio";
import { ascentManifest } from "@/lib/ascent-manifest";

export default function Home() {
  return <FloorPlanStudio initialManifest={ascentManifest} />;
}
