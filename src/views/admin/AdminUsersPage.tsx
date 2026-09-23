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
import {
  ADMIN_PAGE_SIZE,
  parseAdminListParams,
  type AdminListSearchParams,
} from "@/lib/admin/list-params";
import { ErrorBanner } from "@/components/molecules/admin/ErrorBanner";

export async function AdminUsersPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: AdminListSearchParams;
}) {
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/users/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q: rawQ, status: roleFilter, from, to, pageSize } =
    parseAdminListParams(searchParams);
  const q = rawQ.replace(/[%_,.()]/g, " ").replace(/\s+/g, " ").trim();

  let users: AdminUserRow[] = [];
  let listTotal = 0;
  let totalUsers = 0;
  let activeUsers = 0;
  let totalBalance = 0;

  if (db) {
    const weekAgoMs = 7 * 24 * 60 * 60 * 1000;
    const weekAgoCutoff = new Date(Date.now() - weekAgoMs).toISOString();

    let listReq = db
      .from("profiles")
      .select(
        "id, full_name, phone, role, company_name, job_title, user_intent, onboarding_completed_at, created_at, locale",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (roleFilter === "admin" || roleFilter === "user") {
      listReq = listReq.eq("role", roleFilter);
    }
    if (q) {
      const pattern = `%${q}%`;
      listReq = listReq.or(
        [
          `full_name.ilike.${pattern}`,
          `phone.ilike.${pattern}`,
          `company_name.ilike.${pattern}`,
        ].join(","),
      );
    }

    const [
      { data: profiles, count: listCount },
      { count: profileCount },
      { data: wallets },
    ] = await Promise.all([
      listReq,
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("wallets").select("user_id, balance"),
    ]);

    listTotal = listCount ?? 0;
    totalUsers = profileCount ?? 0;
    totalBalance = (wallets || []).reduce(
      (sum, w) => sum + (w.balance || 0),
      0,
    );

    const balanceMap = new Map(
      (wallets || []).map((w) => [w.user_id, w.balance as number]),
    );
    const ids = (profiles || []).map((p) => p.id as string);

    const lastSeenMap = new Map<string, string>();
    const checksMap = new Map<string, number>();
    if (ids.length) {
      const [{ data: sessions }, { data: checkRows }] = await Promise.all([
        db
          .from("app_sessions")
          .select("user_id, last_seen_at")
          .in("user_id", ids)
          .is("revoked_at", null)
          .order("last_seen_at", { ascending: false }),
        db
          .from("trademark_checks")
          .select("user_id")
          .in("user_id", ids),
      ]);
      for (const s of sessions || []) {
        if (!s.user_id || !s.last_seen_at) continue;
        if (!lastSeenMap.has(s.user_id)) {
          lastSeenMap.set(s.user_id, s.last_seen_at);
        }
      }
      for (const c of checkRows || []) {
        if (!c.user_id) continue;
        checksMap.set(c.user_id, (checksMap.get(c.user_id) || 0) + 1);
      }
    }

    const emailMap = new Map<string, string | null>();
    await Promise.all(
      ids.map(async (id) => {
        try {
          const { data } = await db.auth.admin.getUserById(id);
          emailMap.set(id, displayAuthEmail(data.user?.email ?? null));
        } catch {
          emailMap.set(id, null);
        }
      }),
    );

    // Active count for stats — sample recent sessions globally (approx).
    const { count: activeCount } = await db
      .from("app_sessions")
      .select("user_id", { count: "exact", head: true })
      .is("revoked_at", null)
      .gte("last_seen_at", weekAgoCutoff);
    activeUsers = activeCount ?? 0;

    users = (profiles || []).map((p) => {
      const id = p.id as string;
      const lastSeen = lastSeenMap.get(id) || null;
      const active = Boolean(lastSeen) && lastSeen! >= weekAgoCutoff;
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
  }

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

      {!db ? (
        <ErrorBanner className="mb-5">{copy.adminUi.dbUnavailable}</ErrorBanner>
      ) : null}

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

      <AdminUsersTable
        locale={locale}
        users={users}
        page={page}
        pageSize={pageSize || ADMIN_PAGE_SIZE}
        total={listTotal}
      />
    </AppShell>
  );
}
