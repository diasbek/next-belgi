/** Shared Tailwind class recipes for Belgi.ai */

export const pageContainer =
  "mx-auto w-[min(calc(100%-2*var(--page-padding)),var(--page-max))]";

export const section = "py-[var(--section-y)]";

export const sectionTitle =
  "m-0 mb-4 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink";

export const sectionLead =
  "m-0 mb-8 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg";

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
  "min-h-14 w-full rounded-[var(--radius-lg)] border border-[#d4b8ff]/70 bg-white px-5 text-base text-ink outline-none placeholder:text-ink-muted/70 focus:border-primary/40";

export const cardLime =
  "rounded-[var(--radius-md)] bg-lime p-5 text-ink shadow-sm md:p-6";

export const cardDark =
  "rounded-[var(--radius-md)] bg-primary p-5 text-white md:p-6";
