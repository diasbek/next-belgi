import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { enCopy } from "@/data/en";
import { ruCopy } from "@/data/ru";
import { uzCopy } from "@/data/uz";

const byLocale: Record<Locale, SiteCopy> = {
  uz: uzCopy,
  ru: ruCopy,
  en: enCopy,
};

/** Static content only — TODO(cms): merge overlay when connected. */
export function getContent(locale: Locale): SiteCopy {
  return byLocale[locale] ?? uzCopy;
}
