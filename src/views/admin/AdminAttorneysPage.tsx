import type { Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { adminNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { PATENT_ATTORNEYS, PATENT_ATTORNEYS_SOURCE_URL } from "@/data/patent-attorneys";
import { sectionLead, sectionTitle } from "@/styles/ui";

export async function AdminAttorneysPage({ locale }: { locale: Locale }) {
  await requireAdmin(
    loginWithNext(locale, localePath(locale, "/admin/attorneys/")),
    localePath(locale, "/"),
  );
  const copy = getAppCopy(locale);

  return (
    <AppShell locale={locale} variant="admin" nav={adminNav(copy)}>
      <h1 className={sectionTitle}>{copy.adminAttorneys.title}</h1>
      <p className={sectionLead}>{copy.adminAttorneys.lead}</p>
      <p className="mb-4 text-sm text-ink-muted">
        {copy.adminAttorneys.count}: {PATENT_ATTORNEYS.length} ·{" "}
        <a
          href={PATENT_ATTORNEYS_SOURCE_URL}
          className="underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          im.adliya.uz
        </a>
      </p>
      <ul className="divide-y divide-black/5 border-y border-black/5 text-sm">
        {PATENT_ATTORNEYS.map((a) => (
          <li key={a.id} className="py-3">
            <p className="font-medium text-ink">
              #{a.number} {a.name}
            </p>
            <p className="text-ink-muted">
              {[a.region, a.district, a.phone, a.email].filter(Boolean).join(" · ")}
            </p>
            <p className="text-ink-muted">{a.services.join(", ")}</p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
