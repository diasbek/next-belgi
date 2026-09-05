import { getServiceDb } from "@/lib/db/client";

export async function debitCheckCredit(
  userId: string,
): Promise<{ ok: true; ledgerId: string } | { ok: false; error: string }> {
  const db = getServiceDb();
  if (!db) return { ok: false, error: "db_unavailable" };

  const { data, error } = await db.rpc("debit_check_credit", {
    p_user_id: userId,
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("insufficient_credits")) {
      return { ok: false, error: "insufficient_credits" };
    }
    console.warn("[billing:debit]", error.message);
    return { ok: false, error: "debit_failed" };
  }

  return { ok: true, ledgerId: String(data) };
}

export async function refundCheckCredit(ledgerId: string): Promise<boolean> {
  const db = getServiceDb();
  if (!db) return false;
  const { error } = await db.rpc("refund_check_credit", {
    p_ledger_entry_id: ledgerId,
  });
  if (error) {
    console.warn("[billing:refund]", error.message);
    return false;
  }
  return true;
}

export async function creditPurchase(paymentId: string): Promise<boolean> {
  const db = getServiceDb();
  if (!db) return false;
  const { error } = await db.rpc("credit_purchase", {
    p_payment_id: paymentId,
  });
  if (error) {
    console.warn("[billing:credit]", error.message);
    return false;
  }
  return true;
}

export async function linkCheckEntitlement(params: {
  checkId: string;
  ledgerId: string;
  userId: string;
}): Promise<void> {
  const db = getServiceDb();
  if (!db) return;
  await db.from("check_entitlements").upsert({
    trademark_check_id: params.checkId,
    ledger_entry_id: params.ledgerId,
    user_id: params.userId,
  });
}
