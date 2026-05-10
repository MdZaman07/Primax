import { createHash } from "crypto";
import type { ProjectManifest } from "./manifest";

function sha256(data: string | undefined): string {
  if (!data) return "00000000";
  return createHash("sha256").update(data).digest("hex");
}

// Hash of the style/brand only — stable across all lots of the same project
export function styleHash(manifest: ProjectManifest): string {
  return sha256(JSON.stringify(manifest.style)).slice(0, 8);
}

// Hash of the geometry only — unique per lot/floor plan
export function geometryHash(manifest: ProjectManifest): string {
  return sha256(JSON.stringify(manifest.geometry)).slice(0, 8);
}

// Combined hash — changes if either brand or geometry changes
export function shortHash(manifest: ProjectManifest): string {
  return sha256(JSON.stringify(manifest)).slice(0, 8);
}
