import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminUsersTable,
  type AdminUserRow,
} from "@/components/organisms/AdminUsersTable";
import {
  DashPageHeader,
  DashStatCard,
} from "@/components/molecules/DashChrome";
import {
  IconActive,
  IconCoins,
  IconUsers,
} from "@/components/atoms/DashIcons";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { displayAuthEmail } from "@/lib/otp/normalize";

export async function AdminUsersPage({ locale }: { locale: Locale }) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/users/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const [
    { data: profiles, count: profileCount },
    { data: wallets },
    { data: sessions },
    { data: checkRows },
  ] = db
    ? await Promise.all([
        db
          .from("profiles")
          .select(
            "id, full_name, phone, role, company_name, job_title, user_intent, onboarding_completed_at, created_at, locale",
            { count: "exact" },
          )
          .order("created_at", { ascending: false }),
        db.from("wallets").select("user_id, balance"),
        db
          .from("app_sessions")
          .select("user_id, last_seen_at, revoked_at")
          .is("revoked_at", null)
          .order("last_seen_at", { ascending: false })
          .limit(2000),
        db.from("trademark_checks").select("user_id"),
      ])
    : [
        {
          data: [] as Array<Record<string, unknown>>,
          count: 0,
        },
        { data: [] as Array<{ user_id: string; balance: number }> },
        {
          data: [] as Array<{
            user_id: string;
            last_seen_at: string | null;
            revoked_at: string | null;
          }>,
        },
        { data: [] as Array<{ user_id: string | null }> },
      ];

  const balanceMap = new Map(
    (wallets || []).map((w) => [w.user_id, w.balance as number]),
  );

  const lastSeenMap = new Map<string, string>();
  for (const s of sessions || []) {
    if (!s.user_id || !s.last_seen_at) continue;
    if (!lastSeenMap.has(s.user_id)) {
      lastSeenMap.set(s.user_id, s.last_seen_at);
    }
  }

  const checksMap = new Map<string, number>();
  for (const c of checkRows || []) {
    if (!c.user_id) continue;
    checksMap.set(c.user_id, (checksMap.get(c.user_id) || 0) + 1);
  }

  const emailMap = new Map<string, string | null>();
  if (db && (profiles || []).length) {
    try {
      const { data: authData } = await db.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      for (const u of authData?.users || []) {
        emailMap.set(u.id, displayAuthEmail(u.email ?? null));
      }
    } catch {
      // ignore — email optional
    }
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const users: AdminUserRow[] = (profiles || []).map((p) => {
    const id = p.id as string;
    const lastSeen = lastSeenMap.get(id) || null;
    const active =
      Boolean(lastSeen) && new Date(lastSeen!).getTime() >= weekAgo;
    return {
      id,
      full_name: (p.full_name as string | null) ?? null,
      email: emailMap.get(id) ?? null,
      phone: (p.phone as string | null) ?? null,
      role: (p.role as string) || "user",
      balance: balanceMap.get(id) ?? 0,
      company_name: (p.company_name as string | null) ?? null,
      job_title: (p.job_title as string | null) ?? null,
      user_intent: (p.user_intent as string | null) ?? null,
      onboarding_completed_at:
        (p.onboarding_completed_at as string | null) ?? null,
      created_at: (p.created_at as string | null) ?? null,
      locale: (p.locale as string | null) ?? null,
      last_seen_at: lastSeen,
      checks_count: checksMap.get(id) ?? 0,
      is_active: active,
    };
  });

  const totalUsers = profileCount ?? users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const totalBalance = (wallets || []).reduce(
    (sum, w) => sum + (w.balance || 0),
    0,
  );

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
