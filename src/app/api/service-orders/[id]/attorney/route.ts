import { NextResponse } from "next/server";
import {
  requireAdminApi,
  getServiceClient,
  getSessionUserId,
} from "@/lib/auth/session";

/** Attach a patent attorney to a service order. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  const admin = await requireAdminApi();
  if (!userId && !admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: { attorneyId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const attorneyId = String(body.attorneyId || "").trim();
  if (!attorneyId) {
    return NextResponse.json({ error: "attorney_required" }, { status: 400 });
  }

  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const { data: order } = await db
    .from("service_orders")
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!admin && order.user_id !== userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await db.from("patent_attorneys_db").upsert(
    { id: attorneyId, name: attorneyId, synced_at: new Date().toISOString() },
    { onConflict: "id" },
  );

  const { data, error } = await db
    .from("service_orders")
    .update({
      attorney_id: attorneyId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, attorney_id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  await db.from("service_order_events").insert({
    order_id: id,
    from_status: order.status,
    to_status: order.status,
    note: `attorney_attached:${attorneyId}`,
    actor_id: userId || admin?.id || null,
  });

  return NextResponse.json({ ok: true, order: data });
}
