import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";
import { pauseRegistrySync } from "@/lib/registry/sync";

export async function POST() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }
  const result = await pauseRegistrySync(db);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
