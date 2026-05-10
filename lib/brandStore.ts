import { getDb } from "./db";
import { BRAND_LIBRARY, type BrandEntry } from "./brands";
import type { StyleManifest } from "./manifest";

const COLLECTION = "brands";

// BrandRecord is what the DB returns — BrandEntry + the computed style fingerprint
export type BrandRecord = BrandEntry & { styleHash: string };

export interface BrandDoc {
  key: string;
  name: string;
  developer: string;
  description: string;
  style: StyleManifest;
  styleHash: string;    // SHA-256[:8] of style — brand identity fingerprint
  seeded: boolean;      // true = came from the static library, false = user-uploaded
  createdAt: Date;
}

// Auto-seed the 3 library brands if the collection is empty.
// Called once from page.tsx at request time — idempotent.
export async function seedBrandsIfEmpty(): Promise<void> {
  const db = await getDb();
  const col = db.collection<BrandDoc>(COLLECTION);
  const count = await col.countDocuments();
  if (count > 0) return;

  await col.createIndex({ key: 1 }, { unique: true });

  const { createHash } = await import("crypto");
  const docs: BrandDoc[] = BRAND_LIBRARY.map((b) => ({
    key: b.key,
    name: b.name,
    developer: b.developer,
    description: b.description,
    style: b.style,
    styleHash: createHash("sha256").update(JSON.stringify(b.style)).digest("hex").slice(0, 8),
    seeded: true,
    createdAt: new Date(),
  }));
  await col.insertMany(docs);
}

export async function listBrands(): Promise<BrandRecord[]> {
  const db = await getDb();
  const docs = await db
    .collection<BrandDoc>(COLLECTION)
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: 1 })
    .toArray();

  return docs.map((d) => ({
    key: d.key,
    name: d.name,
    developer: d.developer,
    description: d.description,
    style: d.style,
    styleHash: d.styleHash ?? "00000000",
  }));
}

export async function getBrandByKey(key: string): Promise<BrandRecord | null> {
  const db = await getDb();
  const doc = await db
    .collection<BrandDoc>(COLLECTION)
    .findOne({ key }, { projection: { _id: 0 } });
  if (!doc) return null;
  return {
    key: doc.key,
    name: doc.name,
    developer: doc.developer,
    description: doc.description,
    style: doc.style,
    styleHash: doc.styleHash ?? "00000000",
  };
}

// Save a brand extracted from a new upload — stored alongside the seeded library entries
export async function saveBrand(entry: BrandEntry): Promise<{ styleHash: string }> {
  const { createHash } = await import("crypto");
  const hash = createHash("sha256").update(JSON.stringify(entry.style)).digest("hex").slice(0, 8);
  const db = await getDb();
  await db.collection<BrandDoc>(COLLECTION).updateOne(
    { key: entry.key },
    {
      $set: {
        ...entry,
        styleHash: hash,
        seeded: false,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  return { styleHash: hash };
}
