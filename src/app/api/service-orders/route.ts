import { NextResponse } from "next/server";
import { getServiceDb } from "@/lib/db/client";
import { getSessionUserId } from "@/lib/auth/session";
import { isServiceSlug } from "@/data/services-catalog";
import { sendResendEmail } from "@/lib/notifications/resend";
import { sendTelegramMessage } from "@/lib/notifications/telegram";
import { getIntegration } from "@/lib/integrations/store";

type Body = {
  serviceSlug?: string;
  locale?: string;
  payload?: Record<string, unknown>;
  checkId?: string;
  attorneyId?: string;
  website?: string;
  status?: "draft" | "submitted";
};

const rateMap = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count += 1;
  return true;
}

async function notify(order: {
  id: string;
  service_slug: string;
  payload: Record<string, unknown>;
}) {
  const text = `Belgi service order ${order.service_slug} ${order.id}\n\n${JSON.stringify(order.payload, null, 2)}`;
  try {
    const cfg = await getIntegration("resend");
    if (cfg?.api_key && cfg.notify_to) {
      await sendResendEmail({
        to: cfg.notify_to,
        subject: `[Belgi] Order ${order.service_slug} ${order.id}`,
        text,
        kind: "lead",
      });
    }
  } catch {
    /* ignore */
  }
  try {
    await sendTelegramMessage(text);
  } catch {
    /* ignore */
  }
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ id: "honeypot", ok: true });
  }

  if (!checkRateLimit(clientKey(request))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const slug = String(body.serviceSlug || "");
  if (!isServiceSlug(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
  const status = body.status === "draft" ? "draft" : "submitted";
  const userId = await getSessionUserId();
  const db = getServiceDb();

  if (!db) {
    // Soft-ok without DB so marketing forms still feel successful in local mock
    const id = `local-${Date.now().toString(36)}`;
    return NextResponse.json({ id, ok: true, mocked: true });
  }

  // B2B waitlist also creates organizations row
  let orgId: string | null = null;
  if (slug === "attorney-access") {
    const orgName = String(payload.orgName || payload.company || "Waitlist org").trim();
    const { data: org, error: orgErr } = await db
      .from("organizations")
      .insert({
        name: orgName,
        status: "waitlist",
        registries: String(payload.registries || "")
          .split(/[,;]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        volume_hint: String(payload.volume || "") || null,
        contact_email: String(payload.email || "") || null,
        contact_name: String(payload.name || "") || null,
        contact_phone: String(payload.phone || "") || null,
        notes: String(payload.message || "") || null,
        created_by: userId,
      })
      .select("id")
      .single();
    if (!orgErr && org) orgId = org.id;
  }

  const { data, error } = await db
    .from("service_orders")
    .insert({
      user_id: userId,
      service_slug: slug,
      status,
      payload,
      check_id: body.checkId ? String(body.checkId) : null,
      attorney_id: body.attorneyId ? String(body.attorneyId) : null,
      org_id: orgId,
      locale: body.locale || "uz",
    })
    .select("id, service_slug, status, payload")
    .single();

  if (error || !data) {
    console.error("[service-orders]", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  await db.from("service_order_events").insert({
    order_id: data.id,
    from_status: null,
    to_status: status,
    actor_id: userId,
    note: "created",
  });

  if (status === "submitted") {
    void notify({
      id: data.id,
      service_slug: data.service_slug,
      payload: (data.payload as Record<string, unknown>) || {},
    });
  }

  return NextResponse.json({ id: data.id, ok: true, status: data.status });
}

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = getServiceDb();
  if (!db) {
    return NextResponse.json({ items: [] });
  }

  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") !== "0";

  let q = db
    .from("service_orders")
    .select(
      "id, service_slug, status, payload, check_id, attorney_id, org_id, locale, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (mine) q = q.eq("user_id", userId);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ items: data || [] });
}
