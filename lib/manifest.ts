import { z } from "zod";

const WallSide = z.enum(["n", "s", "e", "w"]);

const DoorSchema = z.object({
  wall: WallSide,
  position: z.number().min(0).max(1),
  width: z.number().positive(),
});

const WindowSchema = z.object({
  wall: WallSide,
  position: z.number().min(0).max(1),
  width: z.number().positive(),
});

export const RoomSchema = z.object({
  id: z.string(),
  type: z.enum(["living", "dining", "kitchen", "bedroom", "bathroom", "laundry", "balcony", "hall", "study", "closet"]),
  label: z.string(),
  bounds: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
  doors: z.array(DoorSchema),
  windows: z.array(WindowSchema),
});

// Richer optional observation data extracted from renders — used when available, ignored when not
const RoomObservationSchema = z.object({
  roomType: z.string(),
  notes: z.string(),                          // free-text from GPT-4o e.g. "curved sectional, white marble table"
  keyMaterials: z.array(z.string()).optional(), // e.g. ["brushed brass tapware", "fluted oak cabinetry"]
});

export const StyleManifestSchema = z.object({
  palette: z.array(z.object({
    name: z.string(),
    hex: z.string(),
    role: z.string(), // brand-primary | brand-secondary | soft-accent | background (+ any extras)
  })).min(1),
  materials: z.object({
    flooring: z.object({ type: z.string(), hex: z.string() }),
    walls:    z.object({ type: z.string(), hex: z.string() }),
    ceiling:  z.object({ type: z.string(), hex: z.string() }),
    // Optional extended materials when renders provide enough detail
    joinery:  z.object({ type: z.string(), hex: z.string() }).optional(),
    fixtures: z.object({ type: z.string(), hex: z.string() }).optional(),
  }),
  furniture: z.object({
    style: z.string(),
    primaryTones: z.array(z.string()).min(1), // [body, dark accent, warm accent, ...]
    accentTones:  z.array(z.string()).optional(), // additional tones when more detail extracted
  }),
  // Per-room observations from renders — populated when renders are labelled or clearly per-room
  roomObservations: z.array(RoomObservationSchema).optional(),
  typography: z.object({ heading: z.string(), body: z.string() }),
});

export const GeometryManifestSchema = z.object({
  totalAreaM2: z.number(),
  rooms: z.array(RoomSchema),
});

export const ProjectManifestSchema = z.object({
  project: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
  }),
  style: StyleManifestSchema,
  geometry: GeometryManifestSchema,
});

export type Room             = z.infer<typeof RoomSchema>;
export type StyleManifest    = z.infer<typeof StyleManifestSchema>;
export type GeometryManifest = z.infer<typeof GeometryManifestSchema>;
export type ProjectManifest  = z.infer<typeof ProjectManifestSchema>;
