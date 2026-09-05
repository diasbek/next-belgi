import { NextResponse } from "next/server";
import { runTrademarkCheck } from "@/lib/check/client";
import { requireUserApi } from "@/lib/auth/session";
import {
  debitCheckCredit,
  linkCheckEntitlement,
  refundCheckCredit,
} from "@/lib/billing/credits";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import {
  checkResumePath,
  parseCheckActionPath,
} from "@/lib/navigation/safe-next";

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
  let body: {
    query?: string;
    activity?: string;
    locale?: string;
    actionPath?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const locale: Locale = body.locale === "ru" ? "ru" : "uz";
  const query = (body.query ?? "").trim();
  const activity = (body.activity ?? "").trim();
  const actionPath = parseCheckActionPath(body.actionPath);
  const resume =
    query && activity
      ? checkResumePath(locale, query, activity, actionPath)
      : localePath(locale, actionPath);

  const appUser = await requireUserApi();
  if (!appUser) {
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized",
        redirect: `${localePath(locale, "/login/")}?next=${encodeURIComponent(resume)}`,
      },
      { status: 401 },
    );
  }

  const ip = clientKey(request);
  if (!checkRateLimit(`${appUser.id}:${ip}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const debit = await debitCheckCredit(appUser.id);
  if (!debit.ok) {
    const status = debit.error === "insufficient_credits" ? 402 : 503;
    return NextResponse.json(
      {
        ok: false,
        error: debit.error,
        redirect: `${localePath(locale, "/account/billing/")}?next=${encodeURIComponent(resume)}`,
      },
      { status },
    );
  }

  const result = await runTrademarkCheck({
    query,
    activity,
    locale: body.locale,
    userId: appUser.id,
  });

  if (!result.ok) {
    await refundCheckCredit(debit.ledgerId);
    const status = result.error === "missing_fields" ? 400 : 502;
    return NextResponse.json(result, { status });
  }

  if (result.checkId) {
    await linkCheckEntitlement({
      checkId: result.checkId,
      ledgerId: debit.ledgerId,
      userId: appUser.id,
    });
  }

  return NextResponse.json({
    ...result,
    balanceAfter: appUser.balance - 1,
  });
}
