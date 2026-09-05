import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { Button } from "@/components/atoms/Button";
import { sectionLead, sectionTitle } from "@/styles/ui";
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

  return (
    <AppShell
      locale={locale}
      variant="account"
      nav={accountNav(copy)}
      balance={appUser.balance}
      email={appUser.email}
    >
      <h1 className={sectionTitle}>{copy.overview.title}</h1>
      <p className={sectionLead}>{copy.overview.lead}</p>

      <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <p className="m-0 text-3xl font-semibold tracking-tight text-ink">
          {appUser.balance}{" "}
          <span className="text-base font-medium text-ink-muted">
            {copy.credits}
          </span>
        </p>
        <Link
          href={localePath(locale, "/account/billing/")}
          className="text-sm font-medium text-ink underline-offset-2 hover:underline"
        >
          {copy.overview.topUp}
        </Link>
      </div>

      <Button href={localePath(locale, "/account/check/")} className="mb-10">
        {copy.nav.newCheck}
      </Button>

      <h2 className="mb-3 text-lg font-semibold">{copy.overview.recent}</h2>
      {!checks?.length ? (
        <p className="text-ink-muted">{copy.overview.emptyChecks}</p>
      ) : (
        <ul className="divide-y divide-black/5 border-y border-black/5">
          {checks.map((c) => (
            <li key={c.id} className="flex justify-between gap-3 py-3 text-sm">
              <span className="font-medium text-ink">{c.query}</span>
              <span className="shrink-0 text-ink-muted">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
