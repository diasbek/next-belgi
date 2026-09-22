import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import {
  AdminRegistryPanel,
  type AdminRegistryRow,
} from "@/components/organisms/admin/AdminRegistryPanel";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import {
  parseAdminListParams,
  type AdminListSearchParams,
} from "@/lib/admin/list-params";

export async function AdminRegistryPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: AdminListSearchParams;
}) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/registry/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q: rawQ, source, active, from, to, pageSize } =
    parseAdminListParams(searchParams);
  const q = rawQ.replace(/[%_,.()]/g, " ").replace(/\s+/g, " ").trim();

  let registryCount = 0;
  let listTotal = 0;
  let importStatus = "—";
  let syncRunning = false;
  let rows: AdminRegistryRow[] = [];

  if (db) {
    const countReq = db
      .from("trademarks")
      .select("id", { count: "exact", head: true })
      .eq("active", true);
    const stateReq = db
      .from("trademark_import_state")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    let listReq = db
      .from("trademarks")
      .select(
        "id, adliya_id, number, transliteration, trademark_type, status, owner, applicant, registration_number, logo, source, active, field_locks, updated_at",
        { count: "exact" },
      )
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (q) {
      const pattern = `%${q}%`;
      listReq = listReq.or(
        [
          `transliteration.ilike.${pattern}`,
          `number.ilike.${pattern}`,
          `owner.ilike.${pattern}`,
          `applicant.ilike.${pattern}`,
          `registration_number.ilike.${pattern}`,
        ].join(","),
      );
    }
    if (source) listReq = listReq.eq("source", source);
    if (active === "1") listReq = listReq.eq("active", true);
    if (active === "0") listReq = listReq.eq("active", false);

    const [{ count: c }, { data: s }, { data, count: listCount }] =
      await Promise.all([countReq, stateReq, listReq]);
    registryCount = c ?? 0;
    listTotal = listCount ?? 0;
    rows = (data || []) as AdminRegistryRow[];
    syncRunning = s?.status === "running";
    importStatus = `${String(s?.status ?? "—")} · page ${String(s?.last_page ?? "—")} / ${String(s?.total_pages ?? "—")} · ${String(s?.imported_count ?? 0)}`;
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <AdminRegistryPanel
        locale={locale}
        rows={rows}
        total={listTotal}
        page={page}
        pageSize={pageSize}
        registryCount={registryCount}
        importStatus={importStatus}
        syncRunning={syncRunning}
        dbUnavailable={!db}
      />
    </AppShell>
  );
}
