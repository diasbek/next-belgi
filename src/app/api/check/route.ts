import { NextResponse } from "next/server";
import { runTrademarkCheck } from "@/lib/check/client";
import { buildMockReport } from "@/lib/check/mock";
import {
  classifyActivity,
  resolveActivityClassification,
} from "@/lib/classify";
import { requireUserApi } from "@/lib/auth/session";
import {
  debitCheckCredit,
  linkCheckEntitlement,
  refundCheckCredit,
} from "@/lib/billing/credits";
import { parseLocale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import {
  checkResumePath,
  parseCheckActionPath,
} from "@/lib/navigation/safe-next";
import type { CheckRequest } from "@/lib/check/types";

const rateMap = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, limit: number) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  let body: {
    query?: string;
    activity?: string;
    locale?: string;
    actionPath?: string;
    niceSelection?: CheckRequest["niceSelection"];
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const locale = parseLocale(body.locale);
  const query = (body.query ?? "").trim();
  const activity = (body.activity ?? "").trim();
  const actionPath = parseCheckActionPath(body.actionPath);
  const niceSelection = body.niceSelection;
  const resume =
    query && activity
      ? checkResumePath(locale, query, activity, actionPath)
      : localePath(locale, actionPath);

  if (!query || !activity) {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 400 },
    );
  }

  const ip = clientKey(request);
  const appUser = await requireUserApi();

  // Guest: soft preview (mock only, no debit) — client shows blurred result + auth CTA
  if (!appUser) {
    if (!checkRateLimit(`guest:${ip}`, 8)) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 },
      );
    }
    const fromSelection = await resolveActivityClassification({
      activity,
      locale,
      niceSelection,
    });
    const classification =
      fromSelection ?? (await classifyActivity({ activity, locale }));
    const report = buildMockReport(query, activity, classification, locale);
    return NextResponse.json({
      ok: true,
      preview: true,
      source: "mock",
      report,
      loginRedirect: `${localePath(locale, "/login/")}?next=${encodeURIComponent(resume)}`,
    });
  }

  if (!checkRateLimit(`${appUser.id}:${ip}`, 12)) {
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
    niceSelection,
    userId: appUser.id,
  });

  if (!result.ok) {
    await refundCheckCredit(debit.ledgerId);
    const status = result.error === "missing_fields" ? 400 : 502;
    return NextResponse.json(result, { status });
  }

  if (!result.checkId) {
    await refundCheckCredit(debit.ledgerId);
    return NextResponse.json(
      { ok: false, error: "persist_failed" },
      { status: 500 },
    );
  }

  await linkCheckEntitlement({
    checkId: result.checkId,
    ledgerId: debit.ledgerId,
    userId: appUser.id,
  });

  return NextResponse.json({
    ...result,
    preview: false,
    balanceAfter: appUser.balance - 1,
  });
}
