import type { Locale } from "@/i18n/config";
import type { ActivityClassification } from "@/lib/classify";
import { niceClassesFromClassification } from "@/lib/classify";
import type { TrademarkReport, TrademarkSourceBlock } from "./types";

/**
 * Guest / unpaid teaser payload. Must never include registry hits, owners,
 * similarity scores, class risks, conclusion polarity, or lawyer PII.
 * Visual blur on the client is cosmetic only — this is the real gate.
 */

const titles = {
  uz: {
    markType: "soʻzli",
    registryUz: "Oʻzbekiston reestri",
    wipo: "Madrid (WIPO) — UZ koʻrsatmalari",
    internet: "Internet",
    conclusionTitle: "Xulosa",
    conclusionLead: "Toʻliq AI-hisobot kabinetda ochiladi.",
    recommendationsTitle: "Tovar belgisini roʻyxatga olish boʻyicha tavsiyalar",
    replaceHint: "Boshqa nomga almashtiring",
    emptyText: "Toʻliq natijalar kirishdan keyin",
    disclaimer:
      "Belgi.ai hisobotlari axborot xarakteriga ega va yuridik xulosa emas.",
    niceFallback: ["[3]", "[5]"],
  },
  ru: {
    markType: "словесный",
    registryUz: "Реестр Узбекистана",
    wipo: "Madrid (WIPO) — указания UZ",
    internet: "Internet",
    conclusionTitle: "Заключение",
    conclusionLead: "Полный AI-отчёт откроется в кабинете.",
    recommendationsTitle: "Рекомендации по регистрации товарного знака",
    replaceHint: "Замените на другое название",
    emptyText: "Полные результаты после входа",
    disclaimer:
      "Отчёты Belgi.ai носят информационный характер и не являются юридическим заключением.",
    niceFallback: ["[3]", "[5]"],
  },
  en: {
    markType: "word",
    registryUz: "UZ registry",
    wipo: "Madrid (WIPO) — UZ designations",
    internet: "Internet",
    conclusionTitle: "Conclusion",
    conclusionLead: "The full AI report unlocks in your cabinet.",
    recommendationsTitle: "Trademark registration recommendations",
    replaceHint: "Consider a different name",
    emptyText: "Full results after sign-in",
    disclaimer:
      "Belgi.ai reports are informational and are not legal opinions.",
    niceFallback: ["[3]", "[5]"],
  },
} as const;

function emptyBlock(id: string, title: string, emptyText: string): TrademarkSourceBlock {
  return {
    id,
    title,
    empty: true,
    emptyText,
    matches: [],
    sourceOffice: title,
  };
}

/** Strip any accidental sensitive fields from a report before guest response. */
export function toPreviewReport(
  report: TrademarkReport,
  locale: Locale = "uz",
): TrademarkReport {
  const t = titles[locale] ?? titles.uz;
  return {
    query: report.query,
    activity: report.activity,
    markType: report.markType || t.markType,
    niceClasses: (report.niceClasses || []).map((c) => {
      const n = String(c).match(/\d+/)?.[0];
      return n ? `[${n}]` : c;
    }),
    sources: (report.sources || []).map((s) =>
      emptyBlock(s.id, s.title || s.id, t.emptyText),
    ),
    conclusion: {
      title: t.conclusionTitle,
      lead: t.conclusionLead,
      positive: false,
    },
    classRisks: [],
    recommendations: {
      title: t.recommendationsTitle,
      replaceHint: t.replaceHint,
      alternatives: [],
    },
    lawyers: [],
    disclaimer: t.disclaimer,
  };
}

/** Build a guest teaser without running mock/demo invent or live search. */
export function buildGuestPreviewReport(params: {
  query: string;
  activity: string;
  classification?: ActivityClassification;
  locale?: Locale;
}): TrademarkReport {
  const locale = params.locale ?? "uz";
  const t = titles[locale] ?? titles.uz;
  const niceClasses = params.classification
    ? niceClassesFromClassification(params.classification).map((c) => {
        const n = String(c).match(/\d+/)?.[0];
        return n ? `[${n}]` : c;
      })
    : [...t.niceFallback];

  const shell: TrademarkReport = {
    query: params.query.trim() || "Mark",
    activity:
      params.classification?.activityNormalized?.trim() ||
      params.activity.trim() ||
      "",
    markType: t.markType,
    niceClasses,
    sources: [
      emptyBlock("uz", t.registryUz, t.emptyText),
      emptyBlock("wipo", t.wipo, t.emptyText),
      emptyBlock("internet", t.internet, t.emptyText),
    ],
    conclusion: {
      title: t.conclusionTitle,
      lead: t.conclusionLead,
      positive: false,
    },
    classRisks: [],
    recommendations: {
      title: t.recommendationsTitle,
      replaceHint: t.replaceHint,
      alternatives: [],
    },
    lawyers: [],
    disclaimer: t.disclaimer,
  };

  return toPreviewReport(shell, locale);
}

/** True if payload has no match/owner/risk leakage suitable for guest preview. */
export function isPreviewSafeReport(report: TrademarkReport): boolean {
  if ((report.classRisks?.length ?? 0) > 0) return false;
  if ((report.lawyers?.length ?? 0) > 0) return false;
  if ((report.recommendations?.alternatives?.length ?? 0) > 0) return false;
  for (const source of report.sources || []) {
    if ((source.matches?.length ?? 0) > 0) return false;
  }
  return true;
}
