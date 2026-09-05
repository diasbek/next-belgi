import { defaultLocale, locales, type Locale } from "./config";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function localePathWithoutHash(locale: Locale, path: string): string {
  const normalized = normalizePath(path);
  if (locale === defaultLocale) return normalized;
  if (normalized === "/") return `/${locale}/`;
  return `/${locale}${normalized}`;
}

export function localePath(locale: Locale, path: string): string {
  if (path.includes("#")) {
    const hashIndex = path.indexOf("#");
    const base = path.slice(0, hashIndex) || "/";
    const hash = path.slice(hashIndex + 1).split("#")[0] ?? "";
    const localizedBase = localePathWithoutHash(locale, base || "/");
    const withSlash =
      localizedBase.endsWith("/") || localizedBase === "/"
        ? localizedBase
        : `${localizedBase}/`;
    return hash ? `${withSlash}#${hash}` : withSlash;
  }

  return localePathWithoutHash(locale, path);
}

export function stripLocalePrefix(pathname: string): {
  locale: Locale;
  path: string;
} {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (clean === `/${locale}` || clean === `/${locale}/`) {
      return { locale, path: "/" };
    }
    if (clean.startsWith(`/${locale}/`)) {
      return { locale, path: clean.slice(locale.length + 1) || "/" };
    }
  }
  return { locale: defaultLocale, path: clean };
}

export function getLocalizedAlternates(path: string) {
  const normalized = normalizePath(path);
  return {
    "x-default": localePath(defaultLocale, normalized),
    ru: localePath("ru", normalized),
    uz: localePath("uz", normalized),
  };
}

export function switchLocalePath(
  pathname: string,
  target: Locale,
  search = "",
): string {
  const { path } = stripLocalePrefix(pathname);
  const base = localePath(target, path);
  if (!search) return base;
  const q = search.startsWith("?") ? search : `?${search}`;
  return `${base}${q}`;
}
