import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";
import { runRegistrySync } from "@/lib/registry/sync";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  let body: {
    mode?: "incremental" | "page" | "enrich";
    maxPages?: number;
    pageSize?: number;
    startPage?: number;
    listOnly?: boolean;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // empty body ok
  }

  const result = await runRegistrySync({
    db,
    mode: body.mode || "page",
    maxPages: Math.min(Math.max(body.maxPages ?? 1, 1), 20),
    pageSize: body.pageSize,
    startPage: body.startPage,
    listOnly: body.listOnly,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}

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
    .from("trademark_import_state")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return NextResponse.json({ ok: true, state: data });
}
