import OpenAI from "openai";
import { ProjectManifestSchema, type ProjectManifest } from "./manifest";

function buildClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") return null;
  return new OpenAI({ apiKey });
}

// Strip markdown code fences GPT-4o sometimes adds despite instructions
function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

// Normalize values GPT-4o returns that don't match our enum literals
function normalizeGeometry(raw: unknown): unknown {
  const TYPE_MAP: Record<string, string> = {
    terrace: "balcony", patio: "balcony", deck: "balcony", courtyard: "balcony",
    lounge: "living", "living room": "living", "sitting room": "living",
    "dining room": "dining",
    "master bedroom": "bedroom", "bed room": "bedroom",
    "en suite": "bathroom", ensuite: "bathroom", "powder room": "bathroom", toilet: "bathroom", wc: "bathroom",
    "laundry room": "laundry", utility: "laundry",
    corridor: "hall", hallway: "hall", entry: "hall", foyer: "hall",
    "home office": "study", office: "study",
    "walk-in robe": "closet", "walk-in wardrobe": "closet", "walk-in closet": "closet",
    wardrobe: "closet", robe: "closet", wir: "closet", wic: "closet", "dressing room": "closet",
    "linen cupboard": "closet", "linen": "closet", storage: "closet",
  };
  const WALL_MAP: Record<string, string> = {
    north: "n", south: "s", east: "e", west: "w",
  };

  const g = raw as { rooms?: unknown[] };
  if (!Array.isArray(g.rooms)) return raw;

  g.rooms = g.rooms.map((r) => {
    const room = r as Record<string, unknown>;
    const rawType = String(room.type ?? "").toLowerCase().trim();
    room.type = TYPE_MAP[rawType] ?? rawType;

    const normalizeOpenings = (arr: unknown[]) =>
      arr.map((o) => {
        const op = o as Record<string, unknown>;
        const rawWall = String(op.wall ?? "").toLowerCase().trim();
        op.wall = WALL_MAP[rawWall] ?? rawWall;
        return op;
      });

    if (Array.isArray(room.doors)) room.doors = normalizeOpenings(room.doors);
    if (Array.isArray(room.windows)) room.windows = normalizeOpenings(room.windows);
    return room;
  });

  return raw;
}

const GEOMETRY_PROMPT = `You are a floor plan analyst extracting precise room data from a 2D architectural floor plan image.

Return ONLY a JSON object with this exact shape:
{
  "totalAreaM2": <number>,
  "rooms": [
    {
      "id": "<unique-slug e.g. bed-01, living, robe-01>",
      "type": "<one of: living|dining|kitchen|bedroom|bathroom|laundry|balcony|hall|study|closet>",
      "label": "<short display name e.g. Bed 01, Living, WIR, Ensuite>",
      "bounds": { "x": <metres from origin>, "y": <metres from origin>, "w": <width metres>, "h": <depth metres> },
      "doors": [{ "wall": "<n|s|e|w>", "position": <0.0–1.0 along wall>, "width": <metres> }],
      "windows": [{ "wall": "<n|s|e|w>", "position": <0.0–1.0 along wall>, "width": <metres> }]
    }
  ]
}

Room type rules — map EVERY labelled space:
- living / dining / kitchen / bedroom / bathroom / laundry / balcony / hall / study — as labeled
- closet = any walk-in robe (WIR), walk-in wardrobe (WIW), walk-in closet (WIC), robe, dressing room, linen cupboard, storage room

Dimension rules:
- Use labelled dimensions from the plan if printed (e.g. "3.2 x 4.5" means w=3.2 h=4.5).
- If no labels, estimate proportionally. A typical 2-bed apartment totals 70–90 m². A 3-bed is 100–130 m².
- Place rooms on a non-overlapping grid. Use x=0, y=0 for top-left interior room. Rooms share walls — they should be flush against each other.
- Closet/robe rooms typically measure 1.0–2.5 m wide × 1.0–2.5 m deep.
- Balconies/terraces are open areas outside the main envelope — include them.

Accuracy rules:
- Extract EVERY room visible, including small ones (WIR, ensuite, laundry, store).
- Do NOT invent rooms. Only extract spaces clearly visible in the plan.
- Walls are ~0.1–0.2 m thick — do not add wall thickness to room dimensions.
- Return ONLY the JSON, no markdown, no explanation.`;

const STYLE_PROMPT = `You are a design analyst extracting brand identity and interior finish data for a property developer.
You will receive two types of images — read them with completely separate eyes:

SOURCE A — RENDERS (interior photography): tells you the physical finishes of this specific apartment
SOURCE B — BRAND GUIDE (designer/developer identity document, if present): tells you the brand colours, typography, logo

Return ONLY this JSON object:
{
  "palette": [
    { "name": "<colour name from brand guide>", "hex": "<exact #rrggbb from brand swatch>", "role": "brand-primary" },
    { "name": "<colour name>",                  "hex": "<exact #rrggbb>",                   "role": "brand-secondary" },
    { "name": "<colour name>",                  "hex": "<exact #rrggbb>",                   "role": "soft-accent" },
    { "name": "<colour name>",                  "hex": "<exact #rrggbb>",                   "role": "background" }
  ],
  "materials": {
    "flooring": { "type": "<timber-pale|timber-dark|tile-white|tile-grey|carpet|concrete>", "hex": "<exact floor hex sampled from renders>" },
    "walls":    { "type": "<paint-white|paint-off-white|paint-grey|etc>",                   "hex": "<exact wall hex sampled from renders>" },
    "ceiling":  { "type": "<paint-white|etc>",                                               "hex": "<exact ceiling hex from renders>" }
  },
  "furniture": {
    "style": "<contemporary-minimal|modern-classic|scandinavian|industrial|etc>",
    "primaryTones": [
      "<main upholstery hex — sofa body, chair seat, bed frame colour seen in renders>",
      "<dark accent hex — coffee table, nightstand, pendant light, TV unit colour seen in renders>",
      "<warm/throw accent hex — bed throw, decorative cushion not from brand palette, seen in renders>"
    ]
  },
  "typography": { "heading": "<exact font name from brand guide, or Inter if not found>", "body": "<exact font name, or Inter>" }
}

Extraction rules — READ CAREFULLY:
BRAND GUIDE → palette only:
  - brand-primary   = darkest/strongest brand colour (e.g. deep maroon #410e2b, navy, forest green)
  - brand-secondary = supporting brand colour (e.g. muted mauve, soft blue, sage)
  - soft-accent     = light tint or tertiary brand colour
  - background      = lightest/cream/white tone from brand palette
  - Extract hex values by sampling the actual colour swatches shown — be precise

RENDERS → materials + furniture only:
  - flooring.hex: sample the floor surface directly — pale blonde timber ≈ #D8CCBA, warm oak ≈ #C4956A, white tile ≈ #E8E8E8
  - walls.hex: sample the wall paint — pure white ≈ #FFFFFF, off-white ≈ #F8F6F2, light grey ≈ #EAEAEA
  - furniture.primaryTones[0]: the main upholstery/body colour — if sofas and chairs are white/cream, give that hex
  - furniture.primaryTones[1]: the darkest furniture accent — pendant lights, side tables, TV units
  - furniture.primaryTones[2]: warm accent tone — bed throw, decorative textile not from brand palette

CRITICAL: brand guide palette colours must NOT be used for materials or furniture tones. Keep them completely separate.
If no brand guide image is provided, default palette to: ["#2C2C2C","#888888","#CCCCCC","#F5F5F0"].
Return ONLY the JSON object, no markdown, no code fences, no explanation.`;

// Accepts full data URLs (e.g. "data:image/png;base64,iVBOR...") — preserves correct MIME type
export async function analyzeProject(
  floorPlanDataUrl: string,
  renderDataUrls: string[],
  brandGuideDataUrl: string | null,
  projectId: string,
  projectName: string
): Promise<ProjectManifest> {
  const client = buildClient();
  if (!client) throw new Error("OpenAI API key not configured");

  const styleImages: OpenAI.Chat.ChatCompletionContentPart[] = [
    ...renderDataUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url, detail: "high" as const },
    })),
    ...(brandGuideDataUrl
      ? [{ type: "image_url" as const, image_url: { url: brandGuideDataUrl, detail: "high" as const } }]
      : []),
  ];

  const [geometryRes, styleRes] = await Promise.all([
    client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: GEOMETRY_PROMPT },
            { type: "image_url", image_url: { url: floorPlanDataUrl, detail: "high" } },
          ],
        },
      ],
      max_tokens: 2000,
    }),
    styleImages.length > 0
      ? client.chat.completions.create({
          model: "gpt-4o",
          temperature: 0,
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: STYLE_PROMPT }, ...styleImages],
            },
          ],
          max_tokens: 1500,
        })
      : Promise.resolve(null),
  ]);

  const geometryText = stripFences(geometryRes.choices[0].message.content ?? "{}");
  const styleText = styleRes
    ? stripFences(styleRes.choices[0].message.content ?? "{}")
    : "{}";

  const geometry = normalizeGeometry(JSON.parse(geometryText));
  const style = JSON.parse(styleText);

  // If no style images were provided, fall back to neutral brand colours
  const finalStyle = styleImages.length === 0 ? {
    palette: [
      { name: "Primary",   hex: "#2C2C2C", role: "brand-primary" },
      { name: "Secondary", hex: "#888888", role: "brand-secondary" },
      { name: "Accent",    hex: "#CCCCCC", role: "soft-accent" },
      { name: "Background",hex: "#F5F5F0", role: "background" },
    ],
    materials: {
      flooring: { type: "timber", hex: "#C4956A" },
      walls:    { type: "paint-white", hex: "#F8F6F3" },
      ceiling:  { type: "paint-white", hex: "#FFFFFF" },
    },
    furniture: { style: "contemporary-minimal", primaryTones: ["#EDEAE3", "#1C1C1C", "#C8860A"] },
    typography: { heading: "Inter", body: "Inter" },
  } : style;

  const raw = {
    project: { id: projectId, name: projectName, version: "1.0.0" },
    style: finalStyle,
    geometry,
  };

  return ProjectManifestSchema.parse(raw);
}
