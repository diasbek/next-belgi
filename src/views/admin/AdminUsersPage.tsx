import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { AdminUsersTable } from "@/components/organisms/AdminUsersTable";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminUsersPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/users/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data: profiles } = db
    ? await db
        .from("profiles")
        .select("id, full_name, role")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const { data: wallets } = db
    ? await db.from("wallets").select("user_id, balance")
    : { data: [] };

  const balanceMap = new Map(
    (wallets || []).map((w) => [w.user_id, w.balance as number]),
  );

  const users = (profiles || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    role: p.role,
    balance: balanceMap.get(p.id) ?? 0,
  }));

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminUsers.title}</h1>
      <p className={sectionLead}>{copy.adminUsers.lead}</p>
      <AdminUsersTable locale={locale} users={users} />
    </AppShell>
  );
}
