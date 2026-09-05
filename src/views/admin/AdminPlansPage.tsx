import type { Locale } from "@/i18n/config";
import { requireAdmin, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminPlansPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/plans/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  const { data } = db
    ? await db.from("billing_plans").select("*").order("sort")
    : { data: [] };

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminPlans.title}</h1>
      <p className={sectionLead}>{copy.adminPlans.lead}</p>
      <ul className="divide-y divide-black/5 border-y border-black/5">
        {(data || []).map((p) => (
          <li key={p.id} className="flex justify-between gap-3 py-3 text-sm">
            <span className="font-medium">
              {p.code} · {locale === "ru" ? p.title_ru : p.title_uz}
            </span>
            <span className="text-ink-muted">
              {p.credits} cr · {p.price_uzs.toLocaleString()} UZS ·{" "}
              {p.active ? "active" : "off"}
            </span>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
