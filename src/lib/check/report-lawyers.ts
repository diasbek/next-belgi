import type { Locale } from "@/i18n/config";
import { PATENT_ATTORNEYS } from "@/data/patent-attorneys";
import type { ReportLawyer } from "./types";

const ROLE: Record<Locale, string> = {
  uz: "Patent vakili",
  ru: "Патентный поверенный",
  en: "Patent attorney",
};

/**
 * Sample patent attorneys for a full trademark report (not for guest preview).
 */
export function pickReportLawyers(
  locale: Locale,
  count = 3,
  seed = "",
): ReportLawyer[] {
  if (!PATENT_ATTORNEYS.length || count <= 0) return [];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const start = PATENT_ATTORNEYS.length
    ? hash % PATENT_ATTORNEYS.length
    : 0;

  const role = ROLE[locale] ?? ROLE.uz;
  const out: ReportLawyer[] = [];
  for (let i = 0; i < count; i++) {
    const a = PATENT_ATTORNEYS[(start + i) % PATENT_ATTORNEYS.length];
    if (!a) break;
    out.push({
      id: a.id,
      name: a.name,
      role,
    });
  }
  return out;
}
