import type { TrademarkReport } from "./types";

export function buildMockReport(
  query: string,
  activity: string,
): TrademarkReport {
  const q = query.trim() || "Kiroko";
  const act = activity.trim() || "Детские подгузники";

  return {
    query: q,
    activity: act,
    markType: "словесный",
    niceClasses: ["[3] подгузник", "[5] влажный салфетка"],
    sources: [
      {
        id: "uz",
        title: "Реестр УЗ",
        matches: [
          {
            id: "kiko",
            name: "KIKO",
            owner: 'OOO "SMART HYGIENE FACILITIES"',
            registeredFrom: "14.06.2024",
            registeredTo: "14.06.2034",
            similarity: 60,
            classesText:
              "[5] подгузники детские; трусы-подгузники детские; прокладки гигиенические; трусы гигиенические женские.",
          },
          {
            id: "icoco",
            name: "iCOCO",
            owner: 'OOO "BABY PRO INTERNATIONAL"',
            registeredFrom: "26.03.2026",
            status: "В период ожидания",
            similarity: 32,
            classesText: "[3] все продукты\n[5] все продукты",
          },
          {
            id: "koko",
            name: "KOKO",
            owner: 'OOO "PAXTAOBOD COSMETIK"',
            registeredFrom: "16.09.2025",
            status: "В экспертизе",
            similarity: 21,
            classesText: "[3] все продукты",
          },
        ],
      },
      {
        id: "wipo",
        title: "WIPO",
        empty: true,
        emptyText: "По имеющимся данным, подобных признаков нет",
        matches: [],
      },
      {
        id: "internet",
        title: "Интернет",
        empty: true,
        emptyText: "По имеющимся данным, подобных признаков нет",
        matches: [],
      },
    ],
    conclusion: {
      title: "Заключение",
      lead: "Результаты экспертизы должны дать положительный ответ на регистрацию этого имени:",
      positive: true,
    },
    classRisks: [
      { classNumber: 3, percent: 60 },
      { classNumber: 5, percent: 55 },
    ],
    recommendations: {
      title: "Рекомендации по регистрации товарного знака",
      replaceHint: "Замените на другое название",
      alternatives: ["KAMI", "KAMO", "KUMI"],
    },
    lawyers: [
      {
        id: "dildora",
        name: "Нишанова Дилдора",
        role: "Юрист",
        rating: 5,
      },
      {
        id: "jasur",
        name: "Эркинов Жасур",
        role: "Юрист",
        rating: 5,
      },
      {
        id: "dilorom",
        name: "Нишанова Дилором",
        role: "Юрист",
        rating: 4,
      },
      {
        id: "jonibek",
        name: "Эркинов Жонибек",
        role: "Юрист",
        rating: 4,
      },
    ],
    disclaimer:
      "* Министерство юстиции может не согласиться с этим заключением эксперта, а также с заключением, содержащимся в настоящем отчете, принимая во внимание тот факт, что вышеупомянутые базы товарных знаков регулярно обновляются.",
  };
}
