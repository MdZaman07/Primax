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
  type: z.enum(["living", "dining", "kitchen", "bedroom", "bathroom", "laundry", "balcony", "hall", "study"]),
  label: z.string(),
  bounds: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
  doors: z.array(DoorSchema),
  windows: z.array(WindowSchema),
});

export const ProjectManifestSchema = z.object({
  project: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
  }),
  style: z.object({
    palette: z.array(z.object({ name: z.string(), hex: z.string(), role: z.string() })),
    materials: z.object({
      flooring: z.object({ type: z.string(), hex: z.string() }),
      walls: z.object({ type: z.string(), hex: z.string() }),
      ceiling: z.object({ type: z.string(), hex: z.string() }),
    }),
    furniture: z.object({
      style: z.string(),
      primaryTones: z.array(z.string()),
    }),
    typography: z.object({ heading: z.string(), body: z.string() }),
  }),
  geometry: z.object({
    totalAreaM2: z.number(),
    rooms: z.array(RoomSchema),
  }),
});

export type Room = z.infer<typeof RoomSchema>;
export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
