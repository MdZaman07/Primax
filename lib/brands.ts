import type { StyleManifest } from "./manifest";

// ── Brand library ─────────────────────────────────────────────────────────────
// Each entry is a StyleManifest extracted once from a developer's renders + brand guide.
// It is applied to any floor plan geometry without re-running AI extraction.
// This is the architectural proof point: brand ⊥ geometry — they vary independently.

export interface BrandEntry {
  key: string;
  name: string;
  developer: string;
  description: string;
  style: StyleManifest;
}

// ── Ascent (Sanctuary Quarter) ────────────────────────────────────────────────
// Source: Ascent brand guide (#410e2b maroon identity) + Sanctuary Quarter renders
// Interior: pale blonde timber floors, white walls, white/cream furniture, black accents
const ascentStyle: StyleManifest = {
  palette: [
    { name: "Maroon",   hex: "#410e2b", role: "brand-primary"   },
    { name: "Mauve",    hex: "#ad95b7", role: "brand-secondary"  },
    { name: "Lavender", hex: "#e4d4ee", role: "soft-accent"      },
    { name: "Cream",    hex: "#f0ece0", role: "background"       },
  ],
  materials: {
    flooring: { type: "timber-pale-blonde", hex: "#D8CCBA" },
    walls:    { type: "paint-white",        hex: "#FFFFFF"  },
    ceiling:  { type: "paint-white",        hex: "#FFFFFF"  },
  },
  furniture: {
    style: "contemporary-minimal",
    primaryTones: ["#F0EDE8", "#1C1C1C", "#C8860A"],
  },
  typography: { heading: "Crista", body: "Liberation Sans" },
};

// ── Zenith (Harbourline Collection) ──────────────────────────────────────────
// Fictional premium developer. Dark luxury aesthetic.
// Brand: deep navy + brushed gold identity
// Interior: dark walnut floors, warm-grey walls, charcoal furniture, gold fixtures
const zenithStyle: StyleManifest = {
  palette: [
    { name: "Navy",       hex: "#0F1F3D", role: "brand-primary"   },
    { name: "Gold",       hex: "#C9A84C", role: "brand-secondary"  },
    { name: "Champagne",  hex: "#E8D8A8", role: "soft-accent"      },
    { name: "Ivory",      hex: "#F8F5EF", role: "background"       },
  ],
  materials: {
    flooring: { type: "timber-dark-walnut", hex: "#6B4226" },
    walls:    { type: "paint-warm-grey",    hex: "#EDEAE5" },
    ceiling:  { type: "paint-white",        hex: "#F5F3EE" },
    fixtures: { type: "brushed-gold",       hex: "#C9A84C" },
  },
  furniture: {
    style: "modern-classic",
    primaryTones: ["#3A3A3A", "#151515", "#A0714A"],
  },
  typography: { heading: "Canela", body: "GT America" },
};

// ── Lumina (Greenfield Residences) ────────────────────────────────────────────
// Fictional eco-contemporary developer. Natural, grounded palette.
// Brand: forest green + terracotta identity
// Interior: concrete-look floors, crisp white walls, natural linen furniture, dark teak accents
const luminaStyle: StyleManifest = {
  palette: [
    { name: "Forest",     hex: "#1E4D2B", role: "brand-primary"   },
    { name: "Terracotta", hex: "#C4622D", role: "brand-secondary"  },
    { name: "Sage",       hex: "#7A9E6E", role: "soft-accent"      },
    { name: "Linen",      hex: "#F4EFE4", role: "background"       },
  ],
  materials: {
    flooring: { type: "concrete-polished", hex: "#9E9890" },
    walls:    { type: "paint-white",       hex: "#FAFAF8" },
    ceiling:  { type: "paint-white",       hex: "#FAFAF8" },
    joinery:  { type: "raw-oak",           hex: "#C4A87A" },
  },
  furniture: {
    style: "scandinavian",
    primaryTones: ["#C8BC9E", "#3D2B18", "#D4922A"],
  },
  typography: { heading: "Freight Display", body: "Aktiv Grotesk" },
};

// ── Public library ─────────────────────────────────────────────────────────────

export const BRAND_LIBRARY: BrandEntry[] = [
  {
    key: "ascent",
    name: "Ascent",
    developer: "Sanctuary Quarter",
    description: "Maroon & mauve identity · pale blonde timber · contemporary minimal",
    style: ascentStyle,
  },
  {
    key: "zenith",
    name: "Zenith",
    developer: "Harbourline Collection",
    description: "Navy & gold identity · dark walnut · modern classic luxury",
    style: zenithStyle,
  },
  {
    key: "lumina",
    name: "Lumina",
    developer: "Greenfield Residences",
    description: "Forest & terracotta identity · polished concrete · Scandinavian eco",
    style: luminaStyle,
  },
];

export function getBrand(key: string): BrandEntry | undefined {
  return BRAND_LIBRARY.find((b) => b.key === key);
}
