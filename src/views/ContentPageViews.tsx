import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { PageContainer } from "@/components/atoms/PageContainer";
import { ContactForm } from "@/components/organisms/ContactForm";
import { section, sectionLead, sectionTitle } from "@/styles/ui";

export function AgencyPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer className="max-w-3xl">
        <h1 className={sectionTitle}>{copy.agency.title}</h1>
        <p className={sectionLead}>{copy.agency.lead}</p>
        {copy.agency.body.map((p) => (
          <p key={p} className="mb-4 text-base leading-relaxed text-ink/80">
            {p}
          </p>
        ))}
      </PageContainer>
    </section>
  );
}

export function WorksPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer className="max-w-3xl">
        <h1 className={sectionTitle}>{copy.works.title}</h1>
        <p className={sectionLead}>{copy.works.lead}</p>
        <p className="rounded-2xl bg-lime px-5 py-8 text-ink/70">
          {copy.works.empty}
        </p>
      </PageContainer>
    </section>
  );
}

export function ServicesPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer>
        <h1 className={sectionTitle}>{copy.services.title}</h1>
        <p className={sectionLead}>{copy.services.lead}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {copy.services.items.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl bg-lime p-6 text-ink"
            >
              <h2 className="m-0 text-lg font-semibold">{item.title}</h2>
              <p className="mb-0 mt-3 text-sm leading-relaxed text-ink/75">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function ContactsPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer className="grid max-w-5xl gap-10 md:grid-cols-2">
        <div>
          <h1 className={sectionTitle}>{copy.contacts.title}</h1>
          <p className={sectionLead}>{copy.contacts.lead}</p>
        </div>
        <div>
          <h2 className="m-0 mb-4 text-lg font-semibold">
            {copy.contacts.formTitle}
          </h2>
          <ContactForm locale={locale} content={copy} />
        </div>
      </PageContainer>
    </section>
  );
}

export function LoginPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer className="max-w-lg text-center">
        <h1 className={sectionTitle}>{copy.login.title}</h1>
        <p className={sectionLead}>{copy.login.lead}</p>
        <p className="rounded-2xl bg-surface-muted px-5 py-8 text-ink-muted">
          {copy.login.stubNote}
        </p>
      </PageContainer>
    </section>
  );
}

export function PrivacyPageView({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  return (
    <section className={`${section} bg-white`}>
      <PageContainer className="max-w-3xl">
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
      <PageContainer className="max-w-3xl">
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
      <PageContainer className="max-w-lg text-center">
        <h1 className={sectionTitle}>{copy.notFound.title}</h1>
        <p className={sectionLead}>{copy.notFound.lead}</p>
      </PageContainer>
    </section>
  );
}
