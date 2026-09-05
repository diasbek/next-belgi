export type LegalLocale = "ru" | "uz";

/** Semantic groups for the legal hub and footer. */
export type LegalGroup =
  | "service"
  | "data"
  | "payments"
  | "filing"
  | "internal";

export type LegalDocMeta = {
  /** Filename without locale folder, e.g. 01_public_offer.md */
  file: string;
  /** URL slug under /legal/[slug]/ */
  slug: string;
  group: LegalGroup;
  /** Short footer/nav label */
  footerLabel: { uz: string; ru: string };
  /** Alias routes that also serve this doc (e.g. /terms/) */
  aliases?: string[];
};

export type LegalGroupMeta = {
  id: LegalGroup;
  /** Shown on /legal/ and as footer section title */
  title: { uz: string; ru: string };
  lead: { uz: string; ru: string };
  /** Compact footer link label (group hub) */
  footerLabel: { uz: string; ru: string };
  /** Public site surfaces this group */
  public: boolean;
};

export const LEGAL_GROUPS: LegalGroupMeta[] = [
  {
    id: "service",
    title: {
      uz: "Xizmat va shartlar",
      ru: "Сервис и условия",
    },
    lead: {
      uz: "Oferta, AI-tekshiruv holati va yuklamalar qoidalari.",
      ru: "Оферта, статус AI-проверки и правила загрузок.",
    },
    footerLabel: { uz: "Shartlar", ru: "Условия" },
    public: true,
  },
  {
    id: "data",
    title: {
      uz: "Shaxsiy maʼlumotlar",
      ru: "Персональные данные",
    },
    lead: {
      uz: "Maxfiylik, rozilik va cookie siyosati.",
      ru: "Конфиденциальность, согласие и cookie.",
    },
    footerLabel: { uz: "Maxfiylik", ru: "Конфиденциальность" },
    public: true,
  },
  {
    id: "payments",
    title: {
      uz: "Toʻlov va kreditlar",
      ru: "Оплата и кредиты",
    },
    lead: {
      uz: "Tariflar, kreditlar yechib olish va qaytarish.",
      ru: "Тарифы, списание кредитов и возвраты.",
    },
    footerLabel: { uz: "Toʻlov", ru: "Оплата" },
    public: true,
  },
  {
    id: "filing",
    title: {
      uz: "Ariza topshirish",
      ru: "Подача заявки",
    },
    lead: {
      uz: "AI-tekshiruvdan alohida: shartnoma, topshiriq, ishonchnoma va bojlar.",
      ru: "Отдельно от AI-проверки: договор, задание, доверенность и пошлины.",
    },
    footerLabel: { uz: "Ariza", ru: "Подача" },
    public: true,
  },
  {
    id: "internal",
    title: {
      uz: "Ichki reglamentlar",
      ru: "Внутренние регламенты",
    },
    lead: {
      uz: "Jamoa va pudratchilar uchun: PD, kirish, saqlash, insidentlar.",
      ru: "Для команды и подрядчиков: ПДн, доступ, хранение, инциденты.",
    },
    footerLabel: { uz: "Ichki", ru: "Внутренние" },
    public: false,
  },
];

/**
 * Full Belgi.ai legal package (22 docs × ru/uz).
 * Source: content/legal/{ru,uz}/*.md
 */
export const LEGAL_DOCS: LegalDocMeta[] = [
  {
    file: "01_public_offer.md",
    slug: "public-offer",
    group: "service",
    footerLabel: { uz: "Oferta", ru: "Оферта" },
    aliases: ["/terms/", "/offer/"],
  },
  {
    file: "07_ai_disclaimer.md",
    slug: "ai-disclaimer",
    group: "service",
    footerLabel: { uz: "AI diskleymer", ru: "AI-дисклеймер" },
    aliases: ["/ai-disclaimer/"],
  },
  {
    file: "08_uploaded_materials_and_acceptable_use.md",
    slug: "uploads",
    group: "service",
    footerLabel: { uz: "Yuklamalar", ru: "Загрузки" },
    aliases: ["/uploads/"],
  },
  {
    file: "02_privacy_policy.md",
    slug: "privacy",
    group: "data",
    footerLabel: { uz: "Maxfiylik siyosati", ru: "Политика конфиденциальности" },
    aliases: ["/privacy/"],
  },
  {
    file: "03_personal_data_consent.md",
    slug: "consent",
    group: "data",
    footerLabel: { uz: "Rozilik", ru: "Согласие на ПДн" },
    aliases: ["/consent/"],
  },
  {
    file: "04_cookie_policy.md",
    slug: "cookies",
    group: "data",
    footerLabel: { uz: "Cookie", ru: "Cookie" },
    aliases: ["/cookies/"],
  },
  {
    file: "05_tariffs_and_credits.md",
    slug: "credits",
    group: "payments",
    footerLabel: { uz: "Tarif va kreditlar", ru: "Тарифы и кредиты" },
    aliases: ["/credits/"],
  },
  {
    file: "06_refund_policy.md",
    slug: "refunds",
    group: "payments",
    footerLabel: { uz: "Qaytarish", ru: "Возвраты" },
    aliases: ["/refunds/"],
  },
  {
    file: "09_application_services_agreement.md",
    slug: "application-services",
    group: "filing",
    footerLabel: { uz: "Ariza shartnomasi", ru: "Договор подачи" },
  },
  {
    file: "10_application_assignment.md",
    slug: "application-assignment",
    group: "filing",
    footerLabel: { uz: "Topshiriq", ru: "Задание на подачу" },
  },
  {
    file: "11_government_data_transfer_consent.md",
    slug: "government-transfer-consent",
    group: "filing",
    footerLabel: {
      uz: "Davlatga uzatish",
      ru: "Передача госоргану",
    },
  },
  {
    file: "12_power_of_attorney_template.md",
    slug: "power-of-attorney",
    group: "filing",
    footerLabel: { uz: "Ishonchnoma", ru: "Доверенность" },
  },
  {
    file: "13_state_fees_policy.md",
    slug: "state-fees",
    group: "filing",
    footerLabel: { uz: "Davlat bojlari", ru: "Госпошлины" },
  },
  {
    file: "14_service_acceptance_act.md",
    slug: "service-acceptance-act",
    group: "filing",
    footerLabel: { uz: "Akt", ru: "Акт услуг" },
  },
  {
    file: "15_internal_personal_data_policy.md",
    slug: "internal-personal-data",
    group: "internal",
    footerLabel: { uz: "Ichki PD siyosati", ru: "Внутр. политика ПДн" },
  },
  {
    file: "16_access_control_policy.md",
    slug: "access-control",
    group: "internal",
    footerLabel: { uz: "Kirish nazorati", ru: "Разграничение доступа" },
  },
  {
    file: "17_retention_and_deletion_policy.md",
    slug: "retention",
    group: "internal",
    footerLabel: { uz: "Saqlash va oʻchirish", ru: "Хранение и удаление" },
  },
  {
    file: "18_consent_and_version_log_policy.md",
    slug: "consent-log",
    group: "internal",
    footerLabel: { uz: "Rozilik jurnali", ru: "Журнал согласий" },
  },
  {
    file: "19_incident_response_plan.md",
    slug: "incident-response",
    group: "internal",
    footerLabel: { uz: "Insidentlar", ru: "Реагирование на инциденты" },
  },
  {
    file: "20_vendor_data_processing_agreement.md",
    slug: "vendor-dpa",
    group: "internal",
    footerLabel: { uz: "Provayder DPA", ru: "DPA с подрядчиком" },
  },
  {
    file: "21_ai_quality_control_policy.md",
    slug: "ai-quality",
    group: "internal",
    footerLabel: { uz: "AI sifat nazorati", ru: "Контроль качества AI" },
  },
  {
    file: "22_claims_handling_policy.md",
    slug: "claims",
    group: "internal",
    footerLabel: { uz: "Daʼvolar tartibi", ru: "Порядок претензий" },
  },
];

export function getLegalGroup(id: LegalGroup): LegalGroupMeta {
  return LEGAL_GROUPS.find((g) => g.id === id)!;
}

export function docsInGroup(group: LegalGroup): LegalDocMeta[] {
  return LEGAL_DOCS.filter((d) => d.group === group);
}

export function getLegalDocBySlug(slug: string): LegalDocMeta | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}

export function getLegalDocByAlias(path: string): LegalDocMeta | undefined {
  const normalized = path.endsWith("/") ? path : `${path}/`;
  return LEGAL_DOCS.find((d) => d.aliases?.includes(normalized));
}

/** Compact footer: one entry per public group → first/primary doc or hub anchor. */
export function footerLegalGroups(): Array<{
  group: LegalGroupMeta;
  href: string;
}> {
  return LEGAL_GROUPS.filter((g) => g.public).map((group) => {
    const primary =
      group.id === "service"
        ? getLegalDocBySlug("public-offer")
        : group.id === "data"
          ? getLegalDocBySlug("privacy")
          : group.id === "payments"
            ? getLegalDocBySlug("credits")
            : docsInGroup(group.id)[0];
    return {
      group,
      href: primary
        ? `/legal/${primary.slug}/`
        : `/legal/#${group.id}`,
    };
  });
}

export function relatedDocs(meta: LegalDocMeta): LegalDocMeta[] {
  return docsInGroup(meta.group).filter((d) => d.slug !== meta.slug);
}
