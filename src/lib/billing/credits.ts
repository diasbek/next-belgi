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

/** Debit N credits (base + extra jurisdictions). Rolls back on failure. */
export async function debitCheckCredits(
  userId: string,
  amount: number,
): Promise<
  | { ok: true; ledgerIds: string[]; ledgerId: string }
  | { ok: false; error: string }
> {
  const n = Math.max(1, Math.floor(amount));
  const ledgerIds: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = await debitCheckCredit(userId);
    if (!d.ok) {
      for (const id of ledgerIds) {
        await refundCheckCredit(id);
      }
      return d;
    }
    ledgerIds.push(d.ledgerId);
  }
  return { ok: true, ledgerIds, ledgerId: ledgerIds[0]! };
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
