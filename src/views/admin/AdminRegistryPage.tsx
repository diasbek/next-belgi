import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { fieldInput, sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminRegistryPage({
  locale,
  query = "",
}: {
  locale: Locale;
  query?: string;
}) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/registry/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();
  const q = query.trim().replace(/[%_,.()]/g, " ").replace(/\s+/g, " ").trim();

  let count = 0;
  let state: Record<string, unknown> | null = null;
  let rows: Array<{
    id: number;
    number: string | null;
    transliteration: string | null;
    trademark_type: string | null;
    status: string | null;
    owner: string | null;
    applicant: string | null;
    registration_number: string | null;
    updated_at: string;
  }> = [];

  if (db) {
    const countReq = db
      .from("trademarks")
      .select("id", { count: "exact", head: true });
    const stateReq = db
      .from("trademark_import_state")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    let listReq = db
      .from("trademarks")
      .select(
        "id, number, transliteration, trademark_type, status, owner, applicant, registration_number, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(100);

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

    const [{ count: c }, { data: s }, { data }] = await Promise.all([
      countReq,
      stateReq,
      listReq,
    ]);
    count = c ?? 0;
    state = s;
    rows = data || [];
  }

  const action = localePath(locale, "/admin/registry/");

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminRegistry.title}</h1>
      <p className={sectionLead}>{copy.adminRegistry.lead}</p>

      <dl className="mb-8 space-y-3 text-sm">
        <div className="flex justify-between border-b border-black/5 py-2">
          <dt className="text-ink-muted">{copy.adminRegistry.count}</dt>
          <dd className="font-semibold">{count.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between border-b border-black/5 py-2">
          <dt className="text-ink-muted">{copy.adminRegistry.importStatus}</dt>
          <dd className="font-semibold">
            {String(state?.status ?? "—")} · page{" "}
            {String(state?.last_page ?? "—")} /{" "}
            {String(state?.total_pages ?? "—")}
          </dd>
        </div>
      </dl>

      <form action={action} method="get" className="mb-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder={copy.adminRegistry.searchPlaceholder}
          className={`${fieldInput} max-w-md flex-1`}
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
        >
          {copy.adminRegistry.search}
        </button>
      </form>

      <p className="mb-2 text-xs text-ink-muted">
        {copy.adminRegistry.showing}: {rows.length}
        {q ? ` · «${q}»` : ""}
      </p>

      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {rows.length === 0 ? (
          <li className="py-4 text-ink-muted">{copy.adminRegistry.empty}</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="py-3">
              <p className="font-medium text-ink">
                {row.transliteration || row.number || `#${row.id}`}
              </p>
              <p className="text-ink-muted">
                {[row.number, row.registration_number, row.status, row.trademark_type]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="text-ink-muted">
                {[row.owner || row.applicant, new Date(row.updated_at).toLocaleString()]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </li>
          ))
        )}
      </ul>
    </AppShell>
  );
}
