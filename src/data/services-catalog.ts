import type { Locale } from "@/i18n/config";

export const SERVICE_SLUGS = [
  "nice-classes-fees",
  "trademark-check",
  "filing-package",
  "attorney-match",
  "ip-protection",
  "attorney-access",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export type ServiceKind = "tool" | "order" | "b2b";

export type ServiceCta = {
  label: string;
  href: string;
};

export type ServiceDetailCopy = {
  title: string;
  short: string;
  hero: string;
  forWhom: string;
  result: string;
  steps: { title: string; text: string }[];
  deliverables: string[];
  notIncluded: string[];
  pricingHint: string;
  disclaimer?: string;
  primaryCta: ServiceCta;
  secondaryCta: ServiceCta;
  faq: { q: string; a: string }[];
  relatedSlugs: ServiceSlug[];
};

export type ServiceCatalogItem = {
  slug: ServiceSlug;
  kind: ServiceKind;
  number: number;
};

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  { slug: "nice-classes-fees", kind: "tool", number: 1 },
  { slug: "trademark-check", kind: "tool", number: 2 },
  { slug: "filing-package", kind: "order", number: 3 },
  { slug: "attorney-match", kind: "order", number: 4 },
  { slug: "ip-protection", kind: "order", number: 5 },
  { slug: "attorney-access", kind: "b2b", number: 6 },
];

export function isServiceSlug(value: string): value is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(value);
}

export function getServiceBySlug(slug: string): ServiceCatalogItem | undefined {
  return SERVICE_CATALOG.find((s) => s.slug === slug);
}

type HubCopy = {
  title: string;
  lead: string;
  journeyTitle: string;
  journeyLead: string;
  journeySteps: string[];
  checkCta: string;
  moreLabel: string;
};

type LocaleBundle = {
  hub: HubCopy;
  details: Record<ServiceSlug, ServiceDetailCopy>;
  orderForm: {
    name: string;
    email: string;
    phone: string;
    company: string;
    mark: string;
    classes: string;
    country: string;
    message: string;
    submit: string;
    success: string;
    error: string;
    ipTypeLabel: string;
    ipTypes: { value: string; label: string }[];
    orgName: string;
    registries: string;
    volume: string;
  };
  fees: {
    title: string;
    lead: string;
    classesLabel: string;
    classesOf: string;
    jurisdictionsLabel: string;
    estimateTitle: string;
    totalLabel: string;
    asOf: string;
    disclaimer: string;
    empty: string;
  };
  upsell: {
    title: string;
    classes: string;
    filing: string;
    attorney: string;
  };
};

const uz: LocaleBundle = {
  hub: {
    title: "Xizmatlar",
    lead: "Belgidan arizagacha — sinflar, tekshiruv, paket, patent vakili va B2B kirish.",
    journeyTitle: "Qanday bogʻlangan",
    journeyLead: "Oddiy ketma-ketlik: avval sinflar va smeta, soʻng tekshiruv, keyin paket va vakil.",
    journeySteps: [
      "MKTU sinflari va bojxona/davlat yigʻimlari smetasi",
      "Roʻyxatga olish imkoniyatini AI-tekshiruv",
      "Ariza paketi va patent vakilini bogʻlash",
    ],
    checkCta: "Avval belgini tekshirish",
    moreLabel: "Batafsil",
  },
  details: {
    "nice-classes-fees": {
      title: "MKTU sinflari va yigʻimlar kalkulyatori",
      short: "Faoliyat boʻyicha sinflarni tanlang va davlatlar kesimida yigʻimlarni hisoblang.",
      hero: "Tovar yoki xizmatni kiriting — tizim MKTU sinflarini taklif qiladi va tanlangan mamlakatlar uchun orientir smeta chiqaradi.",
      forWhom: "Brend egalari, agentliklar va arizani rejalashtirayotgan yuristlar.",
      result: "Sinflar roʻyxati + mamlakatlar boʻyicha yigʻimlar smetasi (orientir).",
      steps: [
        { title: "Faoliyatni tasvirlang", text: "Tovar/xizmat matnini yozing yoki katalogdan tanlang." },
        { title: "Sinflarni tasdiqlang", text: "Tavsiya etilgan MKTU sinflarini koʻrib chiqing." },
        { title: "Davlatlarni tanlang", text: "UZ, Madrid, EU, US, AU, KZ — keraklilarini yoqing." },
        { title: "Smetani oling", text: "Asosiy va qoʻshimcha yigʻimlar boʻyicha orientir summa." },
      ],
      deliverables: ["MKTU sinflari", "Davlatlar kesimida smeta", "Smetani saqlash / PDF (keyinroq)"],
      notIncluded: ["Rasmiy boj toʻlovi", "Arizani davlat organiga topshirish"],
      pricingHint: "Asosiy vosita — bepul orientir; chuqur konsultatsiya alohida.",
      disclaimer:
        "Summalar axborot xarakteriga ega. Rasmiy yigʻimlar oʻzgarishi mumkin — yakuniy summani vakolatli organ belgilaydi.",
      primaryCta: { label: "Kalkulyatorni ochish", href: "#tool" },
      secondaryCta: { label: "Konsultatsiya soʻrash", href: "/contacts/" },
      faq: [
        {
          q: "Bu rasmiy bojmi?",
          a: "Yoʻq — orientir smeta. Rasmiy tariflar vaqt oʻtishi bilan yangilanadi.",
        },
        {
          q: "Sinflarni keyin oʻzgartirish mumkinmi?",
          a: "Ha, ariza topshirishdan oldin sinflarni qayta koʻrib chiqish mumkin.",
        },
      ],
      relatedSlugs: ["trademark-check", "filing-package"],
    },
    "trademark-check": {
      title: "Roʻyxatga olish imkoniyatini tekshirish",
      short: "Oʻxshash belgilarni toping va xavf bahosini oling — arizadan oldin.",
      hero: "AI milliy va tanlangan xorijiy reestrlar boʻyicha oʻxshashlikni baholaydi. Natija — axborot hisobot, yuridik xulosa emas.",
      forWhom: "Yangi brend ishga tushirayotganlar va ariza oldidan riskni bilmoqchi boʻlganlar.",
      result: "AI-hisobot: oʻxshash belgilar, Risk Score, tavsiyalar.",
      steps: [
        { title: "Nom va faoliyat", text: "Brend nomi va tovar/xizmatlarni kiriting." },
        { title: "Reestrlarni tanlang", text: "UZ asosiy; EU/US/AU va boshqalar — qoʻshimcha." },
        { title: "Hisobotni oling", text: "Bir necha daqiqada tushunarli xulosa." },
      ],
      deliverables: ["Hisobot PDF", "Manbalar boʻyicha bloklar", "Kreditlar kabinetda"],
      notIncluded: ["Yuridik kafolat", "Davlat ekspertizasi qarori"],
      pricingHint: "1 tekshiruv = 1 kredit (+ xorijiy reestrlar uchun qoʻshimcha).",
      disclaimer:
        "Hisobot axborot xarakteriga ega. Yakuniy qarorni vakolatli organ qabul qiladi.",
      primaryCta: { label: "Tekshiruvni boshlash", href: "/check/" },
      secondaryCta: { label: "Kreditlar", href: "/account/billing/" },
      faq: [
        {
          q: "Bu roʻyxatga olish kafolatimi?",
          a: "Yoʻq. Bu dastlabki AI bahosi; Adliya ekspertizasi farq qilishi mumkin.",
        },
      ],
      relatedSlugs: ["nice-classes-fees", "filing-package", "attorney-match"],
    },
    "filing-package": {
      title: "Ariza topshirish paketi",
      short: "Hujjatlar va maʼlumotlarni yigʻib, arizaga tayyor paket tayyorlaymiz.",
      hero: "Tekshiruv va sinflardan keyin — ariza uchun toʻliq paket: maʼlumotlar, fayllar, cheklist.",
      forWhom: "Belgini rasman topshirmoqchi boʻlgan shaxslar va kompaniyalar.",
      result: "Tayyorlangan paket + holat kuzatuvi kabinetda.",
      steps: [
        { title: "Zayavka", text: "Belgi, sinflar, ariza beruvchi, mamlakat." },
        { title: "Fayllar", text: "Logo, ishonchnoma va boshqa hujjatlar." },
        { title: "Tayyorlash", text: "Mutaxassis paketni yigʻadi (avtopodacha emas)." },
        { title: "Topshirishga tayyor", text: "Siz yoki patent vakili arizani rasman topshiradi." },
      ],
      deliverables: ["Hujjatlar cheklisti", "Paket holati", "Vakil bogʻlash imkoniyati"],
      notIncluded: ["Davlat organiga avtomatik topshirish", "Davlat boji toʻlovi"],
      pricingHint: "Narx paket hajmiga qarab — zayavkada aniqlanadi.",
      primaryCta: { label: "Paketga zayavka", href: "#order" },
      secondaryCta: { label: "Avval tekshirish", href: "/check/" },
      faq: [
        {
          q: "Siz Adliyaga oʻzingiz topshirasizmi?",
          a: "v1 da paketni tayyorlaymiz; rasmiy topshirish — siz yoki patent vakili orqali.",
        },
      ],
      relatedSlugs: ["trademark-check", "attorney-match", "nice-classes-fees"],
    },
    "attorney-match": {
      title: "Patent vakilini tanlash va bogʻlash",
      short: "Rasmiy reyestrdan vakilni tanlang va buyurtmaga biriktiring.",
      hero: "Adliya reyestridagi patent vakillari katalogidan mos mutaxassisni tanlang.",
      forWhom: "Ariza yoki IС himoyasi uchun vakil kerak boʻlganlar.",
      result: "Tanlangan vakil buyurtmaga bogʻlanadi; bildirishnoma yuboriladi.",
      steps: [
        { title: "Qidiruv", text: "Ism, hudud yoki xizmat boʻyicha filtr." },
        { title: "Tanlash", text: "Kartochkani oching va bogʻlashni bosing." },
        { title: "Buyurtma", text: "Vakil mavjud buyurtmaga biriktiriladi." },
      ],
      deliverables: ["Katalog", "Buyurtmaga bogʻlash", "Aloqa maʼlumotlari"],
      notIncluded: ["Vakil xizmati narxi (toʻgʻridan-toʻgʻri kelishuv)"],
      pricingHint: "Katalogdan tanlash — bepul; vakil shartnomasi alohida.",
      primaryCta: { label: "Katalogga oʻtish", href: "#attorneys" },
      secondaryCta: { label: "Zayavka qoldirish", href: "#order" },
      faq: [
        {
          q: "Manba qayerdan?",
          a: "Rasmiy roʻyxat: im.adliya.uz/patent-attorney.",
        },
      ],
      relatedSlugs: ["filing-package", "ip-protection"],
    },
    "ip-protection": {
      title: "IS obyektini himoya qilish",
      short: "Eʼtiroz, chaqirib olish, pretensiya yoki monitoring boʻyicha ariza.",
      hero: "Huquqlaringizni himoya qilish uchun zayavka qoldiring — mutaxassis ish turini aniqlaydi.",
      forWhom: "Huquq egasi yoki vakili — nizoli yoki profilaktik holatlarda.",
      result: "Ish turi boʻyicha buyurtma + hujjatlar yigʻimi.",
      steps: [
        { title: "Turini tanlang", text: "Eʼtiroz, chaqirish, pretensiya, monitoring." },
        { title: "Dalillar", text: "Belgilar, sanalar, fayllar." },
        { title: "Ishlov", text: "Mutaxassis / vakil paketni tayyorlaydi." },
      ],
      deliverables: ["Buyurtma holati", "Dalillar saqlovi", "Vakil bogʻlash"],
      notIncluded: ["Sudda avtomatik vakillik", "Kafolatlangan natija"],
      pricingHint: "Ish turiga qarab — zayavkada baholanadi.",
      disclaimer: "Bu yuridik xulosa emas; strategiya vakil bilan kelishiladi.",
      primaryCta: { label: "Himoya zayavkasi", href: "#order" },
      secondaryCta: { label: "Bogʻlanish", href: "/contacts/" },
      faq: [
        {
          q: "Tekshiruv hisoboti kerakmi?",
          a: "Ixtiyoriy, lekin oʻxshashlik hisoboti ishni tezlashtiradi.",
        },
      ],
      relatedSlugs: ["trademark-check", "attorney-match"],
    },
    "attorney-access": {
      title: "Baza kirishi (vakillar va agentliklar)",
      short: "Patent vakillari va agentliklar uchun reestrlarga API / kabinet kirishi.",
      hero: "B2B: tashkilotingiz uchun qidiruv va reestrlarga cheklangan kirish — waitlist orqali.",
      forWhom: "Patent vakillari, IP agentliklari, korporativ yuridik jamoalar.",
      result: "Waitlist zayavkasi; keyin org-akkaunt va API (bosqichma-bosqich).",
      steps: [
        { title: "Zayavka", text: "Tashkilot, rollar, kerakli reestrlar, hajm." },
        { title: "Koʻrib chiqish", text: "Biz shartnoma va limitlarni kelishamiz." },
        { title: "Kirish", text: "Org aʼzolari va API kalitlari." },
      ],
      deliverables: ["Waitlist", "Keyinroq: org, API, audit"],
      notIncluded: ["Darhol cheksiz scraping", "Consumer kabinet bilan aralash UI"],
      pricingHint: "Obuna / seat — kelishuv asosida.",
      primaryCta: { label: "B2B zayavka", href: "#order" },
      secondaryCta: { label: "Bogʻlanish", href: "/contacts/" },
      faq: [
        {
          q: "Qachon API ochiladi?",
          a: "Waitlist dan keyin — shartnoma va rate limit bilan.",
        },
      ],
      relatedSlugs: ["attorney-match", "trademark-check"],
    },
  },
  orderForm: {
    name: "Ism",
    email: "Email",
    phone: "Telefon",
    company: "Kompaniya",
    mark: "Tovar belgisi / obyekt",
    classes: "MKTU sinflari (ixtiyoriy)",
    country: "Asosiy mamlakat",
    message: "Izoh",
    submit: "Yuborish",
    success: "Zayavka qabul qilindi. Tez orada bogʻlanamiz.",
    error: "Yuborib boʻlmadi. Qayta urinib koʻring.",
    ipTypeLabel: "Ish turi",
    ipTypes: [
      { value: "opposition", label: "Eʼtiroz" },
      { value: "cancellation", label: "Chaqirib olish" },
      { value: "cease_desist", label: "Pretensiya" },
      { value: "monitoring", label: "Monitoring" },
    ],
    orgName: "Tashkilot nomi",
    registries: "Kerakli reestrlar",
    volume: "Taxminiy oyiga soʻrovlar",
  },
  fees: {
    title: "Yigʻimlar kalkulyatori",
    lead: "Sinflar soni va davlatlarni tanlang — orientir smeta.",
    classesLabel: "Sinflar soni",
    classesOf: "MKTU · 1–45",
    jurisdictionsLabel: "Davlatlar / reestrlar",
    estimateTitle: "Smeta",
    totalLabel: "Jami (orientir)",
    asOf: "Tariflar sanasi",
    disclaimer:
      "Rasmiy yigʻimlar oʻzgarishi mumkin. Yakuniy summa vakolatli organ boʻyicha.",
    empty: "Kamida bitta davlatni tanlang.",
  },
  upsell: {
    title: "Keyingi qadamlar",
    classes: "Sinflar va yigʻimlar smetasi",
    filing: "Ariza paketini yigʻish",
    attorney: "Patent vakilini bogʻlash",
  },
};

const ru: LocaleBundle = {
  hub: {
    title: "Услуги",
    lead: "От знака до заявки — классы, проверка, пакет, поверенный и B2B-доступ.",
    journeyTitle: "Как это связано",
    journeyLead: "Простая цепочка: классы и смета → проверка → пакет и поверенный.",
    journeySteps: [
      "Классы МКТУ и ориентир пошлин по странам",
      "AI-проверка возможности регистрации",
      "Пакет заявки и привязка патентного поверенного",
    ],
    checkCta: "Сначала проверить знак",
    moreLabel: "Подробнее",
  },
  details: {
    "nice-classes-fees": {
      title: "Подбор классов МКТУ и калькулятор пошлин",
      short: "Подберите классы по деятельности и посчитайте пошлины по странам.",
      hero: "Опишите товары/услуги — система предложит классы МКТУ и ориентировочную смету по выбранным юрисдикциям.",
      forWhom: "Владельцы брендов, агентства и юристы на этапе планирования подачи.",
      result: "Список классов + смета пошлин по странам (ориентир).",
      steps: [
        { title: "Опишите деятельность", text: "Текст или выбор из каталога." },
        { title: "Подтвердите классы", text: "Проверьте рекомендованные классы МКТУ." },
        { title: "Выберите страны", text: "UZ, Madrid, EU, US, AU, KZ." },
        { title: "Получите смету", text: "Базовые и дополнительные пошлины." },
      ],
      deliverables: ["Классы МКТУ", "Смета по странам", "Сохранение сметы / PDF (далее)"],
      notIncluded: ["Оплата официальных пошлин", "Подача в госорган"],
      pricingHint: "Базовый расчёт — ориентир; углублённая консультация отдельно.",
      disclaimer:
        "Суммы носят информационный характер. Официальные тарифы могут меняться.",
      primaryCta: { label: "Открыть калькулятор", href: "#tool" },
      secondaryCta: { label: "Заказать консультацию", href: "/contacts/" },
      faq: [
        {
          q: "Это официальная пошлина?",
          a: "Нет — ориентир. Актуальные тарифы утверждает уполномоченный орган.",
        },
      ],
      relatedSlugs: ["trademark-check", "filing-package"],
    },
    "trademark-check": {
      title: "Проверка возможности регистрации",
      short: "Найдите похожие знаки и оцените риск до подачи заявки.",
      hero: "AI оценивает сходство по национальным и выбранным зарубежным реестрам. Результат — информационный отчёт.",
      forWhom: "Запуск бренда и оценка риска перед подачей.",
      result: "AI-отчёт: совпадения, Risk Score, рекомендации.",
      steps: [
        { title: "Имя и деятельность", text: "Бренд и товары/услуги." },
        { title: "Реестры", text: "UZ базово; EU/US/AU и др. — опционально." },
        { title: "Отчёт", text: "Понятный результат за минуты." },
      ],
      deliverables: ["PDF-отчёт", "Блоки по источникам", "Кредиты в кабинете"],
      notIncluded: ["Юридическая гарантия", "Решение госэкспертизы"],
      pricingHint: "1 проверка = 1 кредит (+ доп. за зарубежные реестры).",
      disclaimer:
        "Отчёт информационный. Окончательное решение принимает уполномоченный орган.",
      primaryCta: { label: "Начать проверку", href: "/check/" },
      secondaryCta: { label: "Кредиты", href: "/account/billing/" },
      faq: [
        {
          q: "Это гарантия регистрации?",
          a: "Нет. Это предварительная AI-оценка.",
        },
      ],
      relatedSlugs: ["nice-classes-fees", "filing-package", "attorney-match"],
    },
    "filing-package": {
      title: "Пакет для подачи заявки",
      short: "Соберём документы и данные для подачи на регистрацию.",
      hero: "После проверки и классов — полный пакет: данные, файлы, чеклист.",
      forWhom: "Те, кто готов формально подавать знак.",
      result: "Подготовленный пакет + статус в кабинете.",
      steps: [
        { title: "Заявка", text: "Знак, классы, заявитель, страна." },
        { title: "Файлы", text: "Логотип, доверенность и др." },
        { title: "Подготовка", text: "Специалист собирает пакет (без автоподачи)." },
        { title: "Готово к подаче", text: "Вы или поверенный подаёте официально." },
      ],
      deliverables: ["Чеклист", "Статус пакета", "Привязка поверенного"],
      notIncluded: ["Автоподача в Adliya", "Оплата госпошлины"],
      pricingHint: "Стоимость зависит от объёма — уточним по заявке.",
      primaryCta: { label: "Заявка на пакет", href: "#order" },
      secondaryCta: { label: "Сначала проверка", href: "/check/" },
      faq: [
        {
          q: "Вы сами подаёте в Adliya?",
          a: "В v1 готовим пакет; официальную подачу делает заявитель или поверенный.",
        },
      ],
      relatedSlugs: ["trademark-check", "attorney-match", "nice-classes-fees"],
    },
    "attorney-match": {
      title: "Подбор и привязка патентного поверенного",
      short: "Выберите поверенного из официального реестра и привяжите к заказу.",
      hero: "Каталог патентных поверенных Adliya — подбор и привязка к вашей услуге.",
      forWhom: "Нужен поверенный для подачи или защиты ИС.",
      result: "Поверенный привязан к заказу; уведомление отправлено.",
      steps: [
        { title: "Поиск", text: "Фильтр по имени, региону, услугам." },
        { title: "Выбор", text: "Карточка и кнопка привязки." },
        { title: "Заказ", text: "Поверенный закрепляется за заказом." },
      ],
      deliverables: ["Каталог", "Привязка к заказу", "Контакты"],
      notIncluded: ["Гонорар поверенного (прямая договорённость)"],
      pricingHint: "Подбор из каталога бесплатно.",
      primaryCta: { label: "К каталогу", href: "#attorneys" },
      secondaryCta: { label: "Оставить заявку", href: "#order" },
      faq: [
        {
          q: "Откуда список?",
          a: "Официальный реестр: im.adliya.uz/patent-attorney.",
        },
      ],
      relatedSlugs: ["filing-package", "ip-protection"],
    },
    "ip-protection": {
      title: "Защита интересов объекта ИС",
      short: "Возражение, аннулирование, претензия или мониторинг.",
      hero: "Опишите ситуацию — подготовим работу по выбранному типу защиты.",
      forWhom: "Правообладатели и их представители.",
      result: "Заказ по типу работы + сбор доказательств.",
      steps: [
        { title: "Тип", text: "Возражение, аннулирование, претензия, мониторинг." },
        { title: "Доказательства", text: "Знаки, даты, файлы." },
        { title: "Обработка", text: "Специалист / поверенный готовит пакет." },
      ],
      deliverables: ["Статус заказа", "Хранение доказательств", "Привязка поверенного"],
      notIncluded: ["Автопредставительство в суде", "Гарантия исхода"],
      pricingHint: "Оценка по типу работы в заявке.",
      disclaimer: "Не является юридическим заключением.",
      primaryCta: { label: "Заявка на защиту", href: "#order" },
      secondaryCta: { label: "Связаться", href: "/contacts/" },
      faq: [
        {
          q: "Нужен ли отчёт проверки?",
          a: "Желательно — ускоряет подготовку.",
        },
      ],
      relatedSlugs: ["trademark-check", "attorney-match"],
    },
    "attorney-access": {
      title: "Доступ к базам для поверенных и агентств",
      short: "B2B-доступ к поиску и реестрам для IP-практик.",
      hero: "Для патентных поверенных и агентств: заявка в waitlist, затем org и API.",
      forWhom: "Патентные поверенные, IP-агентства, корпоративные юркоманды.",
      result: "Заявка в waitlist; далее org-аккаунт и API.",
      steps: [
        { title: "Заявка", text: "Организация, роли, реестры, объём." },
        { title: "Согласование", text: "Договор и лимиты." },
        { title: "Доступ", text: "Участники org и API-ключи." },
      ],
      deliverables: ["Waitlist", "Далее: org, API, audit"],
      notIncluded: ["Безлимитный scraping", "Общий UI с consumer-кабинетом"],
      pricingHint: "Подписка / seat — по договору.",
      primaryCta: { label: "B2B-заявка", href: "#order" },
      secondaryCta: { label: "Связаться", href: "/contacts/" },
      faq: [
        {
          q: "Когда будет API?",
          a: "После waitlist — с договором и rate limit.",
        },
      ],
      relatedSlugs: ["attorney-match", "trademark-check"],
    },
  },
  orderForm: {
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    company: "Компания",
    mark: "Товарный знак / объект",
    classes: "Классы МКТУ (опционально)",
    country: "Основная страна",
    message: "Комментарий",
    submit: "Отправить",
    success: "Заявка принята. Мы свяжемся с вами.",
    error: "Не удалось отправить. Попробуйте ещё раз.",
    ipTypeLabel: "Тип работы",
    ipTypes: [
      { value: "opposition", label: "Возражение" },
      { value: "cancellation", label: "Аннулирование" },
      { value: "cease_desist", label: "Претензия" },
      { value: "monitoring", label: "Мониторинг" },
    ],
    orgName: "Название организации",
    registries: "Нужные реестры",
    volume: "Ориентир запросов в месяц",
  },
  fees: {
    title: "Калькулятор пошлин",
    lead: "Укажите число классов и страны — ориентировочная смета.",
    classesLabel: "Число классов",
    classesOf: "МКТУ · 1–45",
    jurisdictionsLabel: "Страны / реестры",
    estimateTitle: "Смета",
    totalLabel: "Итого (ориентир)",
    asOf: "Тарифы на дату",
    disclaimer:
      "Официальные пошлины могут меняться. Итог — по данным уполномоченного органа.",
    empty: "Выберите хотя бы одну юрисдикцию.",
  },
  upsell: {
    title: "Следующие шаги",
    classes: "Классы и смета пошлин",
    filing: "Собрать пакет на подачу",
    attorney: "Привязать поверенного",
  },
};

const en: LocaleBundle = {
  hub: {
    title: "Services",
    lead: "From mark to filing — classes, screening, package, attorney, and B2B access.",
    journeyTitle: "How it connects",
    journeyLead: "Simple path: classes & fees → check → filing package & attorney.",
    journeySteps: [
      "Nice classes and fee estimate by country",
      "AI registrability screening",
      "Filing package and attorney attachment",
    ],
    checkCta: "Screen a mark first",
    moreLabel: "Learn more",
  },
  details: {
    "nice-classes-fees": {
      title: "Nice classes & fee calculator",
      short: "Pick classes for your goods/services and estimate fees by country.",
      hero: "Describe your activity — get Nice class suggestions and an indicative fee estimate across jurisdictions.",
      forWhom: "Brand owners, agencies, and counsel planning a filing.",
      result: "Class list + per-country fee estimate (indicative).",
      steps: [
        { title: "Describe activity", text: "Free text or catalogue terms." },
        { title: "Confirm classes", text: "Review suggested Nice classes." },
        { title: "Pick countries", text: "UZ, Madrid, EU, US, AU, KZ." },
        { title: "Get estimate", text: "Base and add-on fees." },
      ],
      deliverables: ["Nice classes", "Country fee estimate", "Save / PDF later"],
      notIncluded: ["Paying official fees", "Filing with the office"],
      pricingHint: "Base estimate is indicative; deep consult is separate.",
      disclaimer:
        "Amounts are informational. Official fees may change.",
      primaryCta: { label: "Open calculator", href: "#tool" },
      secondaryCta: { label: "Request a consult", href: "/contacts/" },
      faq: [
        {
          q: "Is this the official fee?",
          a: "No — an estimate. Competent authorities set official tariffs.",
        },
      ],
      relatedSlugs: ["trademark-check", "filing-package"],
    },
    "trademark-check": {
      title: "Registrability check",
      short: "Find similar marks and assess risk before filing.",
      hero: "AI screens national and selected foreign registries. The report is informational, not a legal opinion.",
      forWhom: "Teams launching a brand or assessing filing risk.",
      result: "AI report: matches, Risk Score, recommendations.",
      steps: [
        { title: "Name & activity", text: "Brand and goods/services." },
        { title: "Registries", text: "UZ base; EU/US/AU optional." },
        { title: "Report", text: "Clear output in minutes." },
      ],
      deliverables: ["PDF report", "Per-source blocks", "Credits in cabinet"],
      notIncluded: ["Legal guarantee", "Office examination decision"],
      pricingHint: "1 check = 1 credit (+ extras for foreign registries).",
      disclaimer:
        "Informational only. The competent authority decides registration.",
      primaryCta: { label: "Start a check", href: "/check/" },
      secondaryCta: { label: "Credits", href: "/account/billing/" },
      faq: [
        {
          q: "Does this guarantee registration?",
          a: "No. It is a preliminary AI assessment.",
        },
      ],
      relatedSlugs: ["nice-classes-fees", "filing-package", "attorney-match"],
    },
    "filing-package": {
      title: "Filing package preparation",
      short: "We assemble documents and data for a trademark filing.",
      hero: "After screening and classes — a complete package: data, files, checklist.",
      forWhom: "Anyone ready to file formally.",
      result: "Prepared package + status in your cabinet.",
      steps: [
        { title: "Request", text: "Mark, classes, applicant, country." },
        { title: "Files", text: "Logo, power of attorney, etc." },
        { title: "Prep", text: "Specialist assembles the package (no auto-filing)." },
        { title: "Ready", text: "You or an attorney file officially." },
      ],
      deliverables: ["Checklist", "Package status", "Attorney attach"],
      notIncluded: ["Auto-filing to Adliya", "Paying state fees"],
      pricingHint: "Quoted per scope in the request.",
      primaryCta: { label: "Request a package", href: "#order" },
      secondaryCta: { label: "Screen first", href: "/check/" },
      faq: [
        {
          q: "Do you file with Adliya yourselves?",
          a: "In v1 we prepare the package; official filing is by you or an attorney.",
        },
      ],
      relatedSlugs: ["trademark-check", "attorney-match", "nice-classes-fees"],
    },
    "attorney-match": {
      title: "Attorney match & attach",
      short: "Pick an attorney from the official list and attach them to an order.",
      hero: "Catalogue of Adliya-listed patent attorneys — select and attach to your service order.",
      forWhom: "Anyone who needs counsel for filing or IP defence.",
      result: "Attorney linked to the order; notification sent.",
      steps: [
        { title: "Search", text: "Filter by name, region, services." },
        { title: "Select", text: "Open a card and attach." },
        { title: "Order", text: "Attorney is bound to the order." },
      ],
      deliverables: ["Catalogue", "Order attach", "Contacts"],
      notIncluded: ["Attorney fees (direct engagement)"],
      pricingHint: "Catalogue selection is free.",
      primaryCta: { label: "Browse catalogue", href: "#attorneys" },
      secondaryCta: { label: "Leave a request", href: "#order" },
      faq: [
        {
          q: "Source of the list?",
          a: "Official registry: im.adliya.uz/patent-attorney.",
        },
      ],
      relatedSlugs: ["filing-package", "ip-protection"],
    },
    "ip-protection": {
      title: "IP interest protection",
      short: "Opposition, cancellation, cease-and-desist, or monitoring.",
      hero: "Describe the situation — we open a workstream for the selected protection type.",
      forWhom: "Rights holders and their representatives.",
      result: "Typed order + evidence collection.",
      steps: [
        { title: "Type", text: "Opposition, cancellation, C&D, monitoring." },
        { title: "Evidence", text: "Marks, dates, files." },
        { title: "Handling", text: "Specialist / attorney prepares the package." },
      ],
      deliverables: ["Order status", "Evidence storage", "Attorney attach"],
      notIncluded: ["Automatic court representation", "Outcome guarantee"],
      pricingHint: "Scoped in the request.",
      disclaimer: "Not a legal opinion.",
      primaryCta: { label: "Protection request", href: "#order" },
      secondaryCta: { label: "Contact us", href: "/contacts/" },
      faq: [
        {
          q: "Is a screening report required?",
          a: "Optional, but it speeds preparation.",
        },
      ],
      relatedSlugs: ["trademark-check", "attorney-match"],
    },
    "attorney-access": {
      title: "Registry access for attorneys & agencies",
      short: "B2B access to search and registries for IP practices.",
      hero: "For patent attorneys and agencies: join the waitlist, then org accounts and API.",
      forWhom: "Patent attorneys, IP agencies, corporate legal teams.",
      result: "Waitlist request; later org account and API.",
      steps: [
        { title: "Request", text: "Org, roles, registries, volume." },
        { title: "Review", text: "Contract and limits." },
        { title: "Access", text: "Org members and API keys." },
      ],
      deliverables: ["Waitlist", "Later: org, API, audit"],
      notIncluded: ["Unlimited scraping", "Shared UI with consumer cabinet"],
      pricingHint: "Subscription / seat — by agreement.",
      primaryCta: { label: "B2B request", href: "#order" },
      secondaryCta: { label: "Contact us", href: "/contacts/" },
      faq: [
        {
          q: "When is the API available?",
          a: "After waitlist — with contract and rate limits.",
        },
      ],
      relatedSlugs: ["attorney-match", "trademark-check"],
    },
  },
  orderForm: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    mark: "Trademark / subject",
    classes: "Nice classes (optional)",
    country: "Primary country",
    message: "Notes",
    submit: "Submit",
    success: "Request received. We will contact you soon.",
    error: "Could not send. Please try again.",
    ipTypeLabel: "Work type",
    ipTypes: [
      { value: "opposition", label: "Opposition" },
      { value: "cancellation", label: "Cancellation" },
      { value: "cease_desist", label: "Cease and desist" },
      { value: "monitoring", label: "Monitoring" },
    ],
    orgName: "Organisation name",
    registries: "Needed registries",
    volume: "Approx. monthly queries",
  },
  fees: {
    title: "Fee calculator",
    lead: "Pick class count and countries for an indicative estimate.",
    classesLabel: "Number of classes",
    classesOf: "Nice · 1–45",
    jurisdictionsLabel: "Countries / registries",
    estimateTitle: "Estimate",
    totalLabel: "Total (indicative)",
    asOf: "Tariffs as of",
    disclaimer:
      "Official fees may change. Final amounts follow the competent authority.",
    empty: "Select at least one jurisdiction.",
  },
  upsell: {
    title: "Next steps",
    classes: "Classes & fee estimate",
    filing: "Build a filing package",
    attorney: "Attach an attorney",
  },
};

const byLocale: Record<Locale, LocaleBundle> = { uz, ru, en };

export function getServicesCopy(locale: Locale): LocaleBundle {
  return byLocale[locale] ?? uz;
}

export function getServiceDetail(
  locale: Locale,
  slug: ServiceSlug,
): ServiceDetailCopy {
  return getServicesCopy(locale).details[slug];
}
