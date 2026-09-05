import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "@/i18n/config";
import {
  getLegalDocByAlias,
  getLegalDocBySlug,
  type LegalDocMeta,
  type LegalLocale,
} from "@/data/legal/catalog";

function toLegalLocale(locale: Locale): LegalLocale {
  return locale === "ru" ? "ru" : "uz";
}

export function legalContentPath(locale: Locale, file: string): string {
  return join(process.cwd(), "content", "legal", toLegalLocale(locale), file);
}

export function loadLegalMarkdown(
  locale: Locale,
  meta: LegalDocMeta,
): string | null {
  const path = legalContentPath(locale, meta.file);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

export function resolveLegalDoc(
  slugOrAlias: string,
): LegalDocMeta | undefined {
  if (slugOrAlias.startsWith("/")) {
    return getLegalDocByAlias(slugOrAlias);
  }
  return getLegalDocBySlug(slugOrAlias);
}

/** First H1 in markdown, stripped of markdown markers. */
export function extractLegalTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (!match) return fallback;
  return match[1].replace(/\*\*/g, "").trim();
}

/** Plain-text description from first non-heading paragraph. */
export function extractLegalDescription(
  markdown: string,
  fallback: string,
): string {
  const lines = markdown.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(">") || t.startsWith("**") || t.startsWith("-") || t.startsWith("|")) {
      continue;
    }
    return t.slice(0, 160);
  }
  return fallback;
}
