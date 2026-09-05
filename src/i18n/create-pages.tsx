import type { Locale } from "@/i18n/config";
import { getLocalizedPageMetadata } from "@/i18n/metadata";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { HomePageView } from "@/views/HomePageView";
import { CheckPageView } from "@/views/CheckPageView";
import { CheckResultPageView } from "@/views/CheckResultPageView";
import { LoginPage } from "@/views/LoginPage";
import { RegisterPage } from "@/views/RegisterPage";
import {
  AgencyPageView,
  WorksPageView,
  ServicesPageView,
  ContactsPageView,
} from "@/views/ContentPageViews";
import {
  LegalDocPageView,
  LegalIndexPageView,
} from "@/views/LegalPageViews";
import {
  getLegalDocByAlias,
  getLegalDocBySlug,
  type LegalDocMeta,
} from "@/data/legal/catalog";
import {
  extractLegalDescription,
  extractLegalTitle,
  loadLegalMarkdown,
} from "@/lib/legal/load";
import { notFound } from "next/navigation";
import { createPageMetadata, canonicalPageUrl } from "@/utils/seo/metadata";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { ogLocale } from "@/i18n/config";
import type { Metadata } from "next";

export function createHomePage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "home"),
    Page: async function HomePage() {
      return (
        <SiteLayout locale={locale}>
          <HomePageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createAgencyPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "agency"),
    Page: async function AgencyPage() {
      return (
        <SiteLayout locale={locale}>
          <AgencyPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createWorksPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "works"),
    Page: async function WorksPage() {
      return (
        <SiteLayout locale={locale}>
          <WorksPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createServicesPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "services"),
    Page: async function ServicesPage() {
      return (
        <SiteLayout locale={locale}>
          <ServicesPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createContactsPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "contacts"),
    Page: async function ContactsPage() {
      return (
        <SiteLayout locale={locale}>
          <ContactsPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createCheckPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "check"),
    Page: async function CheckPage({
      searchParams,
    }: {
      searchParams: Promise<Record<string, string | string[] | undefined>>;
    }) {
      const params = await searchParams;
      const query = String(params.q ?? "");
      const activity = String(params.activity ?? "");
      return (
        <SiteLayout locale={locale}>
          <CheckPageView
            locale={locale}
            query={query}
            activity={activity}
          />
        </SiteLayout>
      );
    },
  };
}

export function createCheckResultPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "checkResult"),
    Page: async function CheckResultPage({
      searchParams,
    }: {
      searchParams: Promise<Record<string, string | string[] | undefined>>;
    }) {
      const params = await searchParams;
      const query = String(params.q ?? "");
      const activity = String(params.activity ?? "");
      return (
        <SiteLayout locale={locale}>
          <CheckResultPageView
            locale={locale}
            query={query}
            activity={activity}
          />
        </SiteLayout>
      );
    },
  };
}

export function createLoginPage(locale: Locale) {
  return {
    generateMetadata: () =>
      getLocalizedPageMetadata(locale, "login", { noIndex: true }),
    Page: async function LoginPageRoute() {
      return <LoginPage locale={locale} />;
    },
  };
}

export function createRegisterPage(locale: Locale) {
  return {
    generateMetadata: () =>
      getLocalizedPageMetadata(locale, "register", { noIndex: true }),
    Page: async function RegisterPageRoute() {
      return <RegisterPage locale={locale} />;
    },
  };
}

function legalMetadata(
  locale: Locale,
  meta: LegalDocMeta,
  path: string,
): Metadata {
  const md = loadLegalMarkdown(locale, meta);
  const title = md
    ? extractLegalTitle(md, meta.footerLabel[locale])
    : meta.footerLabel[locale];
  const description = md
    ? extractLegalDescription(md, meta.footerLabel[locale])
    : meta.footerLabel[locale];
  const noIndex = meta.group === "internal";
  const alternates = getLocalizedAlternates(path);
  return createPageMetadata(title, description, localePath(locale, path), {
    ogLocale: ogLocale[locale],
    alternates: Object.fromEntries(
      Object.entries(alternates).map(([lang, href]) => [
        lang,
        canonicalPageUrl(href),
      ]),
    ),
    noIndex,
  });
}

function LegalDocRoute({
  locale,
  meta,
}: {
  locale: Locale;
  meta: LegalDocMeta;
}) {
  const markdown = loadLegalMarkdown(locale, meta);
  if (!markdown) notFound();
  return (
    <SiteLayout locale={locale}>
      <LegalDocPageView locale={locale} meta={meta} markdown={markdown} />
    </SiteLayout>
  );
}

export function createPrivacyPage(locale: Locale) {
  const meta = getLegalDocByAlias("/privacy/")!;
  return {
    generateMetadata: () => legalMetadata(locale, meta, "/privacy/"),
    Page: async function PrivacyPage() {
      return <LegalDocRoute locale={locale} meta={meta} />;
    },
  };
}

export function createTermsPage(locale: Locale) {
  const meta = getLegalDocByAlias("/terms/")!;
  return {
    generateMetadata: () => legalMetadata(locale, meta, "/terms/"),
    Page: async function TermsPage() {
      return <LegalDocRoute locale={locale} meta={meta} />;
    },
  };
}

export function createLegalAliasPage(locale: Locale, aliasPath: string) {
  const meta = getLegalDocByAlias(aliasPath);
  if (!meta) {
    throw new Error(`Unknown legal alias: ${aliasPath}`);
  }
  return {
    generateMetadata: () => legalMetadata(locale, meta, aliasPath),
    Page: async function LegalAliasPage() {
      return <LegalDocRoute locale={locale} meta={meta} />;
    },
  };
}

export function createLegalIndexPage(locale: Locale) {
  const title =
    locale === "ru" ? "Юридические документы" : "Yuridik hujjatlar";
  const description =
    locale === "ru"
      ? "Публичные условия, документы подачи заявки и внутренние регламенты Belgi.ai."
      : "Belgi.ai ommaviy shartlari, ariza hujjatlari va ichki reglamentlar.";
  const alternates = getLocalizedAlternates("/legal/");
  return {
    generateMetadata: (): Metadata =>
      createPageMetadata(title, description, localePath(locale, "/legal/"), {
        ogLocale: ogLocale[locale],
        alternates: Object.fromEntries(
          Object.entries(alternates).map(([lang, href]) => [
            lang,
            canonicalPageUrl(href),
          ]),
        ),
      }),
    Page: async function LegalIndexPage() {
      return (
        <SiteLayout locale={locale}>
          <LegalIndexPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createLegalSlugPage(locale: Locale, slug: string) {
  const meta = getLegalDocBySlug(slug);
  if (!meta) {
    return {
      generateMetadata: async () => ({}),
      Page: async function MissingLegal() {
        notFound();
      },
    };
  }
  return {
    generateMetadata: () =>
      legalMetadata(locale, meta, `/legal/${meta.slug}/`),
    Page: async function LegalSlugPage() {
      return <LegalDocRoute locale={locale} meta={meta} />;
    },
  };
}
