import { getDb } from "./db";
import { BRAND_LIBRARY, type BrandEntry } from "./brands";
import type { StyleManifest } from "./manifest";

const COLLECTION = "brands";

export interface BrandDoc {
  key: string;
  name: string;
  developer: string;
  description: string;
  style: StyleManifest;
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

  const docs: BrandDoc[] = BRAND_LIBRARY.map((b) => ({
    key: b.key,
    name: b.name,
    developer: b.developer,
    description: b.description,
    style: b.style,
    seeded: true,
    createdAt: new Date(),
  }));
  await col.insertMany(docs);
}

export async function listBrands(): Promise<BrandEntry[]> {
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
  }));
}

export async function getBrandByKey(key: string): Promise<BrandEntry | null> {
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
  };
}

// Save a brand extracted from a new upload — stored alongside the seeded library entries
export async function saveBrand(entry: BrandEntry): Promise<void> {
  const db = await getDb();
  await db.collection<BrandDoc>(COLLECTION).updateOne(
    { key: entry.key },
    {
      $set: {
        ...entry,
        seeded: false,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}
