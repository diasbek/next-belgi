import { NextResponse } from "next/server";
import { getServiceDb } from "@/lib/db/client";
import { creditPurchase } from "@/lib/billing/credits";
import {
  paymeError,
  paymeResult,
  verifyPaymeAuthHeader,
  type PaymeRpcRequest,
} from "@/lib/payments/providers";

/**
 * Payme Merchant API (JSON-RPC).
 * Docs: CheckPerformTransaction, CreateTransaction, PerformTransaction, CancelTransaction, CheckTransaction
 */
export async function POST(request: Request) {
  if (!(await verifyPaymeAuthHeader(request.headers.get("authorization")))) {
    return NextResponse.json(paymeError(undefined, -32504, "Unauthorized"), {
      status: 200,
    });
  }

  let body: PaymeRpcRequest;
  try {
    body = (await request.json()) as PaymeRpcRequest;
  } catch {
    return NextResponse.json(paymeError(undefined, -32700, "Parse error"));
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json(paymeError(body.id, -32400, "DB unavailable"));
  }

  const method = body.method;
  const params = body.params || {};
  const account = (params.account || {}) as Record<string, unknown>;
  const orderId = String(account.order_id || account.orderId || "");

  if (method === "CheckPerformTransaction") {
    const { data: payment } = await db
      .from("payments")
      .select("id, amount_uzs, status")
      .eq("id", orderId)
      .maybeSingle();
    if (!payment || payment.status !== "pending") {
      return NextResponse.json(
        paymeError(body.id, -31050, "Order not found"),
      );
    }
    const amount = Number(params.amount);
    if (amount !== payment.amount_uzs * 100) {
      return NextResponse.json(paymeError(body.id, -31001, "Wrong amount"));
    }
    return NextResponse.json(paymeResult(body.id, { allow: true }));
  }

  if (method === "CreateTransaction") {
    const { data: payment } = await db
      .from("payments")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    if (!payment) {
      return NextResponse.json(
        paymeError(body.id, -31050, "Order not found"),
      );
    }
    const amount = Number(params.amount);
    if (amount !== payment.amount_uzs * 100) {
      return NextResponse.json(paymeError(body.id, -31001, "Wrong amount"));
    }
    const transId = String(params.id || "");
    await db
      .from("payments")
      .update({
        provider_payment_id: transId,
        raw: { ...((payment.raw as object) || {}), create: params },
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return NextResponse.json(
      paymeResult(body.id, {
        create_time: Date.now(),
        transaction: payment.id,
        state: 1,
      }),
    );
  }

  if (method === "PerformTransaction") {
    const transId = String(params.id || "");
    const { data: payment } = await db
      .from("payments")
      .select("*")
      .or(`provider_payment_id.eq.${transId},id.eq.${orderId}`)
      .eq("provider", "payme")
      .maybeSingle();

    if (!payment) {
      return NextResponse.json(
        paymeError(body.id, -31003, "Transaction not found"),
      );
    }

    if (payment.status === "paid") {
      return NextResponse.json(
        paymeResult(body.id, {
          transaction: payment.id,
          perform_time: payment.paid_at
            ? new Date(payment.paid_at).getTime()
            : Date.now(),
          state: 2,
        }),
      );
    }

    const ok = await creditPurchase(payment.id);
    if (!ok) {
      return NextResponse.json(
        paymeError(body.id, -31008, "Unable to perform"),
      );
    }

    return NextResponse.json(
      paymeResult(body.id, {
        transaction: payment.id,
        perform_time: Date.now(),
        state: 2,
      }),
    );
  }

  if (method === "CancelTransaction") {
    const transId = String(params.id || "");
    const { data: payment } = await db
      .from("payments")
      .select("*")
      .eq("provider_payment_id", transId)
      .eq("provider", "payme")
      .maybeSingle();

    if (!payment) {
      return NextResponse.json(
        paymeError(body.id, -31003, "Transaction not found"),
      );
    }

    if (payment.status === "paid") {
      return NextResponse.json(
        paymeError(body.id, -31007, "Cannot cancel performed"),
      );
    }

    await db
      .from("payments")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", payment.id);

    return NextResponse.json(
      paymeResult(body.id, {
        transaction: payment.id,
        cancel_time: Date.now(),
        state: -1,
      }),
    );
  }

  if (method === "CheckTransaction") {
    const transId = String(params.id || "");
    const { data: payment } = await db
      .from("payments")
      .select("*")
      .eq("provider_payment_id", transId)
      .eq("provider", "payme")
      .maybeSingle();

    if (!payment) {
      return NextResponse.json(
        paymeError(body.id, -31003, "Transaction not found"),
      );
    }

    const state =
      payment.status === "paid" ? 2 : payment.status === "cancelled" ? -1 : 1;

    return NextResponse.json(
      paymeResult(body.id, {
        create_time: new Date(payment.created_at).getTime(),
        perform_time: payment.paid_at
          ? new Date(payment.paid_at).getTime()
          : 0,
        cancel_time: 0,
        transaction: payment.id,
        state,
        reason: null,
      }),
    );
  }

  return NextResponse.json(paymeError(body.id, -32601, "Method not found"));
}
