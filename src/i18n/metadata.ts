import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { ogLocale, pagePaths, type PageKey } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { createPageMetadata, canonicalPageUrl } from "@/utils/seo/metadata";

const metaKeyByPage: Record<
  Exclude<PageKey, "notFound">,
  keyof ReturnType<typeof getContent>["meta"]
> = {
  home: "homeTitle",
  agency: "agencyTitle",
  works: "worksTitle",
  services: "servicesTitle",
  contacts: "contactsTitle",
  check: "checkTitle",
  checkResult: "checkResultTitle",
  login: "loginTitle",
  register: "registerTitle",
  privacy: "privacyTitle",
  terms: "termsTitle",
};

const descKeyByPage: Record<
  Exclude<PageKey, "notFound">,
  keyof ReturnType<typeof getContent>["meta"]
> = {
  home: "homeDescription",
  agency: "agencyDescription",
  works: "worksDescription",
  services: "servicesDescription",
  contacts: "contactsDescription",
  check: "checkDescription",
  checkResult: "checkResultDescription",
  login: "loginDescription",
  register: "registerDescription",
  privacy: "privacyDescription",
  terms: "termsDescription",
};

export function getLocalizedPageMetadata(
  locale: Locale,
  page: Exclude<PageKey, "notFound">,
  options?: { noIndex?: boolean },
): Metadata {
  const content = getContent(locale);
  const path = localePath(locale, pagePaths[page]);
  const alternates = getLocalizedAlternates(pagePaths[page]);

  return createPageMetadata(
    String(content.meta[metaKeyByPage[page]]),
    String(content.meta[descKeyByPage[page]]),
    path,
    {
      locale,
      ogLocale: ogLocale[locale],
      noIndex:
        options?.noIndex ??
        (page === "check" ||
          page === "checkResult" ||
          page === "login" ||
          page === "register"),
      alternates: Object.fromEntries(
        Object.entries(alternates).map(([lang, href]) => [
          lang,
          canonicalPageUrl(href),
        ]),
      ),
    },
  );
}
