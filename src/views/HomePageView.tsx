import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import { CheckForm } from "@/components/molecules/CheckForm";
import {
  contentBand,
  fieldInputBare,
  fieldShell,
  section,
  sectionLead,
  sectionTitle,
} from "@/styles/ui";
import { cn } from "@/lib/cn";
import type { AnalysisStep } from "@/data/types";

const PROCESS_ICONS: Record<string, { png: string; webp: string }> = {
  search: {
    png: "/images/process/search.png",
    webp: "/images/process/search.webp",
  },
  docs: {
    png: "/images/process/docs.png",
    webp: "/images/process/docs.webp",
  },
  submit: {
    png: "/images/process/submit.png",
    webp: "/images/process/submit.webp",
  },
  wait: {
    png: "/images/process/wait.png",
    webp: "/images/process/wait.webp",
  },
  reply: {
    png: "/images/process/reply.png",
    webp: "/images/process/reply.webp",
  },
  cert: {
    png: "/images/process/cert.png",
    webp: "/images/process/cert.webp",
  },
};

/** Figma assets: ibm-cloud--citrix-daas, time, condition--wait-point */
const FEATURE_ICONS = [
  <path
    key="online"
    d="M28.75 33.75H23.75V28.75H28.75V33.75ZM37.5 33.75H32.5V28.75H37.5V33.75ZM20 5C26.25 5 31.25 10 31.25 16.25H28.75C28.75 11.375 24.875 7.5 20 7.5C15.625 7.5 11.875 10.75 11.375 15.25L11.25 16.25H10.125C7.25 16.5 5 19 5 21.875C5 25 7.5 27.5 10.625 27.5H20V30H10.625C6.125 30 2.5 26.375 2.5 21.875C2.5 18 5.25 14.625 9 13.875C10.125 8.75 14.625 5 20 5ZM28.75 25H23.75V20H28.75V25ZM37.5 25H32.5V20H37.5V25Z"
  />,
  <path
    key="time"
    d="M16.5863 2.83631C19.9809 2.16112 23.5 2.5079 26.6976 3.83241C29.8952 5.15696 32.6283 7.39998 34.5512 10.2777C36.4741 13.1556 37.5004 16.5392 37.5004 20.0004C37.5003 24.6416 35.6563 29.0925 32.3744 32.3744C29.0925 35.6563 24.6416 37.5003 20.0004 37.5004C16.5392 37.5004 13.1556 36.4741 10.2777 34.5512C7.39998 32.6283 5.15696 29.8952 3.83241 26.6976C2.5079 23.5 2.16112 19.9809 2.83631 16.5863C3.51155 13.1916 5.17893 10.0738 7.62635 7.62635C10.0738 5.17894 13.1916 3.51156 16.5863 2.83631ZM20.0004 5.00038C17.0337 5.00038 14.1331 5.87951 11.6664 7.52772C9.19965 9.17594 7.27729 11.5193 6.14198 14.2601C5.00677 17.0009 4.70981 20.0166 5.28846 22.9262C5.86724 25.8359 7.29614 28.509 9.39393 30.6068C11.4916 32.7045 14.164 34.1335 17.0736 34.7123C19.9833 35.2911 22.9997 34.9941 25.7406 33.8588C28.4815 32.7235 30.8238 30.8001 32.4721 28.3334C34.1202 25.8667 35.0003 22.967 35.0004 20.0004C35.0004 16.0222 33.4198 12.207 30.6068 9.39393C27.7938 6.58092 23.9786 5.00041 20.0004 5.00038ZM21.2504 19.475L27.5004 25.7377L25.7377 27.5004L18.7504 20.5131V8.75038H21.2504V19.475Z"
  />,
  <path
    key="report"
    d="M20.0003 2.5C24.6415 2.50007 29.0925 4.34415 32.3743 7.62598C35.6561 10.9079 37.5003 15.3588 37.5003 20C37.5003 23.4612 36.474 26.8448 34.5511 29.7227C32.6281 32.6005 29.8943 34.8434 26.6966 36.168C23.4991 37.4923 19.9806 37.8392 16.5862 37.1641C13.1915 36.4888 10.0727 34.8214 7.62527 32.374C5.17805 29.9267 3.51142 26.8086 2.83621 23.4141C2.16098 20.0194 2.50777 16.5004 3.8323 13.3027C5.15685 10.1052 7.39985 7.37208 10.2776 5.44922C13.1555 3.52633 16.5391 2.5 20.0003 2.5ZM20.0003 5C16.0235 5.0045 12.2108 6.58645 9.39871 9.39844C6.58664 12.2105 5.00477 16.0231 5.00027 20C5.00027 22.9667 5.87939 25.8672 7.52762 28.334C9.17583 30.8007 11.5192 32.7231 14.26 33.8584C17.0007 34.9936 20.0165 35.2906 22.9261 34.7119C25.8358 34.1331 28.5089 32.7042 30.6067 30.6064C32.7044 28.5088 34.1334 25.8363 34.7122 22.9268C35.291 20.0171 34.9939 17.0006 33.8587 14.2598C32.7234 11.5189 30.8 9.17654 28.3333 7.52832C25.8666 5.88016 22.9669 5.00005 20.0003 5ZM30.0003 20L20.0003 30L10.0003 20L20.0003 10L30.0003 20Z"
  />,
] as const;

function FeatureIcon({ index }: { index: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-ink sm:h-10 sm:w-10">
      <svg
        width={40}
        height={40}
        viewBox="0 0 40 40"
        fill="currentColor"
        className="h-full w-full"
        aria-hidden
      >
        {FEATURE_ICONS[index] ?? FEATURE_ICONS[0]}
      </svg>
    </span>
  );
}

function ProcessStepIcon({ id }: { id: string }) {
  const asset = PROCESS_ICONS[id] ?? PROCESS_ICONS.search;
  return (
    <picture>
      <source srcSet={asset.webp} type="image/webp" />
      <img
        src={asset.png}
        alt=""
        width={160}
        height={160}
        decoding="async"
        loading="lazy"
        className="h-[4.5rem] w-[4.5rem] object-contain sm:h-[5.5rem] sm:w-[5.5rem] lg:h-[7rem] lg:w-[7rem]"
      />
    </picture>
  );
}

function AnalysisDocIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-ink/55"
    >
      <path
        d="M7 3h7l5 5v13H7V3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5M9 13h6M9 17h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnalysisRow({
  step,
  highlight = false,
}: {
  step: AnalysisStep;
  highlight?: boolean;
}) {
  const label = step.title.replace(/\.$/, "");
  const num = String(step.number).padStart(2, "0");

  return (
    <div
      className={cn(
        "flex min-h-[3.25rem] items-center gap-3 py-3.5 sm:min-h-[3.5rem] sm:gap-4 sm:py-4",
        highlight &&
          "rounded-2xl bg-lime px-3 sm:px-4 md:rounded-[1.25rem]",
      )}
    >
      <span className="w-7 shrink-0 text-sm tabular-nums text-ink/35 sm:w-8 sm:text-base">
        {num}
      </span>
      <span className="min-w-0 flex-1 text-left text-sm font-medium leading-snug text-ink sm:text-base">
        {label}
      </span>
      {highlight ? <AnalysisDocIcon /> : null}
    </div>
  );
}

function SampleCard({
  name,
  category,
  risk,
  similarity,
  tone,
  className,
}: {
  name: string;
  category: string;
  risk: string;
  similarity: string;
  tone: "high" | "medium";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[1.25rem] bg-white p-4 pr-10 text-left shadow-md sm:rounded-[1.5rem] sm:p-5 sm:pr-11",
        className,
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 h-5 w-5 rounded-full sm:right-3.5 sm:top-3.5 sm:h-6 sm:w-6",
          tone === "high" ? "bg-danger" : "bg-warning",
        )}
        aria-hidden
      />
      <p className="m-0 text-sm font-semibold leading-snug sm:text-base">
        {name}
      </p>
      <p className="m-0 mt-1 text-xs text-ink-muted sm:text-sm">{category}</p>
      <p className="m-0 mt-3 text-sm font-medium text-danger">{risk}</p>
      <p className="m-0 mt-0.5 text-xs text-ink-muted sm:text-sm">{similarity}</p>
    </div>
  );
}

export function HomePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const checkHref = localePath(locale, "/check/");
  const [cardA, cardB] = copy.home.sampleCards;

  return (
    <>
      <section
        className={cn(
          "flex min-h-[calc(100dvh-var(--header-height))] flex-col justify-between overflow-x-clip bg-lime py-[var(--section-y-dense)]",
        )}
      >
        <PageContainer className="flex flex-1 flex-col justify-center">
          <div className="mx-auto flex w-full max-w-[72rem] flex-col items-center text-center">
            <h1 className="m-0 max-w-[42rem] font-display text-[clamp(1.85rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink lg:max-w-[48rem]">
              {copy.home.heroTitle}
            </h1>

            <p className="m-0 mt-4 max-w-[36rem] text-sm leading-relaxed text-ink/70 sm:mt-5 sm:text-base md:text-lg">
              {copy.home.heroLead}
            </p>

            {/* Mobile / tablet: form then 2 sample cards */}
            <div className="mt-8 w-full max-w-lg sm:mt-10 lg:hidden">
              <form
                action={checkHref}
                method="get"
                className={cn(
                  fieldShell,
                  "flex-col sm:flex-row sm:gap-0 rounded-[1.5rem] sm:rounded-[var(--radius-pill)]",
                )}
              >
                <label className="sr-only" htmlFor="hero-query">
                  {copy.ui.brandPlaceholder}
                </label>
                <input
                  id="hero-query"
                  name="q"
                  placeholder={copy.ui.brandPlaceholder}
                  className={fieldInputBare}
                  required
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="min-h-12 w-full shrink-0 rounded-[var(--radius-pill)] bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:min-h-14 sm:w-auto sm:px-7"
                >
                  {copy.ui.check}
                </button>
              </form>
              <div className="mt-5 grid grid-cols-2 items-stretch gap-3 sm:gap-4">
                <SampleCard {...cardA} />
                <SampleCard {...cardB} />
              </div>
            </div>

            {/* Desktop: card | form | card — no absolute positioning */}
            <div className="mt-10 hidden w-full items-center gap-5 xl:gap-7 lg:grid lg:grid-cols-[minmax(11rem,14rem)_minmax(20rem,32rem)_minmax(11rem,14rem)] lg:justify-center">
              <SampleCard {...cardA} className="pointer-events-none w-full" />
              <form
                action={checkHref}
                method="get"
                className={fieldShell}
              >
                <label className="sr-only" htmlFor="hero-query-desktop">
                  {copy.ui.brandPlaceholder}
                </label>
                <input
                  id="hero-query-desktop"
                  name="q"
                  placeholder={copy.ui.brandPlaceholder}
                  className={fieldInputBare}
                  required
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="min-h-14 shrink-0 rounded-[var(--radius-pill)] bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  {copy.ui.check}
                </button>
              </form>
              <SampleCard {...cardB} className="pointer-events-none w-full" />
            </div>
          </div>
        </PageContainer>

        <PageContainer>
          <div className="mx-auto grid w-full max-w-[48rem] grid-cols-3 gap-4 pb-1 text-center sm:gap-8 sm:pb-2">
            {copy.home.features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex min-w-0 flex-col items-center gap-2.5 sm:gap-3"
              >
                <FeatureIcon index={index} />
                <p className="m-0 max-w-[13rem] text-xs leading-snug text-ink/70 sm:text-sm md:text-[0.95rem]">
                  {feature.title}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-white`} id="check">
        <PageContainer>
          <div className={cn(contentBand, "text-center")}>
            <h2 className={sectionTitle}>{copy.home.checkTitle}</h2>
            <CheckForm
              locale={locale}
              brandPlaceholder={copy.ui.brandPlaceholder}
              activityPlaceholder={copy.ui.activityPlaceholder}
              submitLabel={copy.ui.check}
              compact
              idPrefix="home-check"
              className="mx-auto mt-6 sm:mt-8"
            />
            <p className={`${sectionLead} mx-auto mt-6 mb-0`}>
              {copy.home.checkLead}
            </p>
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-[#30352F] text-white`}>
        <PageContainer>
          <h2 className="m-0 mb-2 max-w-[40rem] font-display text-[clamp(1.5rem,4.5vw,3rem)] font-semibold leading-tight tracking-[-0.03em] sm:mb-3">
            {copy.home.processTitle}
          </h2>
          <p className="m-0 mb-8 max-w-[var(--content-copy)] text-sm text-white/65 sm:mb-10 sm:text-base md:text-lg">
            {copy.home.processLead}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {copy.home.processSteps.map((step, index) => {
              const isLast = index === copy.home.processSteps.length - 1;
              const num = String(index + 1).padStart(2, "0");
              return (
                <article
                  key={step.id}
                  className={cn(
                    "flex min-h-[16rem] flex-col rounded-[1.5rem] p-5 text-ink sm:min-h-[17.5rem] sm:rounded-[1.75rem] sm:p-6 lg:min-h-[19rem] lg:p-7",
                    isLast ? "bg-lime" : "bg-[#F5F5EF]",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
                    <span className="pt-1 text-sm tabular-nums text-ink/40 sm:text-base">
                      {num}
                    </span>
                    <ProcessStepIcon id={step.id} />
                  </div>
                  <h3 className="m-0 text-base font-semibold leading-snug sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mb-0 mt-2 flex-1 text-sm leading-relaxed text-ink/75">
                    {step.text}
                  </p>
                </article>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-surface-muted`}>
        <PageContainer>
          <h2 className={cn(sectionTitle, "max-w-[var(--content-copy)]")}>
            {copy.home.analysisTitle}
          </h2>
          <p className="m-0 mb-6 text-base text-ink-muted sm:mb-8 md:text-lg">
            {copy.home.analysisLead}
          </p>

          {/* Mobile: single column */}
          <ol className="m-0 list-none p-0 md:hidden">
            {copy.home.analysisSteps.map((step, index) => {
              const isLast = index === copy.home.analysisSteps.length - 1;
              return (
                <li
                  key={step.id}
                  className={cn(
                    !isLast && "border-b border-black/[0.08]",
                    isLast && "mt-1",
                  )}
                >
                  <AnalysisRow step={step} highlight={isLast} />
                </li>
              );
            })}
          </ol>

          {/* Desktop / tablet: 2 columns, shared row rules */}
          <div className="hidden md:block" role="list">
            {Array.from({ length: 6 }, (_, row) => {
              const left = copy.home.analysisSteps[row];
              const right = copy.home.analysisSteps[row + 6];
              const isLastRow = row === 5;
              return (
                <div
                  key={left.id}
                  role="presentation"
                  className={cn(
                    "grid grid-cols-2 gap-x-8 lg:gap-x-14 xl:gap-x-20",
                    !isLastRow && "border-b border-black/[0.08]",
                  )}
                >
                  <div role="listitem">
                    <AnalysisRow step={left} />
                  </div>
                  <div role="listitem">
                    <AnalysisRow step={right} highlight={isLastRow} />
                  </div>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
