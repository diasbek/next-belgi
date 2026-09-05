import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminPaymentsPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/payments/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data } = db
    ? await db
        .from("payments")
        .select("id, provider, amount_uzs, credits, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminPayments.title}</h1>
      <p className={sectionLead}>{copy.adminPayments.lead}</p>
      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {(data || []).map((p) => (
          <li key={p.id} className="flex flex-wrap justify-between gap-2 py-3">
            <span>
              {p.provider} · {p.credits} cr · {p.status}
            </span>
            <span className="text-ink-muted">
              {p.amount_uzs.toLocaleString()} ·{" "}
              {new Date(p.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
