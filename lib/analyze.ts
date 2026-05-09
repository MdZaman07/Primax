import { AzureOpenAI } from "openai";
import { ProjectManifestSchema, type ProjectManifest } from "./manifest";

function buildClient(): AzureOpenAI | null {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!endpoint || !apiKey) return null;
  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-08-01-preview",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4o",
  });
}

const GEOMETRY_PROMPT = `You are a floor plan analyst. Analyse the 2D floor plan image.
Extract each room and return ONLY a JSON object with this exact shape:
{
  "totalAreaM2": <number>,
  "rooms": [
    {
      "id": "<slug>",
      "type": "<living|dining|kitchen|bedroom|bathroom|laundry|balcony|hall|study>",
      "label": "<display name>",
      "bounds": { "x": <metres>, "y": <metres>, "w": <metres>, "h": <metres> },
      "doors": [{ "wall": "<n|s|e|w>", "position": <0-1>, "width": <metres> }],
      "windows": [{ "wall": "<n|s|e|w>", "position": <0-1>, "width": <metres> }]
    }
  ]
}
Rules:
- Estimate dimensions proportionally in metres. Assume a 2-bedroom apartment is ~80-100 m2 total.
- Place rooms on a grid starting at x=0, y=0 for the first interior room.
- Do NOT invent rooms not visible. Omit windows/doors you cannot see.
- Return ONLY the JSON object, no markdown fences.`;

const STYLE_PROMPT = `You are a design analyst. Analyse the provided renders and brand guide image.
Extract the project style and return ONLY a JSON object with this exact shape:
{
  "palette": [
    { "name": "<name>", "hex": "<#rrggbb>", "role": "<brand-primary|brand-secondary|soft-accent|background>" }
  ],
  "materials": {
    "flooring": { "type": "<material description>", "hex": "<dominant hex>" },
    "walls":    { "type": "<material description>", "hex": "<dominant hex>" },
    "ceiling":  { "type": "<material description>", "hex": "<dominant hex>" }
  },
  "furniture": {
    "style": "<style descriptor>",
    "primaryTones": ["<hex>", "<hex>", "<hex>"]
  },
  "typography": { "heading": "<font name>", "body": "<font name>" }
}
Rules:
- Extract exact hex colours from the brand guide colour palette if visible.
- Match furniture tones from the render images.
- Return ONLY the JSON object, no markdown fences.`;

export async function analyzeProject(
  floorPlanBase64: string,
  renderBase64List: string[],
  brandGuideBase64: string | null,
  projectId: string,
  projectName: string
): Promise<ProjectManifest> {
  const client = buildClient();
  if (!client) throw new Error("Azure OpenAI credentials not configured");

  const styleImages = [
    ...renderBase64List.map((b64) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${b64}`, detail: "high" as const },
    })),
    ...(brandGuideBase64
      ? [{ type: "image_url" as const, image_url: { url: `data:image/png;base64,${brandGuideBase64}`, detail: "high" as const } }]
      : []),
  ];

  const [geometryRes, styleRes] = await Promise.all([
    client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: GEOMETRY_PROMPT },
            { type: "image_url", image_url: { url: `data:image/png;base64,${floorPlanBase64}`, detail: "high" } },
          ],
        },
      ],
      max_tokens: 2000,
    }),
    client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4o",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: STYLE_PROMPT }, ...styleImages],
        },
      ],
      max_tokens: 1500,
    }),
  ]);

  const geometryText = geometryRes.choices[0].message.content ?? "{}";
  const styleText = styleRes.choices[0].message.content ?? "{}";

  const geometry = JSON.parse(geometryText);
  const style = JSON.parse(styleText);

  const raw = {
    project: { id: projectId, name: projectName, version: "1.0.0" },
    style,
    geometry,
  };

  return ProjectManifestSchema.parse(raw);
}
