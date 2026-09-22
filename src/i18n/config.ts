export const locales = ["uz", "ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

export const localeLabels: Record<Locale, string> = {
  uz: "Oʻzbekcha",
  ru: "Русский",
  en: "English",
};

export const localeLabelsShort: Record<Locale, string> = {
  uz: "Oʻz",
  ru: "Ru",
  en: "En",
};

export const htmlLang: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
  en: "en",
};

export const ogLocale: Record<Locale, string> = {
  uz: "uz_UZ",
  ru: "ru_UZ",
  en: "en_US",
};

export type LocalizedText = Record<Locale, string>;

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (locales as readonly string[]).includes(value)
  );
}

export function parseLocale(
  value: unknown,
  fallback: Locale = defaultLocale,
): Locale {
  return isLocale(value) ? value : fallback;
}

export type PageKey =
  | "home"
  | "agency"
  | "works"
  | "services"
  | "contacts"
  | "check"
  | "checkResult"
  | "login"
  | "register"
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
  register: "/register/",
  privacy: "/privacy/",
  terms: "/terms/",
  notFound: "/404/",
};
