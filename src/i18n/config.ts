export const locales = ["uz", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

export const localeLabels: Record<Locale, string> = {
  uz: "Oʻzbekcha",
  ru: "Русский",
};

export const htmlLang: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
};

export const ogLocale: Record<Locale, string> = {
  uz: "uz_UZ",
  ru: "ru_UZ",
};

export type PageKey =
  | "home"
  | "agency"
  | "works"
  | "services"
  | "contacts"
  | "check"
  | "checkResult"
  | "login"
  | "privacy"
  | "terms"
  | "notFound";

export const pagePaths: Record<PageKey, string> = {
  home: "/",
  agency: "/agency/",
  works: "/works/",
  services: "/services/",
  contacts: "/contacts/",
  check: "/check/",
  checkResult: "/check/result/",
  login: "/login/",
  privacy: "/privacy/",
  terms: "/terms/",
  notFound: "/404/",
};
