import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  DashPageHeader,
  DashPanel,
  DashStatCard,
} from "@/components/molecules/DashChrome";
import {
  IconChecks,
  IconFailed,
  IconRevenue,
  IconUsers,
} from "@/components/atoms/DashIcons";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import Link from "next/link";

export async function AdminDashboardPage({ locale }: { locale: Locale }) {
  const admin = await requireAdmin(
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
    {
      label: copy.adminDash.users,
      value: users,
      icon: <IconUsers />,
      href: localePath(locale, "/admin/users/"),
    },
    {
      label: copy.adminDash.checksToday,
      value: checksToday,
      icon: <IconChecks />,
      href: localePath(locale, "/admin/checks/"),
    },
    {
      label: copy.adminDash.revenue,
      value: revenue.toLocaleString(),
      icon: <IconRevenue />,
      href: localePath(locale, "/admin/payments/"),
    },
    {
      label: copy.adminDash.failedPayments,
      value: failed,
      icon: <IconFailed />,
      href: localePath(locale, "/admin/payments/"),
    },
  ];

  const quickLinks = [
    { href: localePath(locale, "/admin/users/"), label: copy.nav.users },
    { href: localePath(locale, "/admin/payments/"), label: copy.nav.payments },
    { href: localePath(locale, "/admin/checks/"), label: copy.nav.checks },
    { href: localePath(locale, "/admin/registry/"), label: copy.nav.registry },
    { href: localePath(locale, "/admin/leads/"), label: copy.nav.leads },
    { href: localePath(locale, "/admin/settings/"), label: copy.nav.settings },
  ];

  return (
    <AppShell
      locale={locale}
      variant="admin"
      nav={adminNav(copy)}
      email={admin.email}
    >
      <DashPageHeader title={copy.adminDash.title} lead={copy.adminDash.lead} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block transition-opacity hover:opacity-90">
            <DashStatCard label={s.label} value={s.value} icon={s.icon} />
          </Link>
        ))}
      </div>

      <DashPanel className="p-5">
        <h2 className="m-0 text-base font-semibold text-ink">{copy.admin}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-[#f3f4f1]"
              >
                {item.label}
                <span className="text-ink-muted" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </DashPanel>
    </AppShell>
  );
}
