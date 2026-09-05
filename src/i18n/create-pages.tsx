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
  PrivacyPageView,
  TermsPageView,
} from "@/views/ContentPageViews";

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

export function createPrivacyPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "privacy"),
    Page: async function PrivacyPage() {
      return (
        <SiteLayout locale={locale}>
          <PrivacyPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}

export function createTermsPage(locale: Locale) {
  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "terms"),
    Page: async function TermsPage() {
      return (
        <SiteLayout locale={locale}>
          <TermsPageView locale={locale} />
        </SiteLayout>
      );
    },
  };
}
