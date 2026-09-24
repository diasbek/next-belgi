import type { Locale } from "@/i18n/config";
import { requireAttorney, getServiceClient } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";
import { PageContainer } from "@/components/atoms/PageContainer";
import { formatAdminDate } from "@/lib/admin/list-params";

export async function AttorneyOrdersPage({ locale }: { locale: Locale }) {
  const user = await requireAttorney(
    loginWithNext(locale, localePath(locale, "/account/attorney/")),
    localePath(locale, "/account/"),
  );
  const copy = getAppCopy(locale);
  const db = getServiceClient();

  type Row = {
    id: string;
    service_slug: string;
    status: string;
    created_at: string;
    payload: Record<string, unknown> | null;
  };

  let items: Row[] = [];
  let hint: string | null = null;

  if (db) {
    const { data: link } = await db
      .from("patent_attorneys_db")
      .select("id")
      .eq("profile_user_id", user.id)
      .maybeSingle();

    if (!link && user.profile.role !== "admin") {
      hint =
        locale === "ru"
          ? "Профиль не связан с записью патентного поверенного."
          : locale === "en"
            ? "Profile is not linked to a patent attorney record."
            : "Profil patent vakili yozuviga bogʻlanmagan.";
    } else {
      let q = db
        .from("service_orders")
        .select("id, service_slug, status, created_at, payload")
        .order("created_at", { ascending: false })
        .limit(50);
      if (user.profile.role === "admin") {
        q = q.not("attorney_id", "is", null);
      } else if (link) {
        q = q.eq("attorney_id", link.id);
      }
      const { data } = await q;
      items = (data || []) as Row[];
    }
  }

  const title =
    locale === "ru"
      ? "Очередь поверенного"
      : locale === "en"
        ? "Attorney queue"
        : "Vakil navbati";

  return (
    <AppShell
      locale={locale}
      variant="account"
      nav={accountNav(copy)}
      email={user.email}
    >
      <PageContainer className="py-8">
        <h1 className="m-0 font-display text-2xl font-semibold text-ink">
          {title}
        </h1>
        {hint ? (
          <p className="mt-3 text-sm text-ink-muted">{hint}</p>
        ) : null}
        {items.length === 0 && !hint ? (
          <p className="mt-6 text-sm text-ink-muted">
            {locale === "ru"
              ? "Назначенных заказов пока нет."
              : locale === "en"
                ? "No assigned orders yet."
                : "Tayinlangan buyurtmalar yoʻq."}
          </p>
        ) : (
          <ul className="mt-6 m-0 list-none space-y-3 p-0">
            {items.map((row) => (
              <li
                key={row.id}
                className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink"
              >
                <p className="m-0 font-semibold">{row.service_slug}</p>
                <p className="m-0 mt-1 text-ink-muted">
                  {row.status} · {formatAdminDate(row.created_at, locale)}
                </p>
                {row.payload?.mark ? (
                  <p className="m-0 mt-1">{String(row.payload.mark)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </AppShell>
  );
}
