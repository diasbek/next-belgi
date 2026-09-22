import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import { DashPageHeader } from "@/components/molecules/DashChrome";
import { AccountHistoryTable } from "@/components/organisms/AccountHistoryTable";
import { Button } from "@/components/atoms/Button";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";

export async function AccountHistoryPage({ locale }: { locale: Locale }) {
  const appUser = await requireUser(
    loginWithNext(locale, localePath(locale, "/account/history/")),
  );
  const copy = getAppCopy(locale);
  const db = getServiceDb();

  const { data: checks } = db
    ? await db
        .from("trademark_checks")
        .select("id, query, created_at, nice_classes")
        .eq("user_id", appUser.id)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const rows = checks || [];

  return (
    <AppShell
      locale={locale}
      variant="account"
      nav={accountNav(copy)}
      balance={appUser.balance}
      email={appUser.email}
    >
      <DashPageHeader
        title={copy.history.title}
        lead={copy.history.lead}
        badge={rows.length}
        action={
          <Button href={localePath(locale, "/account/check/")}>
            {copy.history.newCheck}
          </Button>
        }
      />
      <AccountHistoryTable locale={locale} checks={rows} />
    </AppShell>
  );
}
