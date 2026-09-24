import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { PageContainer } from "@/components/atoms/PageContainer";
import { ContactForm } from "@/components/organisms/ContactForm";
import {
  gridSpanHalf,
  section,
  sectionGrid,
  sectionLead,
  sectionTitle,
} from "@/styles/ui";
import { cn } from "@/lib/cn";
import Link from "next/link";

export { ServicesHubView as ServicesPageView } from "@/views/ServicesViews";

export function WorksPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer measure="copy">
        <h1 className={sectionTitle}>{copy.works.title}</h1>
        <p className={sectionLead}>{copy.works.lead}</p>
        <ol className="m-0 list-decimal space-y-3 pl-5 text-ink">
          {copy.home.processSteps.map((step) => (
            <li key={step.title} className="pl-1">
              <p className="m-0 font-semibold">{step.title}</p>
              <p className="m-0 mt-1 text-sm text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8">
          <Link
            href={localePath(locale, "/check/")}
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            {copy.ui.check}
          </Link>
        </p>
      </PageContainer>
    </section>
  );
}

export function ContactsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer>
        <div className={cn(sectionGrid, gridSpanHalf, "items-start gap-y-8")}>
          <div>
            <h1 className={sectionTitle}>{copy.contacts.title}</h1>
            <p className={cn(sectionLead, "mb-0")}>{copy.contacts.lead}</p>
          </div>
          <div>
            <h2 className="m-0 mb-4 text-lg font-semibold">
              {copy.contacts.formTitle}
            </h2>
            <ContactForm locale={locale} content={copy} />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export function PrivacyPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer measure="copy">
        <h1 className={sectionTitle}>{copy.privacy.title}</h1>
        {copy.privacy.body.map((p) => (
          <p key={p} className="mb-4 text-base leading-relaxed text-ink/80">
            {p}
          </p>
        ))}
      </PageContainer>
    </section>
  );
}

export function TermsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer measure="copy">
        <h1 className={sectionTitle}>{copy.terms.title}</h1>
        {copy.terms.body.map((p) => (
          <p key={p} className="mb-4 text-base leading-relaxed text-ink/80">
            {p}
          </p>
        ))}
      </PageContainer>
    </section>
  );
}

export function NotFoundView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer measure="focus" innerClassName="text-center">
        <h1 className={sectionTitle}>{copy.notFound.title}</h1>
        <p className={sectionLead}>{copy.notFound.lead}</p>
      </PageContainer>
    </section>
  );
}
