import { NextRequest, NextResponse } from "next/server";
import { analyzeProject } from "@/lib/analyze";
import { ascentManifest } from "@/lib/ascent-manifest";

function hasRealCredentials(): boolean {
  const key = process.env.OPENAI_API_KEY ?? "";
  return key.length > 0 && key !== "your_key_here";
}

export async function POST(req: NextRequest) {
  const { floorPlan, renders, brandGuide, projectName, projectId } = await req.json();

  if (!floorPlan) {
    return NextResponse.json({ error: "floorPlan (data URL) is required" }, { status: 400 });
  }

  if (!hasRealCredentials()) {
    return NextResponse.json(ascentManifest, {
      headers: { "X-Manifest-Source": "demo-fallback" },
    });
  }

  try {
    const manifest = await analyzeProject(
      floorPlan,
      renders ?? [],
      brandGuide ?? null,
      projectId ?? "new-project",
      projectName ?? "New Project"
    );

    return NextResponse.json(manifest, {
      headers: { "X-Manifest-Source": "gpt-4o-vision" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    console.error("[/api/analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(ascentManifest);
}
