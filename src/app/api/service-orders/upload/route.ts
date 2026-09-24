import { NextResponse } from "next/server";
import { getSessionUserId, getServiceClient } from "@/lib/auth/session";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);

/** Upload a filing package file to the filing-uploads bucket. */
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const file = form.get("file");
  const orderId = String(form.get("orderId") || "").trim();
  if (!(file instanceof File) || !orderId) {
    return NextResponse.json({ error: "file_and_order_required" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }
  if (file.type && !ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "type_not_allowed" }, { status: 400 });
  }

  const { data: order } = await db
    .from("service_orders")
    .select("id, user_id, payload")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.user_id !== userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
  const path = `${userId}/${orderId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await db.storage
    .from("filing-uploads")
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 400 });
  }

  const prev = (order.payload as Record<string, unknown>) || {};
  const files = Array.isArray(prev.files) ? [...prev.files] : [];
  files.push({
    path,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  });

  await db
    .from("service_orders")
    .update({
      payload: { ...prev, files },
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return NextResponse.json({ ok: true, path });
}
