import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { AdminUsersTable } from "@/components/organisms/AdminUsersTable";
import {
  DashPageHeader,
  DashStatCard,
} from "@/components/molecules/DashChrome";
import {
  IconActive,
  IconCoins,
  IconUsers,
} from "@/components/atoms/DashIcons";
import { Button } from "@/components/atoms/Button";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";

export async function AdminUsersPage({ locale }: { locale: Locale }) {
  const admin = await requireAdmin(
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

  const totalUsers = users.length;
  const activeUsers = totalUsers;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);

  return (
    <AppShell
      locale={locale}
      variant="admin"
      nav={adminNav(copy)}
      email={admin.email}
    >
      <DashPageHeader
        title={copy.adminUsers.title}
        lead={copy.adminUsers.lead}
        action={
          <Button type="button" className="justify-center">
            + {copy.adminUsers.addUser}
          </Button>
        }
      />

      <div className="-mx-4 mb-5 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-6 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
        <DashStatCard
          className="min-w-[10.5rem] flex-1 sm:min-w-0"
          label={copy.adminUsers.statTotal}
          value={totalUsers}
          icon={<IconUsers />}
        />
        <DashStatCard
          className="min-w-[10.5rem] flex-1 sm:min-w-0"
          label={copy.adminUsers.statActive}
          value={activeUsers}
          icon={<IconActive />}
        />
        <DashStatCard
          className="min-w-[10.5rem] flex-1 sm:min-w-0"
          label={copy.adminUsers.statBalance}
          value={totalBalance}
          icon={<IconCoins />}
        />
      </div>

      <AdminUsersTable locale={locale} users={users} />
    </AppShell>
  );
}
