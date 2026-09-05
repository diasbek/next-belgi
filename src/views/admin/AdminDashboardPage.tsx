import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminDashboardPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  let users = 0;
  let checksToday = 0;
  let revenue = 0;
  let failed = 0;

  if (db) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [{ count: u }, { count: c }, paid, fail] = await Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }),
      db
        .from("trademark_checks")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
      db.from("payments").select("amount_uzs").eq("status", "paid"),
      db
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed"),
    ]);
    users = u ?? 0;
    checksToday = c ?? 0;
    revenue = (paid.data || []).reduce((s, p) => s + (p.amount_uzs || 0), 0);
    failed = fail.count ?? 0;
  }

  const stats = [
    { label: copy.adminDash.users, value: users },
    { label: copy.adminDash.checksToday, value: checksToday },
    { label: copy.adminDash.revenue, value: revenue.toLocaleString() },
    { label: copy.adminDash.failedPayments, value: failed },
  ];

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminDash.title}</h1>
      <p className={sectionLead}>{copy.adminDash.lead}</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="rounded-2xl bg-lime/60 px-4 py-5">
            <p className="text-sm text-ink-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{s.value}</p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
