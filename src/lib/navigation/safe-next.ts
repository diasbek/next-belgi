import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";

export type CheckActionPath = "/check/" | "/account/check/";

/**
 * Allow only same-origin relative paths for post-auth / post-billing redirects.
 * Rejects protocol-relative (`//`), absolute URLs, and empty values.
 */
export function safeInternalNext(
  raw: string | null | undefined,
  fallback: string,
): string {
  if (!raw) return fallback;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep raw */
  }
  value = value.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  if (/[\0\r\n]/.test(value)) return fallback;
  return value;
}

export function checkResumePath(
  locale: Locale,
  query: string,
  activity: string,
  basePath: CheckActionPath = "/check/",
): string {
  const params = new URLSearchParams({
    q: query,
    activity,
  });
  return `${localePath(locale, basePath)}?${params.toString()}`;
}

export function isCheckResumePath(path: string): boolean {
  const bare = path.split("?")[0] ?? path;
  return (
    bare === "/check/" ||
    bare === "/check" ||
    bare === "/ru/check/" ||
    bare === "/ru/check" ||
    bare === "/account/check/" ||
    bare === "/account/check" ||
    bare === "/ru/account/check/" ||
    bare === "/ru/account/check"
  );
}

export function parseCheckActionPath(
  raw: string | null | undefined,
): CheckActionPath {
  return raw === "/account/check/" ? "/account/check/" : "/check/";
}

/** Login URL that returns the user to an internal path after auth. */
export function loginWithNext(locale: Locale, nextPath: string): string {
  const next = safeInternalNext(nextPath, localePath(locale, "/account/"));
  return `${localePath(locale, "/login/")}?next=${encodeURIComponent(next)}`;
}
