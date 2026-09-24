import type { ReactNode } from "react";
import { PageContainer } from "@/components/atoms/PageContainer";
import { sectionLead, sectionTitle } from "@/styles/ui";
import { cn } from "@/lib/cn";

export type PageHeroProps = {
  title: string;
  lead?: string;
  /** Small uppercase brand line (hub pages) */
  eyebrow?: ReactNode;
  /** Breadcrumb or back link above the title */
  breadcrumb?: ReactNode;
  /** CTA row under the lead */
  actions?: ReactNode;
  /** Title measure in ch — services hub 18, detail 22 */
  titleMaxCh?: number;
  /** Extra bottom padding on large screens (hub) */
  spacious?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Marketing page hero — lime gradient band matching /services.
 */
export function PageHero({
  title,
  lead,
  eyebrow,
  breadcrumb,
  actions,
  titleMaxCh = 22,
  spacious = false,
  className,
  children,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-lime via-white to-surface-muted",
        className,
      )}
    >
      <PageContainer
        className={cn(
          "py-12 sm:py-16",
          spacious && "md:py-20",
        )}
      >
        {eyebrow ? (
          <p className="m-0 font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink/70">
            {eyebrow}
          </p>
        ) : null}
        {breadcrumb ? (
          <div className="m-0 text-sm text-ink-muted">{breadcrumb}</div>
        ) : null}
        <h1
          className={cn(
            sectionTitle,
            "mt-2 mb-0",
            titleMaxCh ? `max-w-[${titleMaxCh}ch]` : null,
          )}
          style={
            titleMaxCh
              ? ({ maxWidth: `${titleMaxCh}ch` } as React.CSSProperties)
              : undefined
          }
        >
          {title}
        </h1>
        {lead ? (
          <p className={cn(sectionLead, "mt-4 mb-0 max-w-[40rem]")}>{lead}</p>
        ) : null}
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        {children}
      </PageContainer>
    </section>
  );
}

/** Primary CTA button style used on service / marketing heroes */
export function pageHeroPrimaryClassName() {
  return "inline-flex rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white";
}

/** Secondary CTA button style used on service / marketing heroes */
export function pageHeroSecondaryClassName() {
  return "inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-ink/15";
}
