import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { ruCopy } from "@/data/ru";
import { uzCopy } from "@/data/uz";

/** Static content only — TODO(cms): merge overlay when connected. */
export function getContent(locale: Locale): SiteCopy {
  return locale === "uz" ? uzCopy : ruCopy;
}
