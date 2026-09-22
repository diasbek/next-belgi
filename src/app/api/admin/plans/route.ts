import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: {
    code?: string;
    title_uz?: string;
    title_ru?: string;
    title_en?: string;
    credits?: number;
    price_uzs?: number;
    active?: boolean;
    sort?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const code = body.code?.trim();
  if (
    !code ||
    !body.title_uz?.trim() ||
    !body.title_ru?.trim() ||
    typeof body.credits !== "number" ||
    body.credits <= 0 ||
    typeof body.price_uzs !== "number" ||
    body.price_uzs <= 0
  ) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
  }

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { data, error } = await service
    .from("billing_plans")
    .insert({
      code,
      title_uz: body.title_uz.trim(),
      title_ru: body.title_ru.trim(),
      title_en: (body.title_en ?? body.title_uz).trim(),
      credits: body.credits,
      price_uzs: body.price_uzs,
      active: body.active !== false,
      sort: typeof body.sort === "number" ? body.sort : 0,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, plan: data });
}
