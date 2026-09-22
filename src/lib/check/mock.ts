import type { Locale } from "@/i18n/config";
import type { ActivityClassification } from "@/lib/classify";
import {
  classRisksFromClassification,
  niceClassesFromClassification,
} from "@/lib/classify";
import type { TrademarkMatch, TrademarkReport } from "./types";

const copy = {
  uz: {
    defaultActivity: "Bolalar tagliklari",
    markType: "soʻzli",
    registryUz: "Oʻzbekiston reestri",
    wipo: "WIPO",
    internet: "Internet",
    emptyText: "Mavjud maʼlumotlarga koʻra, oʻxshash belgi topilmadi",
    conclusionTitle: "Xulosa",
    conclusionLead:
      "Ekspertiza natijalari ushbu nomni roʻyxatga olish uchun ijobiy javob berishi kerak:",
    recommendationsTitle: "Tovar belgini roʻyxatga olish boʻyicha tavsiyalar",
    replaceHint: "Boshqa nomga almashtiring",
    lawyerRole: "Yurist",
    disclaimer:
      "Belgi.ai avtomatlashtirilgan qidiruv va belgining mavjud manbalardagi tovar belgilari va arizalar bilan oʻxshashligini axboriy baholashni bajaradi. Tekshiruv natijasi yuridik xulosa, roʻyxatga olish toʻgʻrisida qaror yoki huquqiy muhofaza kafolati emas. Yakuniy qarorni vakolatli davlat organi qabul qiladi.",
    niceFallback: ["[3] taglik", "[5] nam salfetka"],
  },
  ru: {
    defaultActivity: "Детские подгузники",
    markType: "словесный",
    registryUz: "Реестр УЗ",
    wipo: "WIPO",
    internet: "Internet",
    emptyText: "По имеющимся данным, подобных признаков нет",
    conclusionTitle: "Заключение",
    conclusionLead:
      "Результаты экспертизы должны дать положительный ответ на регистрацию этого имени:",
    recommendationsTitle: "Рекомендации по регистрации товарного знака",
    replaceHint: "Замените на другое название",
    lawyerRole: "Юрист",
    disclaimer:
      "Belgi.ai выполняет автоматизированный поиск и информационную оценку сходства обозначения с товарными знаками и заявками, содержащимися в доступных источниках. Результат проверки не является юридическим заключением, решением о регистрации или гарантией предоставления правовой охраны. Окончательное решение принимается уполномоченным государственным органом.",
    niceFallback: ["[3] подгузник", "[5] влажный салфетка"],
  },
  en: {
    defaultActivity: "Baby diapers",
    markType: "word",
    registryUz: "UZ registry",
    wipo: "WIPO",
    internet: "Internet",
    emptyText: "Based on available data, no similar marks were found",
    conclusionTitle: "Conclusion",
    conclusionLead:
      "Examination results should support registration of this name:",
    recommendationsTitle: "Trademark registration recommendations",
    replaceHint: "Consider a different name",
    lawyerRole: "Lawyer",
    disclaimer:
      "Belgi.ai performs automated search and an informational assessment of similarity between the designation and trademarks and applications in available sources. The check result is not a legal opinion, a registration decision, or a guarantee of legal protection. The final decision is made by the competent state authority.",
    niceFallback: ["[3] diapers", "[5] wet wipes"],
  },
} as const;

export function buildReportFromMatches(params: {
  query: string;
  activity: string;
  classification?: ActivityClassification;
  locale?: Locale;
  matches: TrademarkMatch[];
}): TrademarkReport {
  const locale = params.locale ?? "uz";
  const t = copy[locale] ?? copy.uz;
  const q = params.query.trim() || "Mark";
  const act =
    params.classification?.activityNormalized?.trim() ||
    params.activity.trim() ||
    t.defaultActivity;

  const niceClasses = params.classification
    ? niceClassesFromClassification(params.classification)
    : [...t.niceFallback];

  const classRisks = params.classification
    ? classRisksFromClassification(params.classification)
    : [];

  const topSim = params.matches[0]?.similarity ?? 0;
  const positive = topSim < 45;

  return {
    query: q,
    activity: act,
    markType: t.markType,
    niceClasses,
    sources: [
      {
        id: "uz",
        title: t.registryUz,
        empty: params.matches.length === 0,
        emptyText: t.emptyText,
        matches: params.matches,
      },
      {
        id: "wipo",
        title: t.wipo,
        empty: true,
        emptyText: t.emptyText,
        matches: [],
      },
      {
        id: "internet",
        title: t.internet,
        empty: true,
        emptyText: t.emptyText,
        matches: [],
      },
    ],
    conclusion: {
      title: t.conclusionTitle,
      lead: t.conclusionLead,
      positive,
    },
    classRisks:
      classRisks.length > 0
        ? classRisks.map((c) => ({
            ...c,
            percent: Math.min(
              95,
              Math.round(c.percent * (0.4 + topSim / 100)),
            ),
          }))
        : niceClasses.slice(0, 3).map((_, i) => ({
            classNumber: Number(String(niceClasses[i]).match(/\d+/)?.[0] || 1),
            percent: Math.round(topSim * (1 - i * 0.15)),
          })),
    recommendations: {
      title: t.recommendationsTitle,
      replaceHint: t.replaceHint,
      alternatives: [],
    },
    lawyers: [],
    disclaimer: t.disclaimer,
  };
}

/** @deprecated use buildReportFromMatches — kept for preview/demo */
export function buildMockReport(
  query: string,
  activity: string,
  classification?: ActivityClassification,
  locale: Locale = "uz",
): TrademarkReport {
  return buildReportFromMatches({
    query,
    activity,
    classification,
    locale,
    matches: [
      {
        id: "kiko",
        name: "KIKO",
        owner: 'OOO "SMART HYGIENE FACILITIES"',
        registeredFrom: "14.06.2024",
        registeredTo: "14.06.2034",
        similarity: 60,
      },
      {
        id: "icoco",
        name: "iCOCO",
        owner: 'OOO "BABY PRO INTERNATIONAL"',
        registeredFrom: "26.03.2026",
        similarity: 32,
      },
      {
        id: "koko",
        name: "KOKO",
        owner: 'OOO "PAXTAOBOD COSMETIK"',
        registeredFrom: "16.09.2025",
        similarity: 21,
      },
    ],
  });
}
