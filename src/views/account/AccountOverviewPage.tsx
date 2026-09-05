import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import {
  DashPageHeader,
  DashPanel,
  DashStatCard,
} from "@/components/molecules/DashChrome";
import {
  IconChecks,
  IconCoins,
} from "@/components/atoms/DashIcons";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { Button } from "@/components/atoms/Button";
import Link from "next/link";

export async function AccountOverviewPage({ locale }: { locale: Locale }) {
  const appUser = await requireUser(
    loginWithNext(locale, localePath(locale, "/account/")),
  );
  const copy = getAppCopy(locale);
  const db = getServiceDb();

  const { data: checks } = db
    ? await db
        .from("trademark_checks")
        .select("id, query, created_at")
        .eq("user_id", appUser.id)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  const { count: checksTotal } = db
    ? await db
        .from("trademark_checks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", appUser.id)
    : { count: 0 };

  return (
    <AppShell
      locale={locale}
      variant="account"
      nav={accountNav(copy)}
      balance={appUser.balance}
      email={appUser.email}
    >
      <DashPageHeader
        title={copy.overview.title}
        lead={copy.overview.lead}
        action={
          <Button href={localePath(locale, "/account/check/")}>
            {copy.nav.newCheck}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <DashStatCard
          label={copy.overview.balance}
          value={`${appUser.balance} ${copy.credits}`}
          icon={<IconCoins />}
        />
        <DashStatCard
          label={copy.overview.totalChecks}
          value={checksTotal ?? 0}
          icon={<IconChecks />}
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="m-0 text-base font-semibold text-ink">
          {copy.overview.recent}
        </h2>
        <Link
          href={localePath(locale, "/account/billing/")}
          className="text-sm font-medium text-ink underline-offset-2 hover:underline"
        >
          {copy.overview.topUp}
        </Link>
      </div>

      <DashPanel>
        {!checks?.length ? (
          <p className="m-0 px-5 py-8 text-sm text-ink-muted">
            {copy.overview.emptyChecks}
          </p>
        ) : (
          <ul className="m-0 divide-y divide-black/5 p-0">
            {checks.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-ink">
                  {c.query}
                </span>
                <span className="shrink-0 text-ink-muted">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashPanel>
    </AppShell>
  );
}
