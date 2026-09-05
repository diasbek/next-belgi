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

export const section = "py-[var(--section-y)]";

export const sectionTitle =
  "m-0 mb-4 font-display text-[clamp(1.5rem,4.5vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink";

export const sectionLead =
  "m-0 mb-8 max-w-[var(--content-copy)] text-base leading-relaxed text-ink-muted md:text-lg";

export const btnPrimary =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";

export const btnSecondary =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border border-primary/20 bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted";

export const btnGhost =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 bg-transparent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-black/5";

export const btnOnDark =
  "inline-flex min-h-[var(--tap-min)] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 bg-lime px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-92";

export const btnHeroPrimary = btnPrimary;
export const btnHeroSecondary = btnSecondary;

export const fieldInput =
  "min-h-14 w-full rounded-[var(--radius-lg)] border border-[#d4b8ff]/70 bg-white px-4 text-base text-ink outline-none placeholder:text-ink-muted/70 focus:border-primary/40 sm:px-5";

export const cardLime =
  "rounded-[var(--radius-md)] bg-lime p-4 text-ink shadow-sm sm:p-5 md:p-6";

export const cardDark =
  "rounded-[var(--radius-md)] bg-primary p-4 text-white sm:p-5 md:p-6";
