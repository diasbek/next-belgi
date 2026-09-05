import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import {
  buildClickCheckoutUrl,
  buildPaymeCheckoutUrl,
  getPaymentMode,
  paymentsConfigured,
  type PaymentProvider,
} from "@/lib/payments/providers";
import { localePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/config";
import { safeInternalNext } from "@/lib/navigation/safe-next";

export async function POST(request: Request) {
  const appUser = await requireUserApi();
  if (!appUser) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  let body: {
    planId?: string;
    provider?: PaymentProvider;
    locale?: string;
    next?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const provider = body.provider;
  if (provider !== "payme" && provider !== "click") {
    return NextResponse.json({ ok: false, error: "invalid_provider" }, { status: 400 });
  }

  if (!(await paymentsConfigured(provider))) {
    return NextResponse.json(
      { ok: false, error: "payments_not_configured" },
      { status: 503 },
    );
  }

  if (!body.planId) {
    return NextResponse.json({ ok: false, error: "missing_plan" }, { status: 400 });
  }

  const { data: plan, error: planErr } = await db
    .from("billing_plans")
    .select("id, code, credits, price_uzs, active")
    .eq("id", body.planId)
    .eq("active", true)
    .maybeSingle();

  if (planErr || !plan) {
    return NextResponse.json({ ok: false, error: "plan_not_found" }, { status: 404 });
  }

  const mode = await getPaymentMode(provider);

  const { data: payment, error: payErr } = await db
    .from("payments")
    .insert({
      user_id: appUser.id,
      provider,
      plan_id: plan.id,
      amount_uzs: plan.price_uzs,
      credits: plan.credits,
      status: "pending",
      raw: { mode },
    })
    .select("id")
    .maybeSingle();

  if (payErr || !payment) {
    console.warn("[checkout]", payErr?.message);
    return NextResponse.json({ ok: false, error: "payment_create_failed" }, { status: 500 });
  }

  if (mode === "dev") {
    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      mock: true,
      mode: "dev",
    });
  }

  const locale = (body.locale === "ru" ? "ru" : "uz") as Locale;
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;
  const billingPath = localePath(locale, "/account/billing/");
  const returnParams = new URLSearchParams({ paid: payment.id });
  const resume = safeInternalNext(body.next, "");
  if (resume) returnParams.set("next", resume);
  const returnUrl = `${origin}${billingPath}?${returnParams.toString()}`;

  const checkoutUrl =
    provider === "payme"
      ? await buildPaymeCheckoutUrl({
          paymentId: payment.id,
          amountUzs: plan.price_uzs,
          returnUrl,
        })
      : await buildClickCheckoutUrl({
          paymentId: payment.id,
          amountUzs: plan.price_uzs,
          returnUrl,
        });

  if (!checkoutUrl) {
    return NextResponse.json(
      { ok: false, error: "payments_not_configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    paymentId: payment.id,
    checkoutUrl,
    mode,
    mock: false,
  });
}
