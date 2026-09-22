import type { Locale } from "@/i18n/config";
import type { NiceClassInfo, NiceLocale, NiceTerm } from "@/data/nice/types";
import classesJson from "@/data/nice/classes.json";

const classes = classesJson as NiceClassInfo[];

const termsCache = new Map<NiceLocale, NiceTerm[]>();

export function toNiceLocale(locale: string | undefined): NiceLocale {
  if (locale === "ru" || locale === "en" || locale === "uz") return locale;
  return "uz";
}

export function getNiceClasses(): NiceClassInfo[] {
  return classes;
}

export function getNiceClass(
  classNumber: number,
): NiceClassInfo | undefined {
  return classes.find((c) => c.classNumber === classNumber);
}

export async function loadNiceTerms(locale: Locale | NiceLocale): Promise<NiceTerm[]> {
  const loc = toNiceLocale(locale);
  const cached = termsCache.get(loc);
  if (cached) return cached;

  let data: NiceTerm[];
  if (loc === "ru") {
    data = (await import("@/data/nice/terms-ru.json")).default as NiceTerm[];
  } else if (loc === "en") {
    data = (await import("@/data/nice/terms-en.json")).default as NiceTerm[];
  } else {
    data = (await import("@/data/nice/terms-uz.json")).default as NiceTerm[];
  }
  termsCache.set(loc, data);
  return data;
}

export function classTitle(
  classNumber: number,
  locale: Locale | NiceLocale,
): string {
  const info = getNiceClass(classNumber);
  if (!info) return String(classNumber);
  return info.titles[toNiceLocale(locale)] || info.titles.en;
}
