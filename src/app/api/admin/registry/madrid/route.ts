import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";
import { importMadridDump } from "@/lib/registry/madrid-import";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }
  const { data } = await db
    .from("madrid_import_state")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  const { count } = await db
    .from("trademarks")
    .select("id", { count: "exact", head: true })
    .eq("source", "madrid")
    .eq("active", true);
  return NextResponse.json({
    ok: true,
    state: data,
    madridCount: count ?? 0,
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";
  let content = "";
  let fileLabel = "upload";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (file && typeof file === "object" && "text" in file) {
      const f = file as File;
      content = await f.text();
      fileLabel = f.name || "upload";
    } else {
      content = String(form.get("content") || "");
      fileLabel = String(form.get("fileLabel") || "paste");
    }
  } else {
    try {
      const body = (await request.json()) as {
        content?: string;
        fileLabel?: string;
      };
      content = body.content || "";
      fileLabel = body.fileLabel || "json";
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_body" },
        { status: 400 },
      );
    }
  }

  if (!content.trim()) {
    return NextResponse.json(
      { ok: false, error: "empty_content" },
      { status: 400 },
    );
  }

  const result = await importMadridDump({ content, fileLabel });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
