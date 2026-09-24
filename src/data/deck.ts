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

export type DeckBullet = string;

export type DeckTeamRole = {
  role: string;
  note: string;
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
  };
  why: {
    eyebrow: string;
    heading: string;
    against: string[];
    points: DeckBullet[];
  };
  business: {
    eyebrow: string;
    heading: string;
    points: DeckBullet[];
  };
  gtm: {
    eyebrow: string;
    heading: string;
    points: DeckBullet[];
  };
  team: {
    eyebrow: string;
    heading: string;
    roles: DeckTeamRole[];
  };
  offer: {
    eyebrow: string;
    heading: string;
    offers: DeckBullet[];
    contactsLabel: string;
    contactsFallback: string;
    ctaCheck: string;
    ctaContacts: string;
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
  },
  why: {
    eyebrow: "Почему лучше",
    heading: "Не ручной поиск и не «просто спросить чат»",
    against: [
      "Ручной просмотр реестра — медленно и легко пропустить варианты",
      "Общий LLM без реестра — уверенный тон без привязки к актуальным знакам",
    ],
    points: [
      "Ответ опирается на реестры, а не на догадку модели",
      "База: Узбекистан (Adliya) + Madrid с указанием UZ",
      "Дополнительно: EUIPO, USPTO, IP Australia — каждая страна +1 кредит",
      "Kazpatent (Казахстан) — в плане интеграции",
      "Отчёт с дисклеймером: окончательное решение за уполномоченным органом",
    ],
  },
  business: {
    eyebrow: "Бизнес-модель",
    heading: "Кредиты, пакеты, допродажа услуг",
    points: [
      "1 проверка = кредиты (UZ + Madrid в базе; зарубежные реестры — доп. кредит)",
      "Пакеты кредитов в UZS через Payme и Click",
      "Допродажа: подготовка заявки и сопровождение экспертизы через поверенных",
      "Аудитория: бренды / стартапы и IP-агентства",
    ],
  },
  gtm: {
    eyebrow: "GTM",
    heading: "Как выходим на рынок",
    points: [
      "Сайт на uz / ru / en с SEO по проверке знака в Узбекистане",
      "Демо-проверка на сайте — низкий порог первого контакта",
      "Каталог патентных поверенных как канал и доверие",
      "B2B: агентствам — отчёт вместо ручного чернового поиска",
    ],
  },
  team: {
    eyebrow: "Команда",
    heading: "Кто делает продукт",
    roles: [
      { role: "Продукт", note: "Имя — подставить" },
      { role: "Разработка", note: "Имя — подставить" },
      {
        role: "Юридические партнёры",
        note: "Патентные поверенные из реестра Минюста",
      },
    ],
  },
  offer: {
    eyebrow: "Оффер",
    heading: "Что предлагаем сейчас",
    offers: [
      "Проверить знак до подачи и получить отчёт с оценкой шанса",
      "Взять пакет проверок для команды или агентства",
      "Для IP-агентств: один структурированный отчёт вместо ручного черновика",
    ],
    contactsLabel: "Контакты",
    contactsFallback: "Актуальные контакты — на странице /contacts/",
    ctaCheck: "Проверить знак",
    ctaContacts: "Контакты",
  },
};
