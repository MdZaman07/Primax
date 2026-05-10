import { NextRequest, NextResponse } from "next/server";
import { listBrands, saveBrand } from "@/lib/brandStore";
import { StyleManifestSchema } from "@/lib/manifest";

export async function GET() {
  try {
    const brands = await listBrands();
    return NextResponse.json(brands);
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    console.error("[GET /api/brands]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Allow uploading a new brand via POST (future: brand upload UI)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, name, developer, description, style } = body;
    if (!key || !name || !style) {
      return NextResponse.json({ error: "key, name, and style are required" }, { status: 400 });
    }
    const parsedStyle = StyleManifestSchema.parse(style);
    await saveBrand({ key, name, developer: developer ?? "", description: description ?? "", style: parsedStyle });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
