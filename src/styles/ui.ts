/** Shared layout + UI recipes for Belgi.ai */

/** Outer shell — same width for header, sections, footer */
export const pageContainer =
  "mx-auto w-full max-w-[var(--page-max)] pl-[max(var(--page-padding),env(safe-area-inset-left))] pr-[max(var(--page-padding),env(safe-area-inset-right))]";

/**
 * Inner measures (always inside pageContainer).
 * - full: section grids / cards edge-aligned with header
 * - band: centered marketing block (hero title + form)
 * - copy: readable prose
 * - focus: empty / login / loading
 */
export const contentFull = "w-full min-w-0";
export const contentBand =
  "mx-auto w-full min-w-0 max-w-[var(--content-band)]";
export const contentCopy =
  "mx-auto w-full min-w-0 max-w-[var(--content-copy)]";
export const contentFocus =
  "mx-auto w-full min-w-0 max-w-[var(--content-focus)]";

export type ContentMeasure = "full" | "band" | "copy" | "focus";

export const contentMeasureClass: Record<ContentMeasure, string> = {
  full: contentFull,
  band: contentBand,
  copy: contentCopy,
  focus: contentFocus,
};

/** 12-col section grid — gap from tokens */
export const sectionGrid =
  "grid w-full min-w-0 grid-cols-4 gap-[var(--grid-gap)] sm:grid-cols-8 lg:grid-cols-12";

/**
 * Span recipes for children of sectionGrid:
 * - gridSpanHalf: 1 → 1 (sm) → 2 (lg)
 * - gridSpanThird: 2 on mobile → 2 (sm) → 3 (lg) — process / dense cards
 * - gridSpanThirdStack: 1 → 2 (sm) → 3 (lg) — taller service cards
 * - gridSpanQuarter: 2 on mobile → 2 (sm) → 4 (lg)
 */
export const gridSpanHalf =
  "[&>*]:col-span-4 sm:[&>*]:col-span-4 lg:[&>*]:col-span-6";
export const gridSpanThird =
  "[&>*]:col-span-2 sm:[&>*]:col-span-4 lg:[&>*]:col-span-4";
export const gridSpanThirdStack =
  "[&>*]:col-span-4 sm:[&>*]:col-span-4 lg:[&>*]:col-span-4";
export const gridSpanQuarter =
  "[&>*]:col-span-2 sm:[&>*]:col-span-4 lg:[&>*]:col-span-3";

/** Default marketing band padding */
export const section = "py-[var(--section-y)]";

/** Card-heavy blocks (process, analysis, attorneys) */
export const sectionDense = "py-[var(--section-y-dense)]";

/**
 * First-screen hero: fill viewport below sticky header.
 * Pair with overflow-x-clip on the section when needed.
 */
export const sectionHero =
  "flex min-h-[calc(100dvh-var(--header-height))] flex-col justify-center py-[var(--section-y-dense)]";

/** Auth / loading: center in remaining viewport */
export const sectionViewportCenter =
  "flex min-h-[calc(100dvh-var(--header-height))] flex-col justify-center py-[var(--section-y-dense)]";

export const sectionTitle =
  "m-0 mb-4 font-display text-[clamp(1.5rem,4.5vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink";

export const sectionLead =
  "m-0 mb-8 max-w-[var(--content-copy)] text-base leading-relaxed text-ink-muted md:text-lg";

export const btnPrimary =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";

export const btnSecondary =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border border-ink/25 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted";

export const btnGhost =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 bg-transparent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-black/5";

export const btnOnDark =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 bg-lime px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-92";

export const btnHeroPrimary = btnPrimary;
export const btnHeroSecondary = btnSecondary;

export const fieldInput =
  "min-h-14 w-full rounded-[var(--radius-lg)] border-2 border-[#7a7e74] bg-white px-4 text-base text-ink outline-none placeholder:text-[#3a3e38] focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-5";

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2";

export const skeletonPulse =
  "animate-pulse rounded-xl bg-black/5";

export const cardLime =
  "rounded-[var(--radius-md)] bg-lime p-4 text-ink shadow-sm sm:p-5 md:p-6";

/** Compact card for dense mobile grids */
export const cardLimeCompact =
  "rounded-[var(--radius-md)] bg-lime p-3 text-ink shadow-sm sm:p-4 md:p-5";

export const cardDark =
  "rounded-[var(--radius-md)] bg-primary p-4 text-white sm:p-5 md:p-6";
