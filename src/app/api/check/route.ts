import { NextResponse } from "next/server";
import { runTrademarkCheck } from "@/lib/check/client";

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
  if (entry.count >= 12) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  let body: { query?: string; activity?: string; locale?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const ip = clientKey(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const result = await runTrademarkCheck({
    query: body.query ?? "",
    activity: body.activity ?? "",
    locale: body.locale,
  });

  if (!result.ok) {
    const status = result.error === "missing_fields" ? 400 : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
