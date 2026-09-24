import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  PageHero,
  pageHeroPrimaryClassName,
} from "@/components/molecules/PageHero";
import {
  gridSpanThirdStack,
  section,
  sectionDense,
  sectionGrid,
} from "@/styles/ui";
import { cn } from "@/lib/cn";

export function CoveragePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);

  return (
    <>
      <PageHero
        eyebrow="Belgi.ai"
        title={copy.coverage.title}
        lead={copy.coverage.lead}
        actions={
          <Link
            href={localePath(locale, "/check/")}
            className={pageHeroPrimaryClassName()}
          >
            {copy.coverage.cta}
          </Link>
        }
      />

      <section className={`${sectionDense} bg-white`}>
        <PageContainer>
          <div className={cn(sectionGrid, gridSpanThirdStack)}>
            {copy.coverage.items.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl bg-lime p-4 text-ink sm:p-5 md:p-6"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h2 className="m-0 text-lg font-semibold">{item.title}</h2>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      item.status === "live"
                        ? "bg-ink/10 text-ink"
                        : "bg-white/60 text-ink/70",
                    )}
                  >
                    {item.status === "live"
                      ? copy.coverage.liveLabel
                      : copy.coverage.plannedLabel}
                  </span>
                </div>
                <p className="mb-0 text-sm leading-relaxed text-ink/75">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-surface-muted`}>
        <PageContainer measure="copy">
          <p className="m-0 text-sm leading-relaxed text-ink-muted">
            {copy.coverage.disclaimer}
          </p>
        </PageContainer>
      </section>
    </>
  );
}
