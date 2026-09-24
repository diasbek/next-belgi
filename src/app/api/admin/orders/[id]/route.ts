import { NextResponse } from "next/server";
import { getServiceDb } from "@/lib/db/client";
import { requireAdminApi } from "@/lib/auth/session";

const STATUSES = ["draft", "submitted", "in_progress", "done", "cancelled"] as const;

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  let body: { status?: string; attorneyId?: string | null; note?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const { data: existing } = await db
    .from("service_orders")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status && (STATUSES as readonly string[]).includes(body.status)) {
    patch.status = body.status;
  }
  if (body.attorneyId !== undefined) {
    patch.attorney_id = body.attorneyId;
  }

  const { data, error } = await db
    .from("service_orders")
    .update(patch)
    .eq("id", id)
    .select("id, status, attorney_id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (body.status && body.status !== existing.status) {
    await db.from("service_order_events").insert({
      order_id: id,
      from_status: existing.status,
      to_status: body.status,
      note: body.note || null,
      actor_id: admin.id,
    });
  }

  return NextResponse.json({ ok: true, order: data });
}
