import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";
import { PATENT_ATTORNEYS } from "@/data/patent-attorneys";

/** Sync static patent attorneys catalogue into patent_attorneys_db. */
export async function POST() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const rows = PATENT_ATTORNEYS.map((a) => ({
    id: a.id,
    number: a.number,
    name: a.name,
    email: a.email || null,
    phone: a.phone || null,
    region: a.region || null,
    district: a.district || null,
    services: a.services || [],
    active: true,
    synced_at: new Date().toISOString(),
  }));

  const { error } = await db.from("patent_attorneys_db").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
