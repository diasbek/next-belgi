import type { Locale } from "@/i18n/config";
import type { ActivityClassification } from "@/lib/classify";
import {
  classRisksFromClassification,
  niceClassesFromClassification,
} from "@/lib/classify";
import type { TrademarkReport } from "./types";

const copy = {
  uz: {
    defaultActivity: "Bolalar tagliklari",
    markType: "soʻzli",
    registryUz: "Oʻzbekiston reestri",
    wipo: "WIPO",
    internet: "Internet",
    emptyText: "Mavjud maʼlumotlarga koʻra, oʻxshash belgi topilmadi",
    statusPending: "Kutish muddatida",
    statusExam: "Ekspertizada",
    conclusionTitle: "Xulosa",
    conclusionLead:
      "Ekspertiza natijalari ushbu nomni roʻyxatga olish uchun ijobiy javob berishi kerak:",
    recommendationsTitle: "Tovar belgini roʻyxatga olish boʻyicha tavsiyalar",
    replaceHint: "Boshqa nomga almashtiring",
    lawyerRole: "Yurist",
    disclaimer:
      "Belgi.ai avtomatlashtirilgan qidiruv va belgining mavjud manbalardagi tovar belgilari va arizalar bilan oʻxshashligini axboriy baholashni bajaradi. Tekshiruv natijasi yuridik xulosa, roʻyxatga olish toʻgʻrisida qaror yoki huquqiy muhofaza kafolati emas. Yakuniy qarorni vakolatli davlat organi qabul qiladi.",
    niceFallback: ["[3] taglik", "[5] nam salfetka"],
    kikoClasses:
      "[5] bolalar tagliklari; bolalar taglik-shimlari; gigiyenik prokladkalar.",
    allProducts: "[3] barcha mahsulotlar\n[5] barcha mahsulotlar",
    allProductsOne: "[3] barcha mahsulotlar",
  },
  ru: {
    defaultActivity: "Детские подгузники",
    markType: "словесный",
    registryUz: "Реестр УЗ",
    wipo: "WIPO",
    internet: "Интернет",
    emptyText: "По имеющимся данным, подобных признаков нет",
    statusPending: "В период ожидания",
    statusExam: "В экспертизе",
    conclusionTitle: "Заключение",
    conclusionLead:
      "Результаты экспертизы должны дать положительный ответ на регистрацию этого имени:",
    recommendationsTitle: "Рекомендации по регистрации товарного знака",
    replaceHint: "Замените на другое название",
    lawyerRole: "Юрист",
    disclaimer:
      "Belgi.ai выполняет автоматизированный поиск и информационную оценку сходства обозначения с товарными знаками и заявками, содержащимися в доступных источниках. Результат проверки не является юридическим заключением, решением о регистрации или гарантией предоставления правовой охраны. Окончательное решение принимается уполномоченным государственным органом.",
    niceFallback: ["[3] подгузник", "[5] влажный салфетка"],
    kikoClasses:
      "[5] подгузники детские; трусы-подгузники детские; прокладки гигиенические; трусы гигиенические женские.",
    allProducts: "[3] все продукты\n[5] все продукты",
    allProductsOne: "[3] все продукты",
  },
  en: {
    defaultActivity: "Baby diapers",
    markType: "word",
    registryUz: "UZ registry",
    wipo: "WIPO",
    internet: "Internet",
    emptyText: "Based on available data, no similar marks were found",
    statusPending: "Pending period",
    statusExam: "Under examination",
    conclusionTitle: "Conclusion",
    conclusionLead:
      "Examination results should support registration of this name:",
    recommendationsTitle: "Trademark registration recommendations",
    replaceHint: "Consider a different name",
    lawyerRole: "Lawyer",
    disclaimer:
      "Belgi.ai performs automated search and an informational assessment of similarity between the designation and trademarks and applications in available sources. The check result is not a legal opinion, a registration decision, or a guarantee of legal protection. The final decision is made by the competent state authority.",
    niceFallback: ["[3] diapers", "[5] wet wipes"],
    kikoClasses:
      "[5] baby diapers; baby pant diapers; sanitary pads; women's sanitary pants.",
    allProducts: "[3] all products\n[5] all products",
    allProductsOne: "[3] all products",
  },
} as const;

export function buildMockReport(
  query: string,
  activity: string,
  classification?: ActivityClassification,
  locale: Locale = "uz",
): TrademarkReport {
  const t = copy[locale] ?? copy.uz;
  const q = query.trim() || "Kiroko";
  const act =
    classification?.activityNormalized?.trim() ||
    activity.trim() ||
    t.defaultActivity;

  const niceClasses = classification
    ? niceClassesFromClassification(classification)
    : [...t.niceFallback];

  const classRisks = classification
    ? classRisksFromClassification(classification)
    : [
        { classNumber: 3, percent: 60 },
        { classNumber: 5, percent: 55 },
      ];

  return {
    query: q,
    activity: act,
    markType: t.markType,
    niceClasses,
    sources: [
      {
        id: "uz",
        title: t.registryUz,
        matches: [
          {
            id: "kiko",
            name: "KIKO",
            owner: 'OOO "SMART HYGIENE FACILITIES"',
            registeredFrom: "14.06.2024",
            registeredTo: "14.06.2034",
            similarity: 60,
            classesText: t.kikoClasses,
          },
          {
            id: "icoco",
            name: "iCOCO",
            owner: 'OOO "BABY PRO INTERNATIONAL"',
            registeredFrom: "26.03.2026",
            status: t.statusPending,
            similarity: 32,
            classesText: t.allProducts,
          },
          {
            id: "koko",
            name: "KOKO",
            owner: 'OOO "PAXTAOBOD COSMETIK"',
            registeredFrom: "16.09.2025",
            status: t.statusExam,
            similarity: 21,
            classesText: t.allProductsOne,
          },
        ],
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
      positive: true,
    },
    classRisks,
    recommendations: {
      title: t.recommendationsTitle,
      replaceHint: t.replaceHint,
      alternatives: ["KAMI", "KAMO", "KUMI"],
    },
    lawyers: [
      {
        id: "dildora",
        name: "Nishanova Dildora",
        role: t.lawyerRole,
        rating: 5,
      },
      {
        id: "jasur",
        name: "Erkinov Jasur",
        role: t.lawyerRole,
        rating: 5,
      },
      {
        id: "dilorom",
        name: "Nishanova Dilorom",
        role: t.lawyerRole,
        rating: 4,
      },
      {
        id: "jonibek",
        name: "Erkinov Jonibek",
        role: t.lawyerRole,
        rating: 4,
      },
    ],
    disclaimer: t.disclaimer,
  };
}
