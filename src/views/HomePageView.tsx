import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import { CheckForm } from "@/components/molecules/CheckForm";
import {
  cardLime,
  contentBand,
  section,
  sectionGrid,
  sectionLead,
  sectionTitle,
} from "@/styles/ui";
import { cn } from "@/lib/cn";

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
    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-ink">
      <svg
        width={40}
        height={40}
        viewBox="0 0 40 40"
        fill="currentColor"
        aria-hidden
      >
        {FEATURE_ICONS[index] ?? FEATURE_ICONS[0]}
      </svg>
    </span>
  );
}

function ProcessIcon({ id }: { id: string }) {
  const map: Record<string, string> = {
    search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35",
    docs: "M7 3h7l5 5v13H7V3Zm7 0v5h5",
    submit: "M12 3v12m0 0 4-4m-4 4-4-4M5 21h14",
    wait: "M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    reply: "M12 18h.01M9 9a3 3 0 1 1 4.5 2.6c-.7.5-1.5 1-1.5 2.4",
    cert: "M9 12l2 2 4-4M7 4h10v16H7z",
  };
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={map[id] ?? map.search}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
        "rounded-2xl bg-white p-3 text-left shadow-md sm:p-4",
        className,
      )}
    >
      <div className="relative">
        <p className="m-0 text-sm font-semibold">{name}</p>
        <p className="m-0 mt-1 text-xs text-ink-muted">{category}</p>
        <p
          className={cn(
            "m-0 mt-2 text-xs font-medium sm:mt-3",
            tone === "high" ? "text-danger" : "text-warning",
          )}
        >
          {risk}
        </p>
        <p className="m-0 text-xs text-ink-muted">{similarity}</p>
        <span
          className={cn(
            "absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full sm:-right-2 sm:-top-2 sm:h-7 sm:w-7",
            tone === "high" ? "bg-danger" : "bg-warning",
          )}
        />
      </div>
    </div>
  );
}

export function HomePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const checkHref = localePath(locale, "/check/");
  const [cardA, cardB] = copy.home.sampleCards;

  return (
    <>
      <section className="overflow-x-clip bg-lime">
        <PageContainer className="pb-12 pt-8 sm:pb-16 sm:pt-10 md:pb-20 md:pt-14">
          <div className="text-center">
            <h1
              className={cn(
                contentBand,
                "m-0 font-display text-[clamp(1.75rem,6vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink",
              )}
            >
              {copy.home.heroTitle}
            </h1>

            {/* Form width stage — sample cards hang outside on lg+ */}
            <div className="relative mx-auto mt-8 w-full max-w-xl sm:mt-10">
              <SampleCard
                {...cardA}
                className="pointer-events-none absolute top-1/2 left-0 z-0 hidden w-40 -translate-x-[calc(100%+0.75rem)] -translate-y-1/2 lg:block xl:w-44 xl:-translate-x-[calc(100%+1.25rem)]"
              />
              <SampleCard
                {...cardB}
                className="pointer-events-none absolute top-1/2 right-0 z-0 hidden w-40 translate-x-[calc(100%+0.75rem)] -translate-y-1/2 lg:block xl:w-44 xl:translate-x-[calc(100%+1.25rem)]"
              />

              <form
                action={checkHref}
                method="get"
                className="relative z-10 flex w-full flex-col gap-2 overflow-hidden rounded-[1.5rem] bg-white p-2 shadow-md sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-[var(--radius-pill)] sm:p-0"
              >
                <label className="sr-only" htmlFor="hero-query">
                  {copy.ui.brandPlaceholder}
                </label>
                <input
                  id="hero-query"
                  name="q"
                  placeholder="Rizq..."
                  className="min-h-12 flex-1 border-0 bg-transparent px-4 text-base outline-none sm:min-h-14 sm:px-6"
                  required
                />
                <input type="hidden" name="activity" value="general" />
                <button
                  type="submit"
                  className="min-h-12 w-full rounded-[var(--radius-pill)] bg-primary px-5 text-sm font-semibold text-white sm:m-1.5 sm:w-auto sm:min-h-0"
                >
                  {copy.ui.check}
                </button>
              </form>

              <div className="mt-5 grid grid-cols-2 gap-[var(--grid-gap)] lg:hidden">
                <SampleCard {...cardA} />
                <SampleCard {...cardB} />
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-[var(--content-copy)] text-sm leading-relaxed text-ink/75 sm:mt-8 md:text-base">
              {copy.home.heroLead}
            </p>
          </div>

          <div className="mt-10 grid w-full gap-[var(--grid-gap)] text-center sm:mt-14 sm:grid-cols-3">
            {copy.home.features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col items-center gap-5"
              >
                <FeatureIcon index={index} />
                <p className="m-0 max-w-[12.5rem] text-sm leading-snug text-ink/60 sm:text-base">
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

      <section className={`${section} bg-primary text-white`}>
        <PageContainer>
          <h2 className="m-0 mb-3 font-display text-[clamp(1.5rem,4.5vw,3rem)] font-semibold leading-tight tracking-[-0.03em]">
            {copy.home.processTitle}
          </h2>
          <p className="m-0 mb-8 max-w-[var(--content-copy)] text-sm text-white/70 sm:mb-10 md:text-base">
            {copy.home.processLead}
          </p>
          <div
            className={cn(
              sectionGrid,
              "[&>*]:col-span-4 sm:[&>*]:col-span-4 lg:[&>*]:col-span-4",
            )}
          >
            {copy.home.processSteps.map((step) => (
              <article
                key={step.id}
                className={cn(cardLime, "flex h-full flex-col")}
              >
                <ProcessIcon id={step.id} />
                <h3 className="mb-2 mt-4 text-base font-semibold">{step.title}</h3>
                <p className="m-0 flex-1 text-sm leading-relaxed text-ink/75">
                  {step.text}
                </p>
                <p className="mb-0 mt-4 text-xs font-medium text-ink/55">
                  {step.duration}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-white`}>
        <PageContainer>
          <h2 className={sectionTitle}>{copy.home.analysisTitle}</h2>
          <p className={sectionLead}>{copy.home.analysisLead}</p>
          <div
            className={cn(
              sectionGrid,
              "[&>*]:col-span-4 sm:[&>*]:col-span-4 lg:[&>*]:col-span-3",
            )}
          >
            {copy.home.analysisSteps.map((step) => (
              <article
                key={step.id}
                className={cn(cardLime, "min-h-0 sm:min-h-[8rem]")}
              >
                <p className="m-0 text-xl font-semibold text-ink/40 sm:text-2xl">
                  {step.number}
                </p>
                <p className="mb-0 mt-4 text-sm font-medium leading-snug sm:mt-8">
                  {step.title}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
