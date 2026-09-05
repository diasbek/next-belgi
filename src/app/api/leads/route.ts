import { NextResponse } from "next/server";
import { insertLead, updateLeadStatus } from "@/lib/db";
import type { LeadType } from "@/lib/db/types";
import { sendResendEmail } from "@/lib/notifications/resend";
import { sendTelegramMessage } from "@/lib/notifications/telegram";
import { getIntegration } from "@/lib/integrations/store";

interface LeadPayload {
  type: LeadType;
  locale?: string;
  pageUrl?: string;
  utm?: Record<string, string>;
  requestId?: string;
  website?: string;
  data: Record<string, unknown>;
}

const rateMap = new Map<string, { count: number; resetAt: number }>();
const idempotencyMap = new Map<string, { id: string; createdAt: number }>();

function createLeadId() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BG-${y}${m}${d}-${rand}`;
}

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
  if (entry.count >= 8) return false;
  entry.count += 1;
  return true;
}

function pruneMaps() {
  const now = Date.now();
  for (const [k, v] of idempotencyMap) {
    if (now - v.createdAt > 24 * 60 * 60 * 1000) idempotencyMap.delete(k);
  }
}

function formatLeadText(record: Record<string, unknown>) {
  return JSON.stringify(record, null, 2);
}

async function notifyResend(record: {
  id: string;
  type: LeadType;
  [key: string]: unknown;
}) {
  const cfg = await getIntegration("resend");
  if (!cfg?.api_key || !cfg.notify_to) return false;
  const sent = await sendResendEmail({
    to: cfg.notify_to,
    subject: `[Belgi] ${record.type.toUpperCase()} ${record.id}`,
    text: formatLeadText(record),
    kind: "lead",
  });
  return sent.ok;
}

async function notifyTelegram(record: {
  id: string;
  type: LeadType;
  [key: string]: unknown;
}) {
  const text = `Belgi lead ${record.type.toUpperCase()} ${record.id}\n\n${formatLeadText(record)}`;
  const sent = await sendTelegramMessage(text);
  return sent.ok;
}

export async function POST(request: Request) {
  pruneMaps();

  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ id: createLeadId(), ok: true });
  }

  if (!body.type || !body.data || typeof body.data !== "object") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const ip = clientKey(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (body.requestId && idempotencyMap.has(body.requestId)) {
    const existing = idempotencyMap.get(body.requestId)!;
    return NextResponse.json({ id: existing.id, ok: true, duplicate: true });
  }

  const id = createLeadId();
  if (body.requestId) {
    idempotencyMap.set(body.requestId, { id, createdAt: Date.now() });
  }

  const record = {
    id,
    type: body.type,
    locale: body.locale ?? "uz",
    pageUrl: body.pageUrl ?? "",
    utm: body.utm ?? {},
    createdAt: new Date().toISOString(),
    data: body.data,
  };

  console.info("[lead]", JSON.stringify(record));

  await insertLead({
    id,
    type: body.type,
    locale: record.locale,
    pageUrl: record.pageUrl,
    utm: record.utm,
    requestId: body.requestId ?? null,
    payload: body.data,
    status: "new",
  });

  const notifyResults = await Promise.allSettled([
    notifyResend(record),
    notifyTelegram(record),
  ]);

  let emailOk = false;
  let telegramOk = false;

  notifyResults.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        index === 0 ? "[lead:email]" : "[lead:telegram]",
        result.reason,
      );
      return;
    }
    if (index === 0) emailOk = Boolean(result.value);
    if (index === 1) telegramOk = Boolean(result.value);
  });

  const [resendCfg, telegramCfg] = await Promise.all([
    getIntegration("resend"),
    getIntegration("telegram"),
  ]);
  const notifyConfigured = Boolean(resendCfg || telegramCfg);

  await updateLeadStatus(
    id,
    !notifyConfigured || emailOk || telegramOk ? "sent" : "failed",
  );

  return NextResponse.json({ id, ok: true });
}
