import type { Locale } from "@/i18n/config";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import { BillingPanel } from "@/components/organisms/BillingPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { paymentsConfigured } from "@/lib/payments/providers";

export async function AccountBillingPage({ locale }: { locale: Locale }) {
  const appUser = await requireUser(
    loginWithNext(locale, localePath(locale, "/account/billing/")),
  );
  const copy = getAppCopy(locale);
  const db = getServiceDb();

  const plansRes = db
    ? await db
        .from("billing_plans")
        .select("id, code, credits, price_uzs, title_uz, title_ru")
        .eq("active", true)
        .order("sort")
    : { data: [] };

  const ledgerRes = db
    ? await db
        .from("ledger_entries")
        .select("id, delta, balance_after, reason, created_at")
        .eq("user_id", appUser.id)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const [paymeOk, clickOk] = await Promise.all([
    paymentsConfigured("payme"),
    paymentsConfigured("click"),
  ]);

  return (
    <AppShell
      locale={locale}
      variant="account"
      nav={accountNav(copy)}
      balance={appUser.balance}
      email={appUser.email}
    >
      <Suspense fallback={null}>
        <BillingPanel
          locale={locale}
          plans={plansRes?.data || []}
          ledger={ledgerRes.data || []}
          paymeOk={paymeOk}
          clickOk={clickOk}
        />
      </Suspense>
    </AppShell>
  );
}
