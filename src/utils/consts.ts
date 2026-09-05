import { getPublicEnv } from "./env";
import { getCanonicalSiteUrl } from "./seo/indexing";

export const SITE_CONFIG = {
  name: "Belgi.ai",
  legalName: "Belgi.ai",
  title: "Belgi.ai — AI-проверка товарных знаков в Узбекистане",
  description:
    "AI-сервис проверки товарных знаков в Узбекистане. Найдите похожие знаки и оцените риск до подачи заявки.",
  url: getCanonicalSiteUrl(),
  phone: getPublicEnv("NEXT_PUBLIC_CONTACT_PHONE", "+998901234567"),
  phoneDisplay: "+998 90 123 45 67",
  email: getPublicEnv("NEXT_PUBLIC_CONTACT_EMAIL", ""),
  telegramUrl: getPublicEnv("NEXT_PUBLIC_TELEGRAM_URL", ""),
  instagramUrl: getPublicEnv("NEXT_PUBLIC_INSTAGRAM_URL", ""),
  hours: "",
  address: {
    line: "г. Ташкент, Узбекистан",
    inn: "",
  },
  locales: ["uz", "ru"] as const,
  defaultLocale: "uz" as const,
  themeColor: "#4A4D46",
  analytics: {
    yandexMetrikaId: getPublicEnv("NEXT_PUBLIC_YM_ID"),
    googleAnalyticsId: getPublicEnv("NEXT_PUBLIC_GA_ID"),
    googleTagManagerId: getPublicEnv("NEXT_PUBLIC_GTM_ID"),
  },
  seo: {
    googleSiteVerification: getPublicEnv(
      "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
    ),
    yandexSiteVerification: getPublicEnv(
      "NEXT_PUBLIC_YANDEX_SITE_VERIFICATION",
    ),
  },
} as const;

export type SiteLocale = (typeof SITE_CONFIG.locales)[number];
