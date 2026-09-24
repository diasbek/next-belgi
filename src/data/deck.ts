/**
 * Investor pitch deck copy (Russian only).
 * Keep short — slide text, not landing copy. No invented metrics.
 */

export type DeckProblemPair = {
  problem: string;
  solution: string;
};

export type DeckStep = {
  title: string;
  text: string;
};

export type DeckOfferItem = {
  segment: string;
  offer: string;
};

export type DeckTeamRole = {
  role: string;
  note: string;
};

export type DeckHowDemo = {
  brand: string;
  activity: string;
  classLabel: string;
  registries: string[];
  searchingTitle: string;
  pipeline: string[];
  reportTitle: string;
  reportChance: string;
  reportMeta: string;
  demoBadge: string;
  stepMs: number;
  briefMs: number;
  reportMs: number;
  loopGapMs: number;
};

export type DeckCompareValue = "yes" | "no" | "partial";

export type DeckCompareRow = {
  label: string;
  values: DeckCompareValue[];
};

export type DeckFlowKind = "money" | "value" | "lead" | "satisfaction";

export type DeckBusinessActor = {
  id: string;
  label: string;
  detail: string;
};

export type DeckBusinessFlow = {
  from: string;
  to: string;
  kind: DeckFlowKind;
  label: string;
};

export type DeckGtmStage = {
  title: string;
  unlocks: string;
  actions: string[];
};

export type DeckCopy = {
  gateTitle: string;
  gateLead: string;
  gatePassword: string;
  gateSubmit: string;
  gateError: string;
  brand: string;
  title: {
    tagline: string;
    market: string;
    url: string;
  };
  problem: {
    eyebrow: string;
    heading: string;
    pairs: DeckProblemPair[];
  };
  how: {
    eyebrow: string;
    heading: string;
    steps: DeckStep[];
    demo: DeckHowDemo;
  };
  why: {
    eyebrow: string;
    heading: string;
    columns: string[];
    rows: DeckCompareRow[];
    legendYes: string;
    legendPartial: string;
    legendNo: string;
    footnote: string;
  };
  business: {
    eyebrow: string;
    heading: string;
    actors: DeckBusinessActor[];
    flows: DeckBusinessFlow[];
    moneyTitle: string;
    moneySources: string[];
    satisfactionTitle: string;
    satisfactionSteps: string[];
    legend: Record<DeckFlowKind, string>;
    footnote: string;
  };
  gtm: {
    eyebrow: string;
    heading: string;
    lead: string;
    stages: DeckGtmStage[];
    footnote: string;
  };
  team: {
    eyebrow: string;
    heading: string;
    roles: DeckTeamRole[];
  };
  offer: {
    eyebrow: string;
    heading: string;
    items: DeckOfferItem[];
    contact: {
      name: string;
      role: string;
      initials: string;
      telegramLabel: string;
      telegramUrl: string;
      email: string;
      qrUrl: string;
    };
  };
};

export const deckCopy: DeckCopy = {
  gateTitle: "Belgi.ai",
  gateLead: "Питч-дек. Введите пароль, чтобы открыть.",
  gatePassword: "Пароль",
  gateSubmit: "Открыть",
  gateError: "Неверный пароль",
  brand: "Belgi.ai",
  title: {
    tagline: "AI-проверка товарного знака до подачи заявки",
    market: "Узбекистан",
    url: "belgi.nocode.uz",
  },
  problem: {
    eyebrow: "Проблема → решение",
    heading: "Что мешает до подачи — и как отвечает Belgi.ai",
    pairs: [
      {
        problem: "Ручной поиск по реестрам занимает время и легко пропустить похожие знаки",
        solution: "Одна форма: Adliya (УЗ) и Madrid с указанием UZ в базовой проверке",
      },
      {
        problem: "Сходство неочевидно: транслит, фонетика, смысл, классы МКТУ",
        solution:
          "Поиск точных, текстовых, фонетических и семантических совпадений + разбор товаров/услуг",
      },
      {
        problem: "Пошлины списываются до того, как виден риск отказа",
        solution: "Оценка шанса регистрации и понятный отчёт за несколько минут",
      },
      {
        problem: "Черновой поиск не должен занимать патентного поверенного",
        solution:
          "Отчёт с контактами поверенных; это информационная оценка, не юридическое заключение",
      },
    ],
  },
  how: {
    eyebrow: "Как это работает",
    heading: "От названия до проверяемого отчёта",
    steps: [
      {
        title: "Название",
        text: "Вводите обозначение, которое хотите зарегистрировать.",
      },
      {
        title: "Товары и услуги",
        text: "Выбираете позиции МКТУ — система определяет затронутые классы.",
      },
      {
        title: "Реестры",
        text: "Ищем в доступных источниках: УЗ, Madrid (UZ), при выборе — EUIPO, USPTO, IP Australia.",
      },
      {
        title: "Отчёт",
        text: "Сходство, шанс по классам, PDF и код проверки на /v/.",
      },
    ],
    /** Looping demo of the real check pipeline (same steps as /check/). */
    demo: {
      brand: "NOVA",
      activity: "одежда",
      classLabel: "Класс 25",
      registries: ["Adliya", "Madrid · UZ"],
      searchingTitle: "Система ищет похожие товарные знаки",
      pipeline: [
        "Нормализацию названия",
        "Определение языка",
        "Транслитерацию",
        "Определение МКТУ",
        "Поиск точных совпадений",
        "Поиск текстовых совпадений",
        "Поиск фонетических совпадений",
        "Поиск семантических совпадений",
        "Анализ товаров/услуг",
        "Ранжирование найденных знаков",
        "Расчёт Risk Score",
        "Формирование AI-заключения",
      ],
      reportTitle: "Отчёт готов",
      reportChance: "Высокий шанс · класс 25",
      reportMeta: "PDF · код проверки /v/NOVADEMO",
      demoBadge: "Демо",
      stepMs: 720,
      briefMs: 1400,
      reportMs: 2600,
      loopGapMs: 900,
    },
  },
  why: {
    eyebrow: "Почему лучше",
    heading: "Сравнение по сильным сторонам Belgi.ai",
    columns: [
      "Belgi.ai",
      "Портал Adliya",
      "Поверенный · вручную",
      "Общий AI",
    ],
    rows: [
      {
        label: "Черновой отчёт за минуты, self-serve",
        values: ["yes", "no", "no", "partial"],
      },
      {
        label: "Поиск по реестру УЗ (Adliya)",
        values: ["yes", "yes", "yes", "no"],
      },
      {
        label: "Madrid · указания UZ в той же проверке",
        values: ["yes", "no", "partial", "no"],
      },
      {
        label: "EUIPO / USPTO / IP Australia (+1 кредит)",
        values: ["yes", "no", "partial", "no"],
      },
      {
        label: "Точное + текстовое + фонетика + семантика",
        values: ["yes", "no", "partial", "partial"],
      },
      {
        label: "Risk Score / шанс по классам МКТУ",
        values: ["yes", "no", "partial", "no"],
      },
      {
        label: "PDF + проверяемый код /v/",
        values: ["yes", "no", "partial", "no"],
      },
      {
        label: "uz / ru / en и путь к поверенным",
        values: ["yes", "partial", "yes", "no"],
      },
    ],
    legendYes: "да",
    legendPartial: "частично",
    legendNo: "нет",
    footnote:
      "Сравнение с типичными альтернативами на рынке УЗ. Belgi.ai — информационная оценка, не замена экспертизы Минюста.",
  },
  business: {
    eyebrow: "Бизнес-модель",
    heading: "Кто кому что даёт — и откуда деньги",
    actors: [
      {
        id: "brands",
        label: "Бренды / стартапы",
        detail: "Хотят проверить знак до пошлин",
      },
      {
        id: "agencies",
        label: "IP-агентства",
        detail: "Нужен быстрый черновой отчёт",
      },
      {
        id: "belgi",
        label: "Belgi.ai",
        detail: "Проверка, отчёт, кредиты, маркетплейс услуг",
      },
      {
        id: "attorneys",
        label: "Патентные поверенные",
        detail: "Заявка и сопровождение экспертизы",
      },
    ],
    flows: [
      {
        from: "brands",
        to: "belgi",
        kind: "money",
        label: "Пакеты кредитов · Payme / Click",
      },
      {
        from: "agencies",
        to: "belgi",
        kind: "money",
        label: "B2B-пакеты проверок",
      },
      {
        from: "belgi",
        to: "brands",
        kind: "value",
        label: "Отчёт, Risk Score, PDF, /v/",
      },
      {
        from: "belgi",
        to: "agencies",
        kind: "value",
        label: "Черновик вместо ручного поиска",
      },
      {
        from: "belgi",
        to: "attorneys",
        kind: "lead",
        label: "Лиды и заказы на подачу",
      },
      {
        from: "attorneys",
        to: "brands",
        kind: "value",
        label: "Подача и экспертиза",
      },
      {
        from: "brands",
        to: "belgi",
        kind: "satisfaction",
        label: "Повторные кредиты · рекомендации",
      },
    ],
    moneyTitle: "Деньги → Belgi.ai",
    moneySources: [
      "Кредиты за проверку (UZ + Madrid в базе)",
      "Доп. кредит за EU / US / AU",
      "Пакеты в UZS через Payme и Click",
      "Допродажа: пакет заявки и привязка поверенного",
    ],
    satisfactionTitle: "Удовлетворённость",
    satisfactionSteps: [
      "Понятный отчёт до пошлин → меньше сюрпризов",
      "Прозрачный шанс по классам → доверие к решению",
      "Путь к поверенному → доведение до регистрации",
      "Повторные проверки и B2B-пакеты → LTV",
    ],
    legend: {
      money: "Деньги",
      value: "Ценность",
      lead: "Лиды",
      satisfaction: "Удовлетворённость",
    },
    footnote:
      "Основной cash-in — кредиты. Поверенные усиливают конверсию в регистрацию и повторные покупки.",
  },
  gtm: {
    eyebrow: "GTM",
    heading: "Что сделать, чтобы модель заработала",
    lead: "Пять рычагов — каждый закрывает свой поток из бизнес-модели.",
    stages: [
      {
        title: "Первая проверка",
        unlocks: "Бренды → кредиты",
        actions: [
          "SEO и реклама: «проверка товарного знака Узбекистан» (uz/ru)",
          "Демо-проверка на сайте без оплаты — снять страх «чёрного ящика»",
          "Контент: кейсы отказа из‑за схожести + дисклеймер Минюста",
        ],
      },
      {
        title: "Оплата без трения",
        unlocks: "Cash-in Payme / Click",
        actions: [
          "Пакеты кредитов с ясной ценой за проверку и +1 за зарубежный реестр",
          "Онбординг после оплаты: сразу «новая проверка», не пустой кабинет",
          "Чеки, оферта, возвраты — доверие к платежу в UZS",
        ],
      },
      {
        title: "B2B агентства",
        unlocks: "Агентства → пакеты",
        actions: [
          "Пилоты 5–10 IP-агентствам: пакет проверок вместо ручного черновика",
          "Скидка / отдельный тариф, выгрузка PDF и код /v/ для клиента агентства",
          "Обучение: как читать Risk Score и когда эскалировать поверенному",
        ],
      },
      {
        title: "Канал поверенных",
        unlocks: "Лиды → регистрация",
        actions: [
          "Каталог из реестра Минюста + CTA «подать заявку» из отчёта",
          "SLA ответа и комиссия/лид для активных поверенных",
          "Совместный оффер: проверка Belgi + подача поверенным",
        ],
      },
      {
        title: "Удержание и LTV",
        unlocks: "Удовлетворённость → повтор",
        actions: [
          "После отчёта: follow-up «проверить другой знак / другой класс»",
          "Напоминания о зарубежных реестрах, если бренд идёт на экспорт",
          "Сбор NPS и отзывов; рефералка: кредит за приведённого клиента",
        ],
      },
    ],
    footnote:
      "Порядок важен: сначала self-serve и оплата, затем B2B и поверенные — иначе лиды без продукта и денег.",
  },
  team: {
    eyebrow: "Команда",
    heading: "Кто делает продукт",
    roles: [
      {
        role: "Лазизхужа Шарипов",
        note: "Маркетинговый гуру Узбекистана",
      },
      {
        role: "Диас Абдурахманов",
        note: "Технический специалист",
      },
      {
        role: "Юридические партнёры",
        note: "Патентные поверенные из реестра Минюста",
      },
    ],
  },
  offer: {
    eyebrow: "Оффер",
    heading: "Приглашаем к сотрудничеству",
    items: [
      {
        segment: "Бренды и стартапы в Узбекистане",
        offer:
          "AI-проверка знака до подачи: отчёт с Risk Score, PDF и кодом подлинности — до оплаты пошлин",
      },
      {
        segment: "IP-агентства и юридические фирмы",
        offer:
          "Пакеты проверок вместо ручного черновика: Adliya + Madrid UZ, выгрузка PDF и /v/ для клиента агентства",
      },
      {
        segment: "Патентные поверенные",
        offer:
          "Лиды из отчётов и совместный оффер: проверка Belgi.ai + подача и сопровождение экспертизы",
      },
    ],
    contact: {
      name: "Лазизхужа Шарипов",
      role: "Маркетинг и партнёрства",
      initials: "ЛШ",
      telegramLabel: "t.me/belgi_ai",
      telegramUrl: "https://t.me/belgi_ai",
      email: "hello@belgi.ai",
      qrUrl: "https://belgi.nocode.uz/contacts/",
    },
  },
};
