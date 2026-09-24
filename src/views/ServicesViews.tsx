import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import {
  SERVICE_CATALOG,
  getServicesCopy,
  getServiceDetail,
  type ServiceSlug,
} from "@/data/services-catalog";
import {
  PATENT_ATTORNEYS,
  PATENT_ATTORNEYS_SOURCE_URL,
} from "@/data/patent-attorneys";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  PageHero,
  pageHeroPrimaryClassName,
  pageHeroSecondaryClassName,
} from "@/components/molecules/PageHero";
import { PatentAttorneysList } from "@/components/organisms/PatentAttorneysList";
import { FeeCalculator } from "@/components/organisms/FeeCalculator";
import { ServiceOrderForm } from "@/components/organisms/ServiceOrderForm";
import {
  gridSpanHalf,
  sectionDense,
  sectionGrid,
} from "@/styles/ui";
import { cn } from "@/lib/cn";
import Link from "next/link";

function resolveHref(locale: Locale, href: string) {
  if (href.startsWith("#") || href.startsWith("http")) return href;
  return localePath(locale, href);
}

export function ServicesHubView({ locale }: { locale: Locale }) {
  const hub = getServicesCopy(locale).hub;
  const details = getServicesCopy(locale).details;

  return (
    <>
      <PageHero
        eyebrow="Belgi.ai"
        title={hub.title}
        lead={hub.lead}
        titleMaxCh={18}
        spacious
        actions={
          <Link
            href={localePath(locale, "/check/")}
            className={pageHeroPrimaryClassName()}
          >
            {hub.checkCta}
          </Link>
        }
      />

      <section className={`${sectionDense} bg-white`}>
        <PageContainer>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_CATALOG.map((item) => {
              const d = details[item.slug];
              return (
                <Link
                  key={item.slug}
                  href={localePath(locale, `/services/${item.slug}/`)}
                  className="group flex flex-col rounded-2xl bg-lime/70 p-5 text-ink transition hover:bg-lime sm:p-6"
                >
                  <span className="text-xs font-semibold tabular-nums text-ink/55">
                    {String(item.number).padStart(2, "0")}
                  </span>
                  <h2 className="m-0 mt-2 text-lg font-semibold leading-snug group-hover:underline">
                    {d.title}
                  </h2>
                  <p className="mb-0 mt-2 flex-1 text-sm leading-relaxed text-ink/75">
                    {d.short}
                  </p>
                  <span className="mt-4 text-sm font-semibold">
                    {hub.moreLabel} →
                  </span>
                </Link>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section className={`${sectionDense} bg-surface-muted`}>
        <PageContainer>
          <h2 className="m-0 font-display text-[clamp(1.25rem,3vw,2rem)] font-semibold tracking-[-0.02em] text-ink">
            {hub.journeyTitle}
          </h2>
          <p className="mt-2 max-w-[40rem] text-sm text-ink-muted sm:text-base">
            {hub.journeyLead}
          </p>
          <ol className="mt-6 m-0 list-none space-y-3 p-0">
            {hub.journeySteps.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 rounded-xl bg-white px-4 py-3 text-sm text-ink"
              >
                <span className="font-semibold tabular-nums text-ink/45">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>
    </>
  );
}

export function ServiceDetailView({
  locale,
  slug,
  checkId,
}: {
  locale: Locale;
  slug: ServiceSlug;
  checkId?: string | null;
}) {
  const d = getServiceDetail(locale, slug);
  const hub = getServicesCopy(locale).hub;
  const site = getContent(locale);
  const related = d.relatedSlugs.map((s) => ({
    slug: s,
    title: getServiceDetail(locale, s).title,
    short: getServiceDetail(locale, s).short,
  }));

  const orderVariant =
    slug === "filing-package"
      ? "filing"
      : slug === "ip-protection"
        ? "ip"
        : slug === "attorney-match"
          ? "attorney"
          : slug === "attorney-access"
            ? "b2b"
            : "generic";

  const showOrder =
    slug === "filing-package" ||
    slug === "ip-protection" ||
    slug === "attorney-match" ||
    slug === "attorney-access";

  return (
    <>
      <PageHero
        title={d.title}
        lead={d.hero}
        titleMaxCh={22}
        breadcrumb={
          <Link
            href={localePath(locale, "/services/")}
            className="underline-offset-2 hover:underline"
          >
            {hub.title}
          </Link>
        }
        actions={
          <>
            <Link
              href={resolveHref(locale, d.primaryCta.href)}
              className={pageHeroPrimaryClassName()}
            >
              {d.primaryCta.label}
            </Link>
            <Link
              href={resolveHref(locale, d.secondaryCta.href)}
              className={pageHeroSecondaryClassName()}
            >
              {d.secondaryCta.label}
            </Link>
          </>
        }
      />

      <section className={`${sectionDense} bg-white`}>
        <PageContainer>
          <div className={cn(sectionGrid, gridSpanHalf, "gap-y-8")}>
            <div>
              <h2 className="m-0 text-lg font-semibold text-ink">
                {locale === "ru"
                  ? "Для кого"
                  : locale === "en"
                    ? "For whom"
                    : "Kim uchun"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {d.forWhom}
              </p>
            </div>
            <div>
              <h2 className="m-0 text-lg font-semibold text-ink">
                {locale === "ru"
                  ? "Результат"
                  : locale === "en"
                    ? "Result"
                    : "Natija"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {d.result}
              </p>
            </div>
          </div>

          <h2 className="m-0 mt-10 text-lg font-semibold text-ink">
            {locale === "ru"
              ? "Как проходит"
              : locale === "en"
                ? "How it works"
                : "Qanday o‘tadi"}
          </h2>
          <ol className="mt-4 m-0 list-none space-y-3 p-0">
            {d.steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl bg-surface-muted px-4 py-3"
              >
                <p className="m-0 text-sm font-semibold text-ink">
                  {i + 1}. {step.title}
                </p>
                <p className="mb-0 mt-1 text-sm text-ink-muted">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className={cn(sectionGrid, gridSpanHalf, "mt-10 gap-y-6")}>
            <div>
              <h3 className="m-0 text-base font-semibold text-ink">
                {locale === "ru"
                  ? "Что входит"
                  : locale === "en"
                    ? "Included"
                    : "Nima kiradi"}
              </h3>
              <ul className="mt-2 space-y-1 pl-5 text-sm text-ink/80">
                {d.deliverables.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="m-0 text-base font-semibold text-ink">
                {locale === "ru"
                  ? "Что не входит"
                  : locale === "en"
                    ? "Not included"
                    : "Nima kirmaydi"}
              </h3>
              <ul className="mt-2 space-y-1 pl-5 text-sm text-ink/80">
                {d.notIncluded.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-sm text-ink-muted">{d.pricingHint}</p>
          {d.disclaimer ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              {d.disclaimer}
            </p>
          ) : null}
        </PageContainer>
      </section>

      {slug === "nice-classes-fees" ? (
        <section className={`${sectionDense} bg-white`}>
          <PageContainer>
            <FeeCalculator locale={locale} />
          </PageContainer>
        </section>
      ) : null}

      {showOrder ? (
        <section className={`${sectionDense} bg-white`}>
          <PageContainer measure="copy">
            <h2 className="m-0 mb-4 text-lg font-semibold text-ink">
              {d.primaryCta.label}
            </h2>
            <ServiceOrderForm
              locale={locale}
              serviceSlug={slug}
              variant={orderVariant}
              checkId={checkId || undefined}
            />
          </PageContainer>
        </section>
      ) : null}

      {slug === "attorney-match" ? (
        <section id="attorneys" className={`${sectionDense} scroll-mt-24 bg-surface-muted`}>
          <PageContainer>
            <h2 className="m-0 mb-2 font-display text-[clamp(1.25rem,3vw,2rem)] font-semibold tracking-[-0.02em] text-ink">
              {site.services.attorneysTitle}
            </h2>
            <p className="m-0 mb-2 max-w-[var(--content-copy)] text-sm text-ink-muted sm:text-base">
              {site.services.attorneysLead}
            </p>
            <p className="m-0 mb-5 text-sm text-ink-muted">
              <a
                href={PATENT_ATTORNEYS_SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:underline"
              >
                {site.services.attorneysSource}
              </a>
            </p>
            <PatentAttorneysList
              attorneys={PATENT_ATTORNEYS}
              locale={locale}
              showAttach
              labels={{
                searchPlaceholder: site.services.attorneysSearch,
                empty: site.services.attorneysEmpty,
                count: site.services.attorneysCount,
                columns: site.services.attorneysColumns,
              }}
            />
          </PageContainer>
        </section>
      ) : null}

      <section className={`${sectionDense} bg-white`}>
        <PageContainer>
          <h2 className="m-0 text-lg font-semibold text-ink">FAQ</h2>
          <dl className="mt-4 space-y-4">
            {d.faq.map((item) => (
              <div key={item.q}>
                <dt className="font-medium text-ink">{item.q}</dt>
                <dd className="mt-1 text-sm text-ink-muted">{item.a}</dd>
              </div>
            ))}
          </dl>

          {related.length > 0 ? (
            <>
              <h2 className="m-0 mt-10 text-lg font-semibold text-ink">
                {locale === "ru"
                  ? "Связанные услуги"
                  : locale === "en"
                    ? "Related services"
                    : "Bogʻliq xizmatlar"}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={localePath(locale, `/services/${r.slug}/`)}
                    className="rounded-xl bg-surface-muted p-4 text-ink transition hover:bg-lime/50"
                  >
                    <p className="m-0 font-semibold">{r.title}</p>
                    <p className="mb-0 mt-1 text-sm text-ink-muted">{r.short}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </PageContainer>
      </section>
    </>
  );
}
