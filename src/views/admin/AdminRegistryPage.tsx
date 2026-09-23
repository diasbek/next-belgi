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
  const admin = await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/registry/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const { page, q: rawQ, source, active, status, sort, dir, from, to, pageSize } =
    parseAdminListParams(searchParams);
  const q = rawQ.replace(/[%_,.()]/g, " ").replace(/\s+/g, " ").trim();

  let registryCount = 0;
  let listTotal = 0;
  let importStatus = "—";
  let syncRunning = false;
  let rows: AdminRegistryRow[] = [];
  let statusValues: string[] = [];

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
    const statusesReq = db.rpc("list_trademark_statuses");

    let listReq = db
      .from("trademarks")
      .select(
        "id, adliya_id, number, transliteration, trademark_type, status, owner, applicant, registration_number, logo, source, active, field_locks, updated_at, application_date, registration_date, synced_at, trademark_mgs(class_number)",
        { count: "exact" },
      )
      .order(sort, { ascending: dir === "asc" })
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
          `status.ilike.${pattern}`,
        ].join(","),
      );
    }
    if (source) listReq = listReq.eq("source", source);
    if (status) listReq = listReq.eq("status", status);
    if (active === "1") listReq = listReq.eq("active", true);
    if (active === "0") listReq = listReq.eq("active", false);

    const [
      { count: c },
      { data: s },
      { data, count: listCount },
      { data: statusData, error: statusErr },
    ] = await Promise.all([countReq, stateReq, listReq, statusesReq]);
    registryCount = c ?? 0;
    listTotal = listCount ?? 0;
    rows = ((data || []) as Array<AdminRegistryRow & { trademark_mgs?: { class_number: number }[] }>).map(
      (row) => {
        const mgs = Array.isArray(row.trademark_mgs) ? row.trademark_mgs : [];
        const classNumbers = [
          ...new Set(
            mgs
              .map((m) => Number(m.class_number))
              .filter((n) => Number.isFinite(n) && n >= 1 && n <= 45),
          ),
        ].sort((a, b) => a - b);
        const { trademark_mgs: _mgs, ...rest } = row;
        return { ...rest, class_numbers: classNumbers };
      },
    );
    syncRunning = s?.status === "running";
    importStatus = [
      String(s?.status ?? "—"),
      `p.${String(s?.last_page ?? "—")}/${String(s?.total_pages ?? "—")}`,
      String(s?.imported_count ?? 0),
    ].join(" · ");

    if (!statusErr && Array.isArray(statusData)) {
      statusValues = statusData
        .map((v) => (typeof v === "string" ? v : String(v ?? "")).trim())
        .filter(Boolean);
    } else {
      // Fallback: sample status column in chunks until we collect uniques.
      const found = new Set<string>();
      if (status) found.add(status);
      for (const r of rows) {
        const sVal = (r.status || "").trim();
        if (sVal) found.add(sVal);
      }
      try {
        for (let offset = 0; offset < 10_000 && found.size < 80; offset += 1000) {
          const { data: sample } = await db
            .from("trademarks")
            .select("status")
            .not("status", "is", null)
            .neq("status", "")
            .order("id", { ascending: true })
            .range(offset, offset + 999);
          if (!sample?.length) break;
          for (const row of sample) {
            const sVal = String(
              (row as { status?: string | null }).status || "",
            ).trim();
            if (sVal) found.add(sVal);
          }
          if (sample.length < 1000) break;
        }
      } catch (e) {
        console.warn("[admin:registry:statuses:fallback]", e);
      }
      statusValues = [...found].sort((a, b) => a.localeCompare(b));
      if (statusErr) {
        console.warn("[admin:registry:statuses]", statusErr.message);
      }
    }
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)} email={admin.email}>
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
        statusValues={statusValues}
      />
    </AppShell>
  );
}
