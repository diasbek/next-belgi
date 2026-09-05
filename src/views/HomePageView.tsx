import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { CheckForm } from "@/components/molecules/CheckForm";
import { cardLime, section, sectionLead, sectionTitle } from "@/styles/ui";

function FeatureIcon({ index }: { index: number }) {
  const paths = [
    "M4 12h16M12 4v16",
    "M12 6v6l4 2",
    "M4 6h16v12H4z",
  ];
  return (
    <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-ink/20">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={paths[index] ?? paths[0]}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
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

export function HomePageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const checkHref = localePath(locale, "/check/");

  return (
    <>
      <section className="bg-lime">
        <PageContainer className="pb-16 pt-10 md:pb-20 md:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="m-0 font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">
              {copy.home.heroTitle}
            </h1>

            <div className="relative mx-auto mt-10 max-w-xl">
              <div className="absolute -left-2 top-1/2 hidden w-40 -translate-x-full -translate-y-1/2 rounded-2xl bg-white p-4 text-left shadow-md md:block lg:-left-8 lg:w-44">
                <p className="m-0 text-sm font-semibold">
                  {copy.home.sampleCards[0].name}
                </p>
                <p className="m-0 mt-1 text-xs text-ink-muted">
                  {copy.home.sampleCards[0].category}
                </p>
                <p className="m-0 mt-3 text-xs font-medium text-danger">
                  {copy.home.sampleCards[0].risk}
                </p>
                <p className="m-0 text-xs text-ink-muted">
                  {copy.home.sampleCards[0].similarity}
                </p>
                <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-danger" />
              </div>

              <div className="absolute -right-2 top-1/2 hidden w-40 translate-x-full -translate-y-1/2 rounded-2xl bg-white p-4 text-left shadow-md md:block lg:-right-8 lg:w-44">
                <p className="m-0 text-sm font-semibold">
                  {copy.home.sampleCards[1].name}
                </p>
                <p className="m-0 mt-1 text-xs text-ink-muted">
                  {copy.home.sampleCards[1].category}
                </p>
                <p className="m-0 mt-3 text-xs font-medium text-warning">
                  {copy.home.sampleCards[1].risk}
                </p>
                <p className="m-0 text-xs text-ink-muted">
                  {copy.home.sampleCards[1].similarity}
                </p>
                <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-warning" />
              </div>

              <form
                action={checkHref}
                method="get"
                className="relative z-10 flex overflow-hidden rounded-[var(--radius-pill)] bg-white shadow-md"
              >
                <label className="sr-only" htmlFor="hero-query">
                  {copy.ui.brandPlaceholder}
                </label>
                <input
                  id="hero-query"
                  name="q"
                  placeholder="Rizq..."
                  className="min-h-14 flex-1 border-0 bg-transparent px-6 text-base outline-none"
                  required
                />
                <input type="hidden" name="activity" value="general" />
                <button
                  type="submit"
                  className="m-1.5 rounded-[var(--radius-pill)] bg-primary px-5 text-sm font-semibold text-white"
                >
                  {copy.ui.check}
                </button>
              </form>
            </div>

            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-ink/75 md:text-base">
              {copy.home.heroLead}
            </p>

            <div className="mt-8">
              <Button href={`${checkHref}`} className="px-8 py-4 text-base">
                {copy.home.heroCta}
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl gap-8 text-center sm:grid-cols-3">
            {copy.home.features.map((feature, index) => (
              <div key={feature.title}>
                <FeatureIcon index={index} />
                <p className="m-0 text-sm font-medium text-ink">{feature.title}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-white`} id="check">
        <PageContainer>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className={sectionTitle}>{copy.home.checkTitle}</h2>
            <CheckForm
              locale={locale}
              brandPlaceholder={copy.ui.brandPlaceholder}
              activityPlaceholder={copy.ui.activityPlaceholder}
              submitLabel={copy.ui.check}
              compact
              className="mx-auto mt-8"
            />
            <p className={`${sectionLead} mx-auto mt-6 mb-0`}>
              {copy.home.checkLead}
            </p>
          </div>
        </PageContainer>
      </section>

      <section className={`${section} bg-primary text-white`}>
        <PageContainer>
          <h2 className="m-0 mb-3 max-w-3xl font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.03em]">
            {copy.home.processTitle}
          </h2>
          <p className="m-0 mb-10 max-w-md text-sm text-white/70 md:text-base">
            {copy.home.processLead}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {copy.home.processSteps.map((step) => (
              <article key={step.id} className={cardLime}>
                <ProcessIcon id={step.id} />
                <h3 className="mb-2 mt-4 text-base font-semibold">{step.title}</h3>
                <p className="m-0 text-sm leading-relaxed text-ink/75">
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
          <h2 className={`${sectionTitle} max-w-3xl`}>
            {copy.home.analysisTitle}
          </h2>
          <p className={sectionLead}>{copy.home.analysisLead}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {copy.home.analysisSteps.map((step) => (
              <article key={step.id} className={`${cardLime} min-h-[9rem]`}>
                <p className="m-0 text-2xl font-semibold text-ink/40">
                  {step.number}
                </p>
                <p className="mb-0 mt-8 text-sm font-medium leading-snug">
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
