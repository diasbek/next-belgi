import { NextResponse } from "next/server";
import { getServiceDb } from "@/lib/db/client";
import { creditPurchase } from "@/lib/billing/credits";
import { verifyClickSign } from "@/lib/payments/providers";

/**
 * Click Prepare (action=0) / Complete (action=1) webhook.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const json = form
    ? Object.fromEntries(form.entries())
    : await request.json().catch(() => null);

  if (!json || typeof json !== "object") {
    return NextResponse.json({ error: -8, error_note: "Bad request" });
  }

  const data = json as Record<string, string>;
  const clickTransId = String(data.click_trans_id || "");
  const serviceId = String(data.service_id || "");
  const merchantTransId = String(data.merchant_trans_id || "");
  const amount = String(data.amount || "");
  const action = String(data.action || "");
  const signTime = String(data.sign_time || "");
  const signString = String(data.sign_string || "");

  if (
    !(await verifyClickSign({
      clickTransId,
      serviceId,
      merchantTransId,
      amount,
      action,
      signTime,
      signString,
    }))
  ) {
    return NextResponse.json({ error: -1, error_note: "Invalid sign" });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json({ error: -9, error_note: "DB unavailable" });
  }

  const { data: payment } = await db
    .from("payments")
    .select("*")
    .eq("id", merchantTransId)
    .eq("provider", "click")
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: -5, error_note: "User does not exist" });
  }

  if (Number(amount) !== payment.amount_uzs) {
    return NextResponse.json({ error: -2, error_note: "Incorrect parameter amount" });
  }

  // Prepare
  if (action === "0") {
    if (payment.status === "paid") {
      return NextResponse.json({
        click_trans_id: clickTransId,
        merchant_trans_id: merchantTransId,
        merchant_prepare_id: payment.id,
        error: -4,
        error_note: "Already paid",
      });
    }
    await db
      .from("payments")
      .update({
        provider_payment_id: clickTransId,
        raw: { ...((payment.raw as object) || {}), prepare: data },
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return NextResponse.json({
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      merchant_prepare_id: payment.id,
      error: 0,
      error_note: "Success",
    });
  }

  // Complete
  if (action === "1") {
    const errorCode = Number(data.error || 0);
    if (errorCode < 0) {
      await db
        .from("payments")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", payment.id);
      return NextResponse.json({
        click_trans_id: clickTransId,
        merchant_trans_id: merchantTransId,
        merchant_confirm_id: payment.id,
        error: 0,
        error_note: "Success",
      });
    }

    if (payment.status !== "paid") {
      await creditPurchase(payment.id);
    }

    return NextResponse.json({
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      merchant_confirm_id: payment.id,
      error: 0,
      error_note: "Success",
    });
  }

  return NextResponse.json({ error: -3, error_note: "Action not found" });
}
