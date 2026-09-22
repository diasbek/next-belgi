import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
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

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof body.code === "string" && body.code.trim()) patch.code = body.code.trim();
  if (typeof body.title_uz === "string") patch.title_uz = body.title_uz.trim();
  if (typeof body.title_ru === "string") patch.title_ru = body.title_ru.trim();
  if (typeof body.title_en === "string") patch.title_en = body.title_en.trim();
  if (typeof body.credits === "number" && body.credits > 0) patch.credits = body.credits;
  if (typeof body.price_uzs === "number" && body.price_uzs > 0) {
    patch.price_uzs = body.price_uzs;
  }
  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.sort === "number") patch.sort = body.sort;

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
  }

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { data, error } = await service
    .from("billing_plans")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, plan: data });
}
