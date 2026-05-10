import { getDb } from "./db";
import type { GeometryManifest, StyleManifest } from "./manifest";

const COLLECTION = "projects";

export interface ProjectEntry {
  projectId: string;
  name: string;
  geometry: GeometryManifest;
  extractedStyle: StyleManifest | null;
  defaultBrandKey: string | null; // auto-selected when this project is opened
  analyzedStyleHash: string | null; // SHA-256[:8] of AI-extracted style at analysis time — audit record
  createdAt: string; // ISO string — safe across the server→client boundary
}

export async function seedProjectsIfEmpty(): Promise<void> {
  const db = await getDb();
  const count = await db.collection(COLLECTION).countDocuments();
  if (count > 0) return;

  // Lazy import to avoid circular dependency (ascent-manifest → brands → here)
  const { ascentManifest } = await import("./ascent-manifest");
  const { createHash } = await import("crypto");
  const ascentStyleHash = createHash("sha256")
    .update(JSON.stringify(ascentManifest.style))
    .digest("hex")
    .slice(0, 8);

  await db.collection(COLLECTION).insertOne({
    projectId: ascentManifest.project.id,
    name: ascentManifest.project.name,
    geometry: ascentManifest.geometry,
    extractedStyle: ascentManifest.style,
    defaultBrandKey: "ascent",
    analyzedStyleHash: ascentStyleHash,
    createdAt: new Date().toISOString(),
  });
}

export async function saveProject(entry: Omit<ProjectEntry, "createdAt">): Promise<ProjectEntry> {
  const db = await getDb();
  const doc: ProjectEntry = { ...entry, createdAt: new Date().toISOString() };
  await db.collection(COLLECTION).updateOne(
    { projectId: entry.projectId },
    { $set: doc },
    { upsert: true }
  );
  return doc;
}

export async function listProjects(): Promise<ProjectEntry[]> {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  // Normalize MongoDB Date objects to ISO strings in case of legacy documents
  return docs.map((d) => {
    // Migrate old-format docs: { manifest: ProjectManifest, source, analyzedAt }
    const legacy = d as Record<string, unknown>;
    if (!d.geometry && legacy.manifest && typeof legacy.manifest === "object") {
      const m = legacy.manifest as { geometry?: unknown; style?: unknown };
      return {
        projectId: d.projectId,
        name: d.name,
        geometry: m.geometry,
        extractedStyle: m.style ?? null,
        createdAt:
          d.createdAt instanceof Date
            ? d.createdAt.toISOString()
            : String((legacy.analyzedAt instanceof Date ? legacy.analyzedAt.toISOString() : legacy.analyzedAt) ?? ""),
      } as unknown as ProjectEntry;
    }
    return {
      ...d,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt ?? ""),
    } as unknown as ProjectEntry;
  });
}

export async function getProject(projectId: string): Promise<ProjectEntry | null> {
  const db = await getDb();
  const doc = await db
    .collection(COLLECTION)
    .findOne({ projectId }, { projection: { _id: 0 } });
  if (!doc) return null;
  return {
    ...doc,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? ""),
  } as unknown as ProjectEntry;
}
