import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await context.params;
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  let body: {
    mgs?: Array<{
      class_number: number;
      text_uz?: string | null;
      text_ru?: string | null;
    }>;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const mgs = (body.mgs || []).filter(
    (m) => m.class_number >= 1 && m.class_number <= 45,
  );

  // Replace manual MGS only (keep adliya-synced rows intact unless full replace requested)
  await db
    .from("trademark_mgs")
    .delete()
    .eq("trademark_id", id)
    .is("adliya_mgs_id", null);

  if (mgs.length) {
    const { error } = await db.from("trademark_mgs").insert(
      mgs.map((m) => ({
        trademark_id: id,
        class_number: m.class_number,
        text_uz: m.text_uz ?? null,
        text_ru: m.text_ru ?? null,
        adliya_mgs_id: null,
      })),
    );
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
  }

  const { data } = await db
    .from("trademark_mgs")
    .select("*")
    .eq("trademark_id", id)
    .order("class_number");

  return NextResponse.json({ ok: true, mgs: data || [] });
}
