import { NextResponse } from "next/server";
import { Resend } from "resend";

type LeadType = "contact" | "lawyer" | "check";

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
  const apiKey = process.env.RESEND_API_KEY;
  const notifyTo =
    process.env.RESEND_NOTIFY_TO || process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const from = process.env.RESEND_FROM || "Belgi.ai <onboarding@resend.dev>";
  if (!apiKey || !notifyTo) return false;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: notifyTo,
    subject: `[Belgi] ${record.type.toUpperCase()} ${record.id}`,
    text: formatLeadText(record),
  });
  return true;
}

async function notifyTelegram(record: {
  id: string;
  type: LeadType;
  [key: string]: unknown;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const text = `Belgi lead ${record.type.toUpperCase()} ${record.id}\n\n${formatLeadText(record)}`;
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 3900),
        disable_web_page_preview: true,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`telegram_http_${response.status}`);
  }
  return true;
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

  const notifyResults = await Promise.allSettled([
    notifyResend(record),
    notifyTelegram(record),
  ]);

  notifyResults.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        index === 0 ? "[lead:email]" : "[lead:telegram]",
        result.reason,
      );
    }
  });

  return NextResponse.json({ id, ok: true });
}
