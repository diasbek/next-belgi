import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminRegistryPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/registry/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  let count = 0;
  let state: Record<string, unknown> | null = null;
  if (db) {
    const [{ count: c }, { data: s }] = await Promise.all([
      db.from("trademarks").select("id", { count: "exact", head: true }),
      db.from("trademark_import_state").select("*").eq("id", 1).maybeSingle(),
    ]);
    count = c ?? 0;
    state = s;
  }

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminRegistry.title}</h1>
      <p className={sectionLead}>{copy.adminRegistry.lead}</p>
      <dl className="space-y-3 text-sm">
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
    </AppShell>
  );
}
