import type { ProjectManifest } from "./manifest";
import { getBrand } from "./brands";

// Sanctuary Quarter — Apartment 1.01 (3 Bed, 115m²)
// Style comes from the Ascent brand library entry (extracted once, reused across all lots).
// Geometry is lot-specific: exact labeled dimensions from the 2D plan.

const ascentBrand = getBrand("ascent")!;

export const ascentManifest: ProjectManifest = {
  project: {
    id: "sanctuary-quarter-apt-1-01",
    name: "Sanctuary Quarter — Apartment 1.01",
    version: "1.0.0",
  },
  style: ascentBrand.style,
  geometry: {
    totalAreaM2: 115,
    rooms: [
      // ── Top row ───────────────────────────────────────────────────────────
      {
        id: "dining", type: "dining", label: "Dining",
        bounds: { x: 0, y: 0, w: 3.8, h: 3.0 },
        doors: [], windows: [{ wall: "n", position: 0.3, width: 2.0 }],
      },
      {
        id: "living", type: "living", label: "Living",
        bounds: { x: 3.8, y: 0, w: 3.8, h: 3.3 },
        doors: [], windows: [{ wall: "n", position: 0.2, width: 3.0 }],
      },
      {
        id: "terrace1", type: "balcony", label: "Terrace 1",
        bounds: { x: 7.6, y: 0, w: 4.6, h: 2.1 },
        doors: [], windows: [],
      },

      // ── Middle ────────────────────────────────────────────────────────────
      {
        id: "kitchen", type: "kitchen", label: "Kitchen",
        bounds: { x: 0, y: 3.0, w: 2.8, h: 2.7 },
        doors: [], windows: [{ wall: "w", position: 0.5, width: 1.2 }],
      },
      {
        id: "hall", type: "hall", label: "Hall",
        bounds: { x: 2.8, y: 3.0, w: 1.0, h: 9.4 },
        doors: [], windows: [],
      },
      {
        id: "robe01", type: "closet", label: "Robe",
        bounds: { x: 3.8, y: 3.3, w: 1.2, h: 1.0 },
        doors: [{ wall: "w", position: 0.5, width: 0.9 }], windows: [],
      },
      {
        id: "bed01", type: "bedroom", label: "Bed 01",
        bounds: { x: 5.0, y: 3.3, w: 1.8, h: 3.0 },
        doors: [{ wall: "w", position: 0.8, width: 0.9 }],
        windows: [{ wall: "e", position: 0.3, width: 1.8 }],
      },
      {
        id: "terrace2", type: "balcony", label: "Terrace 2",
        bounds: { x: 6.8, y: 2.1, w: 3.7, h: 4.2 },
        doors: [], windows: [],
      },

      // ── Bath + Bed02 ──────────────────────────────────────────────────────
      {
        id: "bath", type: "bathroom", label: "Bath",
        bounds: { x: 0, y: 5.7, w: 2.8, h: 1.5 },
        doors: [], windows: [],
      },
      {
        id: "robe02", type: "closet", label: "Robe",
        bounds: { x: 3.8, y: 6.3, w: 1.2, h: 1.0 },
        doors: [{ wall: "w", position: 0.5, width: 0.9 }], windows: [],
      },
      {
        id: "bed02", type: "bedroom", label: "Bed 02",
        bounds: { x: 5.0, y: 6.3, w: 1.8, h: 3.0 },
        doors: [{ wall: "w", position: 0.8, width: 0.9 }],
        windows: [{ wall: "e", position: 0.3, width: 1.6 }],
      },

      // ── Bottom ────────────────────────────────────────────────────────────
      {
        id: "laundry", type: "laundry", label: "Laundry",
        bounds: { x: 0, y: 7.2, w: 1.5, h: 0.75 },
        doors: [], windows: [],
      },
      {
        id: "ensuite", type: "bathroom", label: "Ensuite",
        bounds: { x: 1.5, y: 9.3, w: 2.5, h: 1.5 },
        doors: [], windows: [],
      },
      {
        id: "robe03", type: "closet", label: "Robe",
        bounds: { x: 3.8, y: 9.3, w: 1.5, h: 1.2 },
        doors: [{ wall: "w", position: 0.5, width: 0.9 }], windows: [],
      },
      {
        id: "bed03", type: "bedroom", label: "Bed 03",
        bounds: { x: 5.3, y: 9.3, w: 2.5, h: 3.1 },
        doors: [{ wall: "w", position: 0.8, width: 0.9 }],
        windows: [{ wall: "e", position: 0.3, width: 2.0 }],
      },
    ],
  },
};
