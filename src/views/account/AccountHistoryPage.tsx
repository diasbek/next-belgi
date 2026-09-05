import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

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

  return (
    <AppShell
      locale={locale}
      variant="account"
      nav={accountNav(copy)}
      balance={appUser.balance}
      email={appUser.email}
    >
      <h1 className={sectionTitle}>{copy.history.title}</h1>
      <p className={sectionLead}>{copy.history.lead}</p>
      {!checks?.length ? (
        <p className="text-ink-muted">{copy.history.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-ink-muted">
                <th className="py-2 font-medium">{copy.history.query}</th>
                <th className="py-2 font-medium">{copy.history.classes}</th>
                <th className="py-2 font-medium">{copy.history.date}</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.id} className="border-b border-black/5">
                  <td className="py-3 font-medium text-ink">{c.query}</td>
                  <td className="py-3 text-ink-muted">
                    {Array.isArray(c.nice_classes)
                      ? (c.nice_classes as unknown[])
                          .map(String)
                          .slice(0, 6)
                          .join(", ")
                      : "—"}
                  </td>
                  <td className="py-3 text-ink-muted">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
