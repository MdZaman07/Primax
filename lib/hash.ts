import { createHash } from "crypto";
import type { ProjectManifest } from "./manifest";

export function manifestHash(manifest: ProjectManifest): string {
  const canonical = JSON.stringify(manifest);
  return createHash("sha256").update(canonical).digest("hex");
}

export function shortHash(manifest: ProjectManifest): string {
  return manifestHash(manifest).slice(0, 8);
}
