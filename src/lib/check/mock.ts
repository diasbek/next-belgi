import type { Locale } from "@/i18n/config";
import type { ActivityClassification } from "@/lib/classify";
import { niceClassesFromClassification } from "@/lib/classify";
import {
  parseQueryClassNumbers,
  scoreConflictFromSources,
} from "./conflict-risk";
import { pickReportLawyers } from "./report-lawyers";
import type {
  TrademarkMatch,
  TrademarkReport,
  TrademarkSourceBlock,
} from "./types";

const copy = {
  uz: {
    defaultActivity: "Bolalar tagliklari",
    markType: "soʻzli",
    registryUz: "Oʻzbekiston reestri",
    wipo: "Madrid (WIPO) — UZ koʻrsatmalari",
    internet: "Internet",
    eu: "Yevropa Ittifoqi (EUIPO)",
    us: "AQSH (USPTO)",
    au: "Avstraliya (IP Australia)",
    kz: "Qozogʻiston (Kazpatent)",
    emptyText: "Mavjud maʼlumotlarga koʻra, oʻxshash belgi topilmadi",
    unavailableText: "Manba hozircha mavjud emas",
    asOfPrefix: "Maʼlumot sanasi",
    conclusionTitle: "Xulosa",
    conclusionLeadPositive:
      "Mavjud maʼlumotlarga koʻra, roʻyxatga olish ehtimoli nisbatan yuqori:",
    conclusionLeadCaution:
      "Oʻxshash belgilar topildi — ehtiyotkorlik bilan baholang; ehtimoliy baho:",
    conclusionLeadNegative:
      "Yuqori oʻxshashlik va/yoki sinflar kesishuvi — roʻyxatga olish ehtimoli past:",
    recommendationsTitle: "Tovar belgisini roʻyxatga olish boʻyicha tavsiyalar",
    replaceHint: "Boshqa nomga almashtiring",
    keepHint: "Nomni saqlab, sinflar va arizani aniqlashtiring",
    lawyerRole: "Yurist",
    disclaimer:
      "Belgi.ai avtomatlashtirilgan qidiruv va belgining mavjud manbalardagi tovar belgilari va arizalar bilan oʻxshashligini axborot baholashini bajaradi. Tekshiruv natijasi yuridik xulosa, roʻyxatga olish toʻgʻrisida qaror yoki huquqiy muhofaza kafolati emas. Yakuniy qarorni vakolatli davlat organi qabul qiladi.",
    niceFallback: ["[3] taglik", "[5] nam salfetka"],
  },
  ru: {
    defaultActivity: "Детские подгузники",
    markType: "словесный",
    registryUz: "Реестр УЗ",
    wipo: "Madrid (WIPO) — указания UZ",
    internet: "Internet",
    eu: "Европейский союз (EUIPO)",
    us: "США (USPTO)",
    au: "Австралия (IP Australia)",
    kz: "Казахстан (Kazpatent)",
    emptyText: "По имеющимся данным, подобных признаков нет",
    unavailableText: "Источник временно недоступен",
    asOfPrefix: "Данные на",
    conclusionTitle: "Заключение",
    conclusionLeadPositive:
      "По имеющимся данным, вероятность регистрации относительно высокая:",
    conclusionLeadCaution:
      "Найдены похожие обозначения — оценивайте осторожно; ориентировочная оценка:",
    conclusionLeadNegative:
      "Высокое сходство и/или пересечение классов — вероятность регистрации низкая:",
    recommendationsTitle: "Рекомендации по регистрации товарного знака",
    replaceHint: "Замените на другое название",
    keepHint: "Можно сохранить имя, уточнив классы и заявку",
    lawyerRole: "Юрист",
    disclaimer:
      "Belgi.ai выполняет автоматизированный поиск и информационную оценку сходства обозначения с товарными знаками и заявками, содержащимися в доступных источниках. Результат проверки не является юридическим заключением, решением о регистрации или гарантией предоставления правовой охраны. Окончательное решение принимается уполномоченным государственным органом.",
    niceFallback: ["[3] подгузник", "[5] влажный салфетка"],
  },
  en: {
    defaultActivity: "Baby diapers",
    markType: "word",
    registryUz: "UZ registry",
    wipo: "Madrid (WIPO) — UZ designations",
    internet: "Internet",
    eu: "European Union (EUIPO)",
    us: "United States (USPTO)",
    au: "Australia (IP Australia)",
    kz: "Kazakhstan (Kazpatent)",
    emptyText: "Based on available data, no similar marks were found",
    unavailableText: "Source temporarily unavailable",
    asOfPrefix: "Data as of",
    conclusionTitle: "Conclusion",
    conclusionLeadPositive:
      "Based on available data, the chance of registration looks relatively high:",
    conclusionLeadCaution:
      "Similar marks were found — review carefully; indicative outlook:",
    conclusionLeadNegative:
      "High similarity and/or class overlap — registration chance looks low:",
    recommendationsTitle: "Trademark registration recommendations",
    replaceHint: "Consider a different name",
    keepHint: "You may keep the name while refining classes and filing",
    lawyerRole: "Lawyer",
    disclaimer:
      "Belgi.ai performs automated search and an informational assessment of similarity between the designation and trademarks and applications in available sources. The check result is not a legal opinion, a registration decision, or a guarantee of legal protection. The final decision is made by the competent state authority.",
    niceFallback: ["[3] diapers", "[5] wet wipes"],
  },
} as const;

export type ExternalBlockInput = {
  id: string;
  matches: TrademarkMatch[];
  unavailable?: boolean;
  asOf?: string;
};

function blockTitle(
  id: string,
  t: (typeof copy)[Locale],
): string {
  switch (id) {
    case "uz":
      return t.registryUz;
    case "wipo":
      return t.wipo;
    case "eu":
      return t.eu;
    case "us":
      return t.us;
    case "au":
      return t.au;
    case "kz":
      return t.kz;
    case "internet":
      return t.internet;
    default:
      return id.toUpperCase();
  }
}

function makeBlock(
  id: string,
  t: (typeof copy)[Locale],
  matches: TrademarkMatch[],
  opts?: { unavailable?: boolean; asOf?: string },
): TrademarkSourceBlock {
  return {
    id,
    title: blockTitle(id, t),
    empty: !opts?.unavailable && matches.length === 0,
    emptyText: t.emptyText,
    matches,
    unavailable: opts?.unavailable,
    unavailableText: opts?.unavailable ? t.unavailableText : undefined,
    asOf: opts?.asOf,
    sourceOffice: blockTitle(id, t),
  };
}

export function buildReportFromMatches(params: {
  query: string;
  activity: string;
  classification?: ActivityClassification;
  locale?: Locale;
  /** Local SoT matches (Adliya + Madrid); split by sourceLabel / source */
  matches: TrademarkMatch[];
  /** Extra jurisdiction blocks from live adapters */
  externalBlocks?: ExternalBlockInput[];
  /** Include internet stub (default true) */
  includeInternet?: boolean;
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

  const uzMatches = params.matches.filter(
    (m) => !m.sourceLabel || m.sourceLabel === "UZ",
  );
  const wipoMatches = params.matches.filter(
    (m) => m.sourceLabel === "WIPO" || m.sourceLabel === "Madrid",
  );

  const sources: TrademarkSourceBlock[] = [
    makeBlock("uz", t, uzMatches),
    makeBlock("wipo", t, wipoMatches),
  ];

  for (const ext of params.externalBlocks || []) {
    sources.push(
      makeBlock(ext.id, t, ext.matches, {
        unavailable: ext.unavailable,
        asOf: ext.asOf,
      }),
    );
  }

  if (params.includeInternet !== false) {
    sources.push(makeBlock("internet", t, []));
  }

  const queryClassNumbers = parseQueryClassNumbers(niceClasses);
  const scored = scoreConflictFromSources(sources, queryClassNumbers);
  const classRisks =
    scored.classRisks.length > 0
      ? scored.classRisks.filter((c) => c.classNumber > 0)
      : queryClassNumbers.slice(0, 3).map((classNumber) => ({
          classNumber,
          percent: scored.overallConflict,
        }));

  const lead =
    scored.overallConflict >= 70
      ? t.conclusionLeadNegative
      : scored.overallConflict >= 45
        ? t.conclusionLeadCaution
        : t.conclusionLeadPositive;

  const replaceHint = scored.positive ? t.keepHint : t.replaceHint;

  return {
    query: q,
    activity: act,
    markType: t.markType,
    niceClasses,
    sources,
    conclusion: {
      title: t.conclusionTitle,
      lead,
      positive: scored.positive,
    },
    classRisks:
      classRisks.length > 0
        ? classRisks
        : [{ classNumber: 0, percent: scored.overallConflict }],
    recommendations: {
      title: t.recommendationsTitle,
      replaceHint,
      alternatives: [],
    },
    lawyers: pickReportLawyers(locale, 3, q),
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
        sourceLabel: "UZ",
      },
      {
        id: "icoco",
        name: "iCOCO",
        owner: 'OOO "BABY PRO INTERNATIONAL"',
        registeredFrom: "26.03.2026",
        similarity: 32,
        sourceLabel: "UZ",
      },
      {
        id: "koko",
        name: "KOKO",
        owner: 'OOO "PAXTAOBOD COSMETIK"',
        registeredFrom: "16.09.2025",
        similarity: 21,
        sourceLabel: "UZ",
      },
    ],
  });
}
