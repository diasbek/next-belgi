export type LegalLocale = "ru" | "uz";

export type LegalGroup = "public" | "filing" | "internal";

export type LegalDocMeta = {
  /** Filename without locale folder, e.g. 01_public_offer.md */
  file: string;
  /** URL slug under /legal/[slug]/ */
  slug: string;
  group: LegalGroup;
  /** Short footer/nav label */
  footerLabel: { uz: string; ru: string };
  /** Whether to show in site footer */
  inFooter: boolean;
  /** Alias routes that also serve this doc (e.g. /terms/) */
  aliases?: string[];
};

/**
 * Full Belgi.ai legal package (22 docs × ru/uz).
 * Source: content/legal/{ru,uz}/*.md
 */
export const LEGAL_DOCS: LegalDocMeta[] = [
  {
    file: "01_public_offer.md",
    slug: "public-offer",
    group: "public",
    footerLabel: { uz: "Oferta", ru: "Оферта" },
    inFooter: true,
    aliases: ["/terms/", "/offer/"],
  },
  {
    file: "02_privacy_policy.md",
    slug: "privacy",
    group: "public",
    footerLabel: { uz: "Maxfiylik", ru: "Конфиденциальность" },
    inFooter: true,
    aliases: ["/privacy/"],
  },
  {
    file: "03_personal_data_consent.md",
    slug: "consent",
    group: "public",
    footerLabel: { uz: "Rozilik", ru: "Согласие" },
    inFooter: true,
    aliases: ["/consent/"],
  },
  {
    file: "04_cookie_policy.md",
    slug: "cookies",
    group: "public",
    footerLabel: { uz: "Cookie", ru: "Cookie" },
    inFooter: true,
    aliases: ["/cookies/"],
  },
  {
    file: "05_tariffs_and_credits.md",
    slug: "credits",
    group: "public",
    footerLabel: { uz: "Tariflar", ru: "Тарифы" },
    inFooter: true,
    aliases: ["/credits/"],
  },
  {
    file: "06_refund_policy.md",
    slug: "refunds",
    group: "public",
    footerLabel: { uz: "Qaytarish", ru: "Возвраты" },
    inFooter: true,
    aliases: ["/refunds/"],
  },
  {
    file: "07_ai_disclaimer.md",
    slug: "ai-disclaimer",
    group: "public",
    footerLabel: { uz: "AI diskleymer", ru: "AI-дисклеймер" },
    inFooter: true,
    aliases: ["/ai-disclaimer/"],
  },
  {
    file: "08_uploaded_materials_and_acceptable_use.md",
    slug: "uploads",
    group: "public",
    footerLabel: { uz: "Yuklamalar", ru: "Загрузки" },
    inFooter: false,
    aliases: ["/uploads/"],
  },
  {
    file: "09_application_services_agreement.md",
    slug: "application-services",
    group: "filing",
    footerLabel: {
      uz: "Ariza shartnomasi",
      ru: "Договор подачи",
    },
    inFooter: false,
  },
  {
    file: "10_application_assignment.md",
    slug: "application-assignment",
    group: "filing",
    footerLabel: { uz: "Topshiriq", ru: "Задание" },
    inFooter: false,
  },
  {
    file: "11_government_data_transfer_consent.md",
    slug: "government-transfer-consent",
    group: "filing",
    footerLabel: {
      uz: "Davlatga uzatish",
      ru: "Передача госоргану",
    },
    inFooter: false,
  },
  {
    file: "12_power_of_attorney_template.md",
    slug: "power-of-attorney",
    group: "filing",
    footerLabel: { uz: "Ishonchnoma", ru: "Доверенность" },
    inFooter: false,
  },
  {
    file: "13_state_fees_policy.md",
    slug: "state-fees",
    group: "filing",
    footerLabel: { uz: "Davlat bojlari", ru: "Госпошлины" },
    inFooter: false,
  },
  {
    file: "14_service_acceptance_act.md",
    slug: "service-acceptance-act",
    group: "filing",
    footerLabel: { uz: "Akt", ru: "Акт" },
    inFooter: false,
  },
  {
    file: "15_internal_personal_data_policy.md",
    slug: "internal-personal-data",
    group: "internal",
    footerLabel: {
      uz: "Ichki PD siyosati",
      ru: "Внутр. ПДн",
    },
    inFooter: false,
  },
  {
    file: "16_access_control_policy.md",
    slug: "access-control",
    group: "internal",
    footerLabel: { uz: "Kirish nazorati", ru: "Доступ" },
    inFooter: false,
  },
  {
    file: "17_retention_and_deletion_policy.md",
    slug: "retention",
    group: "internal",
    footerLabel: { uz: "Saqlash", ru: "Хранение" },
    inFooter: false,
  },
  {
    file: "18_consent_and_version_log_policy.md",
    slug: "consent-log",
    group: "internal",
    footerLabel: { uz: "Rozilik jurnali", ru: "Журнал согласий" },
    inFooter: false,
  },
  {
    file: "19_incident_response_plan.md",
    slug: "incident-response",
    group: "internal",
    footerLabel: { uz: "Insidentlar", ru: "Инциденты" },
    inFooter: false,
  },
  {
    file: "20_vendor_data_processing_agreement.md",
    slug: "vendor-dpa",
    group: "internal",
    footerLabel: { uz: "Provayder DPA", ru: "DPA подрядчика" },
    inFooter: false,
  },
  {
    file: "21_ai_quality_control_policy.md",
    slug: "ai-quality",
    group: "internal",
    footerLabel: { uz: "AI sifat", ru: "Контроль AI" },
    inFooter: false,
  },
  {
    file: "22_claims_handling_policy.md",
    slug: "claims",
    group: "internal",
    footerLabel: { uz: "Daʼvolar", ru: "Претензии" },
    inFooter: false,
  },
];

export function getLegalDocBySlug(slug: string): LegalDocMeta | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}

export function getLegalDocByAlias(path: string): LegalDocMeta | undefined {
  const normalized = path.endsWith("/") ? path : `${path}/`;
  return LEGAL_DOCS.find((d) => d.aliases?.includes(normalized));
}

export function footerLegalDocs(): LegalDocMeta[] {
  return LEGAL_DOCS.filter((d) => d.inFooter);
}
