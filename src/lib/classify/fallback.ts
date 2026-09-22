import type { ActivityClassification, ClassifyLocale } from "./types";
import { formatNiceClassLine } from "./normalize";

type RuleClass = {
  classNumber: number;
  labelRu: string;
  labelUz: string;
  labelEn: string;
};

function pickLabel(c: RuleClass, locale: ClassifyLocale): string {
  if (locale === "ru") return c.labelRu;
  if (locale === "en") return c.labelEn;
  return c.labelUz;
}

/** Deterministic fallback when OpenAI is unavailable. */
export function buildFallbackClassification(
  activityRaw: string,
  locale: ClassifyLocale,
): ActivityClassification {
  const text = activityRaw.trim().toLowerCase();

  const rules: Array<{
    test: RegExp;
    classes: RuleClass[];
  }> = [
    {
      test: /подгуз|памперс|подгузник|салфетк|гигиен|diaper|nappy|namlik|salyetka|taglik/,
      classes: [
        {
          classNumber: 3,
          labelRu: "косметика и гигиена",
          labelUz: "kosmetika va gigiyena",
          labelEn: "cosmetics and hygiene",
        },
        {
          classNumber: 5,
          labelRu: "подгузники и гигиенические изделия",
          labelUz: "taglik va gigiyena buyumlari",
          labelEn: "diapers and hygiene products",
        },
      ],
    },
    {
      test: /кафе|ресторан|общепит|общественного питания|oshxona|restoran|kafe|ovqat|catering/,
      classes: [
        {
          classNumber: 43,
          labelRu: "услуги кафе и ресторанов",
          labelUz: "kafe va restoran xizmatlari",
          labelEn: "cafe and restaurant services",
        },
      ],
    },
    {
      test: /одежд|fashion|kiyim|textile|ткан|tikuv/,
      classes: [
        {
          classNumber: 25,
          labelRu: "одежда",
          labelUz: "kiyim-kechak",
          labelEn: "clothing",
        },
      ],
    },
    {
      test: /софт|software|it\b|приложен|mobile app|dastur|ilova/,
      classes: [
        {
          classNumber: 9,
          labelRu: "программное обеспечение",
          labelUz: "dasturiy ta'minot",
          labelEn: "software",
        },
        {
          classNumber: 42,
          labelRu: "разработка ПО",
          labelUz: "dasturiy ta'minot ishlab chiqish",
          labelEn: "software development",
        },
      ],
    },
    {
      test: /банк|finans|moliya|кредит|payment|to'?lov/,
      classes: [
        {
          classNumber: 36,
          labelRu: "финансовые услуги",
          labelUz: "moliyaviy xizmatlar",
          labelEn: "financial services",
        },
      ],
    },
  ];

  const matched = rules.find((r) => r.test.test(text));
  const picked: RuleClass[] =
    matched?.classes ??
    [
      {
        classNumber: 35,
        labelRu: "реклама и бизнес-услуги",
        labelUz: "reklama va biznes xizmatlari",
        labelEn: "advertising and business services",
      },
    ];

  const classes = picked.map((c) => ({
    classNumber: c.classNumber,
    label: pickLabel(c, locale),
    confidence: matched ? 0.55 : 0.35,
  }));

  return {
    locale,
    activityRaw: activityRaw.trim(),
    activityNormalized: activityRaw.trim(),
    classes,
    primaryClassNumbers: classes.slice(0, 3).map((c) => c.classNumber),
    source: "fallback",
  };
}

export function niceClassesFromClassification(
  classification: ActivityClassification,
): string[] {
  return classification.classes.map((c) =>
    formatNiceClassLine(c.classNumber, c.label),
  );
}

export function classRisksFromClassification(
  classification: ActivityClassification,
): Array<{ classNumber: number; percent: number }> {
  return classification.classes.slice(0, 3).map((c, index) => ({
    classNumber: c.classNumber,
    percent: Math.round(
      Math.min(85, Math.max(25, (c.confidence || 0.5) * 100 - index * 5)),
    ),
  }));
}
