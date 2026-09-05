import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { creditPurchase } from "@/lib/billing/credits";
import { getPaymentMode } from "@/lib/payments/providers";

/** Dev-mode acquiring: credit wallet without redirect to Payme/Click. */
export async function POST(request: Request) {
  const appUser = await requireUserApi();
  if (!appUser) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { paymentId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.paymentId) {
    return NextResponse.json({ ok: false, error: "missing_payment" }, { status: 400 });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { data: payment } = await db
    .from("payments")
    .select("id, user_id, provider, status")
    .eq("id", body.paymentId)
    .maybeSingle();

  if (!payment || payment.user_id !== appUser.id) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (payment.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const provider = payment.provider as "payme" | "click";
  if (provider !== "payme" && provider !== "click") {
    return NextResponse.json({ ok: false, error: "invalid_provider" }, { status: 400 });
  }

  const mode = await getPaymentMode(provider);
  if (mode !== "dev") {
    return NextResponse.json({ ok: false, error: "not_dev_mode" }, { status: 403 });
  }

  const ok = await creditPurchase(payment.id);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "credit_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
