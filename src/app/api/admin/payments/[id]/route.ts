import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";

export async function PATCH(
  _request: Request,
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

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { data: row, error: fetchError } = await service
    .from("payments")
    .select("id, raw")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !row) {
    return NextResponse.json(
      { ok: false, error: fetchError?.message || "not_found" },
      { status: fetchError ? 400 : 404 },
    );
  }

  const prev =
    row.raw && typeof row.raw === "object" && !Array.isArray(row.raw)
      ? (row.raw as Record<string, unknown>)
      : {};

  const raw = {
    ...prev,
    reviewed: true,
    reviewed_at: new Date().toISOString(),
    reviewed_by: admin.id,
  };

  const { error } = await service.from("payments").update({ raw }).eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, raw });
}
