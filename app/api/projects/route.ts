import { NextRequest, NextResponse } from "next/server";
import { listProjects, saveProject } from "@/lib/projectStore";
import { GeometryManifestSchema, StyleManifestSchema } from "@/lib/manifest";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json(projects);
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, name, geometry, extractedStyle, defaultBrandKey } = body;

    if (!projectId || !name || !geometry) {
      return NextResponse.json({ error: "projectId, name, and geometry are required" }, { status: 400 });
    }

    const parsedGeometry = GeometryManifestSchema.parse(geometry);
    const parsedStyle = extractedStyle ? StyleManifestSchema.parse(extractedStyle) : null;

    const saved = await saveProject({
      projectId,
      name,
      geometry: parsedGeometry,
      extractedStyle: parsedStyle,
      defaultBrandKey: defaultBrandKey ?? null,
    });

    return NextResponse.json(saved);
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
