import type { Locale } from "@/i18n/config";
import type { ActivityClassification } from "@/lib/classify";
import { niceClassesFromClassification } from "@/lib/classify";
import type { TrademarkReport } from "./types";
import { previewReportTitles, toPreviewReport } from "./preview-report";

/** Build a guest teaser without running mock/demo invent or live search. Server-only. */
export function buildGuestPreviewReport(params: {
  query: string;
  activity: string;
  classification?: ActivityClassification;
  locale?: Locale;
}): TrademarkReport {
  const locale = params.locale ?? "uz";
  const t = previewReportTitles(locale);
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
      {
        id: "uz",
        title: t.registryUz,
        empty: true,
        emptyText: t.emptyText,
        matches: [],
        sourceOffice: t.registryUz,
      },
      {
        id: "wipo",
        title: t.wipo,
        empty: true,
        emptyText: t.emptyText,
        matches: [],
        sourceOffice: t.wipo,
      },
      {
        id: "internet",
        title: t.internet,
        empty: true,
        emptyText: t.emptyText,
        matches: [],
        sourceOffice: t.internet,
      },
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
