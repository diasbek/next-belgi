import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminLedgerPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/ledger/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data } = db
    ? await db
        .from("ledger_entries")
        .select("id, user_id, delta, balance_after, reason, created_at")
        .order("created_at", { ascending: false })
        .limit(150)
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminLedger.title}</h1>
      <p className={sectionLead}>{copy.adminLedger.lead}</p>
      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {(data || []).length === 0 ? (
          <li className="py-4 text-ink-muted">—</li>
        ) : (
          (data || []).map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div>
                <p className="font-medium text-ink">{row.reason}</p>
                <p className="text-ink-muted">
                  {row.user_id.slice(0, 8)}… ·{" "}
                  {new Date(row.created_at).toLocaleString()}
                </p>
              </div>
              <span className="font-semibold text-ink">
                {row.delta > 0 ? "+" : ""}
                {row.delta} → {row.balance_after}
              </span>
            </li>
          ))
        )}
      </ul>
    </AppShell>
  );
}
