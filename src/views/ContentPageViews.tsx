import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  PageHero,
  pageHeroPrimaryClassName,
} from "@/components/molecules/PageHero";
import { ContactForm } from "@/components/organisms/ContactForm";
import { sectionDense } from "@/styles/ui";
import Link from "next/link";

export { ServicesHubView as ServicesPageView } from "@/views/ServicesViews";

export function WorksPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <>
      <PageHero
        eyebrow="Belgi.ai"
        title={copy.works.title}
        lead={copy.works.lead}
        actions={
          <Link
            href={localePath(locale, "/check/")}
            className={pageHeroPrimaryClassName()}
          >
            {copy.ui.check}
          </Link>
        }
      />
      <section className={`${sectionDense} bg-white`}>
        <PageContainer measure="copy">
          <ol className="m-0 list-decimal space-y-3 pl-5 text-ink">
            {copy.home.processSteps.map((step) => (
              <li key={step.title} className="pl-1">
                <p className="m-0 font-semibold">{step.title}</p>
                <p className="m-0 mt-1 text-sm text-ink-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>
    </>
  );
}

export function ContactsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <>
      <PageHero
        eyebrow="Belgi.ai"
        title={copy.contacts.title}
        lead={copy.contacts.lead}
      />
      <section className={`${sectionDense} bg-white`}>
        <PageContainer>
          <h2 className="m-0 mb-4 text-lg font-semibold text-ink">
            {copy.contacts.formTitle}
          </h2>
          <div className="max-w-xl">
            <ContactForm locale={locale} content={copy} />
          </div>
        </PageContainer>
      </section>
    </>
  );
}

export function PrivacyPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <>
      <PageHero eyebrow="Belgi.ai" title={copy.privacy.title} />
      <section className={`${sectionDense} bg-white`}>
        <PageContainer measure="copy">
          {copy.privacy.body.map((p) => (
            <p key={p} className="mb-4 text-base leading-relaxed text-ink/80">
              {p}
            </p>
          ))}
        </PageContainer>
      </section>
    </>
  );
}

export function TermsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <>
      <PageHero eyebrow="Belgi.ai" title={copy.terms.title} />
      <section className={`${sectionDense} bg-white`}>
        <PageContainer measure="copy">
          {copy.terms.body.map((p) => (
            <p key={p} className="mb-4 text-base leading-relaxed text-ink/80">
              {p}
            </p>
          ))}
        </PageContainer>
      </section>
    </>
  );
}

export function NotFoundView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <>
      <PageHero
        eyebrow="Belgi.ai"
        title={copy.notFound.title}
        lead={copy.notFound.lead}
        actions={
          <Link href={localePath(locale, "/")} className={pageHeroPrimaryClassName()}>
            Belgi.ai
          </Link>
        }
      />
    </>
  );
}
