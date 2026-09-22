import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";

type CreateBody = {
  transliteration?: string;
  number?: string;
  status?: string;
  trademark_type?: string;
  applicant?: string;
  owner?: string;
  logo?: string;
  address?: string;
  colors?: string;
  mgs?: Array<{ class_number: number; text_uz?: string; text_ru?: string }>;
};

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const transliteration = body.transliteration?.trim();
  if (!transliteration && !body.number?.trim()) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
  }

  const { data, error } = await db
    .from("trademarks")
    .insert({
      transliteration: transliteration || null,
      number: body.number?.trim() || null,
      status: body.status?.trim() || "DRAFT",
      trademark_type: body.trademark_type?.trim() || "WORD",
      applicant: body.applicant?.trim() || null,
      owner: body.owner?.trim() || null,
      logo: body.logo?.trim() || null,
      address: body.address?.trim() || null,
      colors: body.colors?.trim() || null,
      source: "manual",
      active: true,
      field_locks: [],
      created_by: admin.id,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || "create_failed" },
      { status: 400 },
    );
  }

  const mgs = (body.mgs || []).filter(
    (m) => m.class_number >= 1 && m.class_number <= 45,
  );
  if (mgs.length) {
    await db.from("trademark_mgs").insert(
      mgs.map((m) => ({
        trademark_id: data.id,
        class_number: m.class_number,
        text_uz: m.text_uz ?? null,
        text_ru: m.text_ru ?? null,
        adliya_mgs_id: null,
      })),
    );
  }

  return NextResponse.json({ ok: true, row: data });
}
