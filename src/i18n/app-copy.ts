export type AppNavItem = {
  href: string;
  labelKey: keyof AppCopy["nav"];
};

export type AppCopy = {
  brand: string;
  account: string;
  admin: string;
  logout: string;
  credits: string;
  backToSite: string;
  nav: {
    overview: string;
    newCheck: string;
    history: string;
    billing: string;
    profile: string;
    dashboard: string;
    users: string;
    payments: string;
    plans: string;
    checks: string;
    leads: string;
    registry: string;
    attorneys: string;
    ledger: string;
    notifications: string;
    sessions: string;
    settings: string;
    integrations: string;
  };
  overview: {
    title: string;
    lead: string;
    balance: string;
    recent: string;
    emptyChecks: string;
    topUp: string;
    totalChecks: string;
  };
  history: {
    title: string;
    lead: string;
    empty: string;
    query: string;
    date: string;
    classes: string;
  };
  billing: {
    title: string;
    lead: string;
    plans: string;
    payPayme: string;
    payClick: string;
    payDev: string;
    notConfigured: string;
    ledger: string;
    creditsLabel: string;
    priceLabel: string;
    resumeHint: string;
    continueCheck: string;
  };
  profile: {
    title: string;
    lead: string;
    name: string;
    email: string;
    phone: string;
    save: string;
    saved: string;
    error: string;
    providers: string;
    hasPassword: string;
    noPassword: string;
    linkGoogle: string;
    unlinkGoogle: string;
    googleUnlinked: string;
    linkEmail: string;
    linkPhone: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    sendOtp: string;
    linkDone: string;
    cancel: string;
  };
  adminDash: {
    title: string;
    lead: string;
    users: string;
    checksToday: string;
    revenue: string;
    failedPayments: string;
  };
  adminUsers: {
    title: string;
    lead: string;
    role: string;
    balance: string;
    adjust: string;
    roleAdmin: string;
    roleUser: string;
    searchPlaceholder: string;
    allRoles: string;
    allStatuses: string;
    colUser: string;
    status: string;
    statusActive: string;
    actions: string;
    shown: string;
    statTotal: string;
    statActive: string;
    statBalance: string;
    addUser: string;
    userId: string;
  };
  adminPayments: {
    title: string;
    lead: string;
  };
  adminPlans: {
    title: string;
    lead: string;
  };
  adminChecks: {
    title: string;
    lead: string;
  };
  adminLeads: {
    title: string;
    lead: string;
  };
  adminRegistry: {
    title: string;
    lead: string;
    count: string;
    importStatus: string;
    search: string;
    searchPlaceholder: string;
    showing: string;
    empty: string;
  };
  adminAttorneys: {
    title: string;
    lead: string;
    count: string;
  };
  adminLedger: {
    title: string;
    lead: string;
  };
  adminNotifications: {
    title: string;
    lead: string;
  };
  adminSessions: {
    title: string;
    lead: string;
    active: string;
    revoked: string;
  };
  adminSettings: {
    title: string;
    lead: string;
    envNote: string;
  };
  adminIntegrations: {
    title: string;
    lead: string;
    save: string;
    test: string;
    saved: string;
    configured: string;
    missing: string;
    enabled: string;
    disabled: string;
    close: string;
    mode: string;
    modeLive: string;
    modeTest: string;
    modeSandbox: string;
    modeDev: string;
    modeMock: string;
    testOtpHint: string;
    devPayHint: string;
    sandboxPayHint: string;
    masterKeyNote: string;
    resetSilent: string;
    resetSilentDone: string;
    catMessaging: string;
    catPayments: string;
    catAi: string;
    catAuth: string;
    catData: string;
    modules: Record<
      | "eskiz"
      | "resend"
      | "telegram"
      | "openai"
      | "payme"
      | "click"
      | "google"
      | "adliya",
      { title: string; lead: string }
    >;
  };
  login: {
    title: string;
    lead: string;
    titleSignUp: string;
    leadSignUp: string;
    titleReset: string;
    leadReset: string;
    titleOtp: string;
    leadOtp: string;
    titleSetPassword: string;
    leadSetPassword: string;
    email: string;
    identity: string;
    identityHint: string;
    password: string;
    setPassword: string;
    newPassword: string;
    signIn: string;
    signUp: string;
    continue: string;
    google: string;
    otpSent: string;
    otpTestHint: string;
    otpCode: string;
    verifyOtp: string;
    forgotPassword: string;
    resetPassword: string;
    completeRegister: string;
    needDestination: string;
    switchToSignUp: string;
    switchToSignIn: string;
    error: string;
    errors: Record<string, string>;
  };
  checkGate: {
    needLogin: string;
    needCredits: string;
    balance: string;
  };
};

export const uzApp: AppCopy = {
  brand: "Belgi.ai",
  account: "Kabinet",
  admin: "Admin",
  logout: "Chiqish",
  credits: "kredit",
  backToSite: "Saytga",
  nav: {
    overview: "Umumiy",
    newCheck: "Yangi tekshiruv",
    history: "Tarix",
    billing: "Toʻlov",
    profile: "Profil",
    dashboard: "Boshqaruv",
    users: "Foydalanuvchilar",
    payments: "Toʻlovlar",
    plans: "Tariflar",
    checks: "Tekshiruvlar",
    leads: "Murojaatlar",
    registry: "Reestr",
    attorneys: "Patent vakillar",
    ledger: "Ledger",
    notifications: "Bildirishnomalar",
    sessions: "Sessiyalar",
    settings: "Sozlamalar",
    integrations: "Integratsiyalar",
  },
  overview: {
    title: "Kabinet",
    lead: "Balans va soʻnggi tekshiruvlar.",
    balance: "Balans",
    recent: "Soʻnggi tekshiruvlar",
    emptyChecks: "Hali tekshiruv yoʻq.",
    topUp: "Toʻldirish",
    totalChecks: "Tekshiruvlar",
  },
  history: {
    title: "Tekshiruvlar tarixi",
    lead: "Sizning AI hisobotlaringiz.",
    empty: "Tarix boʻsh.",
    query: "Belgi",
    date: "Sana",
    classes: "Sinflar",
  },
  billing: {
    title: "Toʻlov va kreditlar",
    lead: "Har bir tekshiruv — 1 kredit. Payme yoki Click orqali toʻldiring.",
    plans: "Paketlar",
    payPayme: "Payme",
    payClick: "Click",
    payDev: "Sinov toʻlovi",
    notConfigured: "Toʻlov hozircha sozlanmagan. Admin bilan bogʻlaning.",
    ledger: "Harakatlar",
    creditsLabel: "kredit",
    priceLabel: "soʻm",
    resumeHint:
      "Kredit yetarli emas. Toʻldiring — tekshiruv avtomatik davom etadi.",
    continueCheck: "Tekshiruvni davom ettirish",
  },
  profile: {
    title: "Profil",
    lead: "Shaxsiy maʼlumotlar va kirish usullari.",
    name: "Ism",
    email: "Email",
    phone: "Telefon",
    save: "Saqlash",
    saved: "Saqlandi",
    error: "Oʻzgarishlar saqlanmadi",
    providers: "Kirish usullari",
    hasPassword: "Parol oʻrnatilgan",
    noPassword: "Parol oʻrnatilmagan (masalan, faqat Google)",
    linkGoogle: "Google hisobini bogʻlash",
    unlinkGoogle: "Google bogʻlanishini uzish",
    googleUnlinked: "Google hisobi uzildi",
    linkEmail: "Emailni bogʻlash",
    linkPhone: "Telefonni bogʻlash",
    emailPlaceholder: "email@example.com",
    phonePlaceholder: "+998…",
    sendOtp: "Tasdiqlash kodini yuborish",
    linkDone: "Muvaffaqiyatli bogʻlandi",
    cancel: "Bekor qilish",
  },
  adminDash: {
    title: "Boshqaruv paneli",
    lead: "Tizim koʻrsatkichlari.",
    users: "Foydalanuvchilar",
    checksToday: "Bugungi tekshiruvlar",
    revenue: "Toʻlangan (soʻm)",
    failedPayments: "Muvaffaqiyatsiz toʻlovlar",
  },
  adminUsers: {
    title: "Foydalanuvchilar",
    lead: "Rollar va kredit balansini boshqarish.",
    role: "Rol",
    balance: "Balans",
    adjust: "Kredit qoʻshish",
    roleAdmin: "Administrator",
    roleUser: "Foydalanuvchi",
    searchPlaceholder: "Foydalanuvchini qidirish",
    allRoles: "Barcha rollar",
    allStatuses: "Barcha holatlar",
    colUser: "Foydalanuvchi",
    status: "Holat",
    statusActive: "Faol",
    actions: "Amallar",
    shown: "{shown} / {total} foydalanuvchi koʻrsatilgan",
    statTotal: "Jami foydalanuvchilar",
    statActive: "Faol",
    statBalance: "Umumiy balans",
    addUser: "Foydalanuvchi qoʻshish",
    userId: "Foydalanuvchi ID",
  },
  adminPayments: {
    title: "Toʻlovlar",
    lead: "Barcha toʻlovlar.",
  },
  adminPlans: {
    title: "Tariflar",
    lead: "Kredit paketlari.",
  },
  adminChecks: {
    title: "Tekshiruvlar",
    lead: "Barcha hisobotlar.",
  },
  adminLeads: {
    title: "Murojaatlar",
    lead: "Kontakt va advokat soʻrovlari.",
  },
  adminRegistry: {
    title: "Tovar belgilari reestri",
    lead: "Adliya nusxasi — qidiruv va import holati.",
    count: "Yozuvlar",
    importStatus: "Import holati",
    search: "Qidirish",
    searchPlaceholder: "Nom, raqam, egasi…",
    showing: "Koʻrsatilmoqda",
    empty: "Yozuv topilmadi.",
  },
  adminAttorneys: {
    title: "Patent vakillari",
    lead: "Rasmiy roʻyxat (im.adliya.uz) — saytdagi katalog.",
    count: "Jami",
  },
  adminLedger: {
    title: "Kredit harakatlari",
    lead: "Barcha ledger yozuvlari.",
  },
  adminNotifications: {
    title: "Bildirishnomalar",
    lead: "SMS / email / Telegram yuborish logi.",
  },
  adminSessions: {
    title: "Sessiyalar",
    lead: "Foydalanuvchi sessiyalari (BFF cookie).",
    active: "Faol",
    revoked: "Yopilgan",
  },
  adminSettings: {
    title: "Sozlamalar",
    lead: "Infra kalitlari faqat muhitda; integratsiyalar — Admin → Integratsiyalar.",
    envNote:
      "SUPABASE_*, SECRETS_MASTER_KEY, SESSION_SECRET, OTP_PEPPER — faqat env. Eskiz/OpenAI/Payme va boshqalar — /admin/integrations/.",
  },
  adminIntegrations: {
    title: "Integratsiyalar",
    lead: "Tashqi modullar — plitkalarda. Har birini alohida rejimda sozlang.",
    save: "Saqlash",
    test: "Test",
    saved: "Saqlandi",
    configured: "sozlangan",
    missing: "yoʻq",
    enabled: "Yoqilgan",
    disabled: "oʻchirilgan",
    close: "Yopish",
    mode: "Rejim",
    modeLive: "Jangovar",
    modeTest: "Sinov",
    modeSandbox: "Sandbox",
    modeDev: "Dev",
    modeMock: "Mock",
    testOtpHint:
      "Sinov rejimi: toʻgʻri formatdagi telefon yoki email uchun kod doim 00000. Haqiqiy SMS yoki email yuborilmaydi.",
    devPayHint:
      "Dev rejim: toʻlov tugmasi balansni toʻgʻridan-toʻgʻri toʻldiradi, Payme/Click ga yoʻnaltirilmaydi.",
    sandboxPayHint:
      "Payme sandbox (checkout.test.paycom.uz): sinov kalitlarini kiriting.",
    masterKeyNote:
      "Maxfiy qiymatlar SECRETS_MASTER_KEY bilan shifrlangan. Boʻsh maydon — avvalgi qiymat saqlanadi.",
    resetSilent: "Barchasini sinov rejimiga",
    resetSilentDone: "Barcha modullar sinov / mock rejimida",
    catMessaging: "Xabarlar va tasdiqlash kodlari",
    catPayments: "Toʻlovlar",
    catAi: "AI",
    catAuth: "Kirish",
    catData: "Maʼlumotlar",
    modules: {
      eskiz: {
        title: "SMS (Eskiz)",
        lead: "Tasdiqlash kodlari SMS orqali. Sinov: kod 00000.",
      },
      resend: {
        title: "Email (Resend)",
        lead: "Tasdiqlash kodlari va murojaat xabarlari. Sinov: kod 00000.",
      },
      telegram: {
        title: "Telegram",
        lead: "Murojaat bildirishnomalari. Sinov: faqat jurnal.",
      },
      openai: {
        title: "OpenAI",
        lead: "Nice klassifikatsiya. Mock: mahalliy zaxira.",
      },
      payme: {
        title: "Payme",
        lead: "Dev, sandbox yoki jangovar rejim.",
      },
      click: {
        title: "Click",
        lead: "Dev yoki jangovar ekvayring.",
      },
      google: {
        title: "Google",
        lead: "Kirish va hisob bogʻlash.",
      },
      adliya: {
        title: "Adliya IM",
        lead: "Reestr importi. Sinov: token shart emas.",
      },
    },
  },
  login: {
    title: "Kirish",
    lead: "Email yoki telefon va parol bilan kabinetga kiring.",
    titleSignUp: "Roʻyxatdan oʻtish",
    leadSignUp: "Email yoki telefonni tasdiqlang, soʻng parol oʻrnating.",
    titleReset: "Parolni tiklash",
    leadReset: "Tasdiqlash kodidan soʻng yangi parol belgilaysiz.",
    titleOtp: "Kodni tasdiqlash",
    leadOtp: "SMS yoki email orqali yuborilgan kodni kiriting.",
    titleSetPassword: "Parol oʻrnatish",
    leadSetPassword: "Keyingi kirish uchun kamida 6 belgidan iborat parol yarating.",
    email: "Email",
    identity: "Email yoki telefon",
    identityHint: "email@example.com yoki +998…",
    password: "Parol",
    setPassword: "Parol",
    newPassword: "Yangi parol",
    signIn: "Kirish",
    signUp: "Roʻyxatdan oʻtish",
    continue: "Davom etish",
    google: "Google orqali kirish",
    otpSent: "Tasdiqlash kodi yuborildi",
    otpTestHint: "Sinov rejimi: kod — 00000",
    otpCode: "Tasdiqlash kodi",
    verifyOtp: "Kodni tasdiqlash",
    forgotPassword: "Parolni unutdingizmi?",
    resetPassword: "Parolni saqlash",
    completeRegister: "Saqlash va kirish",
    needDestination: "Avval email yoki telefonni kiriting",
    switchToSignUp: "Hisobingiz yoʻqmi? Roʻyxatdan oʻting",
    switchToSignIn: "Allaqachon hisobingiz bormi? Kiring",
    error: "Amalni bajarib boʻlmadi. Qayta urinib koʻring.",
    errors: {
      invalid_credentials: "Email/telefon yoki parol notoʻgʻri",
      invalid_destination: "Email yoki telefon formatini tekshiring",
      invalid_purpose: "Notoʻgʻri soʻrov",
      invalid_json: "Notoʻgʻri soʻrov",
      invalid_ticket: "Kod muddati tugagan. Yangi kod soʻrang",
      otp_invalid: "Tasdiqlash kodi notoʻgʻri",
      otp_expired: "Kod muddati tugagan. Yangi kod soʻrang",
      otp_locked: "Juda koʻp urinish. Birozdan soʻng qayta urinib koʻring",
      otp_not_found: "Avval tasdiqlash kodini soʻrang",
      otp_create_failed: "Kod yuborilmadi. Keyinroq urinib koʻring",
      rate_limited: "Juda tez soʻrovlar. Biroz kuting",
      identity_taken: "Bu email yoki telefon allaqachon band",
      weak_password: "Parol kamida 6 belgidan iborat boʻlsin",
      password_not_set: "Avval parol oʻrnating yoki Google orqali kiring",
      session_failed: "Sessiya ochilmadi. Qayta urinib koʻring",
      unauthorized: "Avtorizatsiya talab qilinadi",
      db_unavailable: "Xizmat vaqtincha mavjud emas",
      service_role_missing:
        "Server sozlanmagan: .env.local ga SUPABASE_SERVICE_ROLE_KEY qoʻying",
      auth_unavailable: "Kirish xizmati sozlanmagan",
      user_not_found: "Foydalanuvchi topilmadi",
      provider_not_configured: "Provayder sozlanmagan",
      provider_taken: "Bu Google hisobi boshqa foydalanuvchiga bogʻlangan",
      email_belongs_other: "Bu email boshqa hisobga tegishli",
      google_email_required: "Google hisobida tasdiqlangan email kerak",
      last_auth_method: "Oxirgi kirish usulini uzib boʻlmaydi",
      OTP_PEPPER_missing: "Server sozlamalari toʻliq emas",
    },
  },
  checkGate: {
    needLogin: "Tekshirish uchun tizimga kiring",
    needCredits: "Kredit yetarli emas — toʻldiring",
    balance: "Balans",
  },
};

export const ruApp: AppCopy = {
  brand: "Belgi.ai",
  account: "Кабинет",
  admin: "Админ",
  logout: "Выйти",
  credits: "кредит",
  backToSite: "На сайт",
  nav: {
    overview: "Обзор",
    newCheck: "Новая проверка",
    history: "История",
    billing: "Оплата",
    profile: "Профиль",
    dashboard: "Дашборд",
    users: "Пользователи",
    payments: "Платежи",
    plans: "Тарифы",
    checks: "Проверки",
    leads: "Заявки",
    registry: "Реестр",
    attorneys: "Патентные поверенные",
    ledger: "Леджер",
    notifications: "Уведомления",
    sessions: "Сессии",
    settings: "Настройки",
    integrations: "Интеграции",
  },
  overview: {
    title: "Кабинет",
    lead: "Баланс и последние проверки.",
    balance: "Баланс",
    recent: "Последние проверки",
    emptyChecks: "Проверок пока нет.",
    topUp: "Пополнить",
    totalChecks: "Проверки",
  },
  history: {
    title: "История проверок",
    lead: "Ваши AI-отчёты.",
    empty: "История пуста.",
    query: "Знак",
    date: "Дата",
    classes: "Классы",
  },
  billing: {
    title: "Оплата и кредиты",
    lead: "Каждая проверка — 1 кредит. Пополнение через Payme или Click.",
    plans: "Пакеты",
    payPayme: "Payme",
    payClick: "Click",
    payDev: "Тестовая оплата",
    notConfigured: "Оплата ещё не настроена. Свяжитесь с администратором.",
    ledger: "Движения",
    creditsLabel: "кредит",
    priceLabel: "сум",
    resumeHint:
      "Недостаточно кредитов. Пополните — проверка продолжится автоматически.",
    continueCheck: "Продолжить проверку",
  },
  profile: {
    title: "Профиль",
    lead: "Личные данные и способы входа.",
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    save: "Сохранить",
    saved: "Сохранено",
    error: "Не удалось сохранить изменения",
    providers: "Способы входа",
    hasPassword: "Пароль задан",
    noPassword: "Пароль не задан (например, только Google)",
    linkGoogle: "Привязать Google",
    unlinkGoogle: "Отвязать Google",
    googleUnlinked: "Google отвязан",
    linkEmail: "Привязать email",
    linkPhone: "Привязать телефон",
    emailPlaceholder: "email@example.com",
    phonePlaceholder: "+998…",
    sendOtp: "Отправить код подтверждения",
    linkDone: "Успешно привязано",
    cancel: "Отмена",
  },
  adminDash: {
    title: "Панель управления",
    lead: "Показатели системы.",
    users: "Пользователи",
    checksToday: "Проверки сегодня",
    revenue: "Оплачено (сум)",
    failedPayments: "Неуспешные платежи",
  },
  adminUsers: {
    title: "Пользователи",
    lead: "Управление ролями и кредитным балансом.",
    role: "Роль",
    balance: "Баланс",
    adjust: "Начислить кредиты",
    roleAdmin: "Администратор",
    roleUser: "Пользователь",
    searchPlaceholder: "Поиск пользователя",
    allRoles: "Все роли",
    allStatuses: "Все статусы",
    colUser: "Пользователь",
    status: "Статус",
    statusActive: "Активен",
    actions: "Действия",
    shown: "Показано {shown} из {total} пользователей",
    statTotal: "Всего пользователей",
    statActive: "Активные",
    statBalance: "Общий баланс",
    addUser: "Добавить пользователя",
    userId: "ID пользователя",
  },
  adminPayments: {
    title: "Платежи",
    lead: "Все платежи.",
  },
  adminPlans: {
    title: "Тарифы",
    lead: "Пакеты кредитов.",
  },
  adminChecks: {
    title: "Проверки",
    lead: "Все отчёты.",
  },
  adminLeads: {
    title: "Заявки",
    lead: "Контакты и запросы к юристам.",
  },
  adminRegistry: {
    title: "Реестр товарных знаков",
    lead: "Копия Adliya — поиск и статус импорта.",
    count: "Записей",
    importStatus: "Статус импорта",
    search: "Искать",
    searchPlaceholder: "Название, номер, владелец…",
    showing: "Показано",
    empty: "Записей не найдено.",
  },
  adminAttorneys: {
    title: "Патентные поверенные",
    lead: "Официальный список (im.adliya.uz) — каталог на сайте.",
    count: "Всего",
  },
  adminLedger: {
    title: "Движения кредитов",
    lead: "Все записи ledger.",
  },
  adminNotifications: {
    title: "Уведомления",
    lead: "Лог SMS / email / Telegram.",
  },
  adminSessions: {
    title: "Сессии",
    lead: "Пользовательские сессии (BFF cookie).",
    active: "Активна",
    revoked: "Закрыта",
  },
  adminSettings: {
    title: "Настройки",
    lead: "Инфра-ключи только в env; интеграции — Admin → Интеграции.",
    envNote:
      "SUPABASE_*, SECRETS_MASTER_KEY, SESSION_SECRET, OTP_PEPPER — только env. Eskiz/OpenAI/Payme и др. — /admin/integrations/.",
  },
  adminIntegrations: {
    title: "Интеграции",
    lead: "Внешние модули — плиткой. У каждого свой режим.",
    save: "Сохранить",
    test: "Тест",
    saved: "Сохранено",
    configured: "настроено",
    missing: "нет",
    enabled: "Включено",
    disabled: "выкл",
    close: "Закрыть",
    mode: "Режим",
    modeLive: "Боевой",
    modeTest: "Тест",
    modeSandbox: "Sandbox",
    modeDev: "Dev",
    modeMock: "Mock",
    testOtpHint:
      "Тестовый режим: для корректного телефона или email код всегда 00000. Реальная отправка не выполняется.",
    devPayHint:
      "Dev-режим: кнопка оплаты сразу пополняет баланс без перехода в Payme/Click.",
    sandboxPayHint:
      "Payme sandbox (checkout.test.paycom.uz): укажите тестовые ключи.",
    masterKeyNote:
      "Секреты шифруются SECRETS_MASTER_KEY. Пустое поле — прежнее значение сохраняется.",
    resetSilent: "Перевести все в тестовый режим",
    resetSilentDone: "Все модули в тестовом / mock-режиме",
    catMessaging: "Сообщения и коды подтверждения",
    catPayments: "Платежи",
    catAi: "AI",
    catAuth: "Вход",
    catData: "Данные",
    modules: {
      eskiz: {
        title: "SMS (Eskiz)",
        lead: "Коды подтверждения по SMS. Тест: код 00000.",
      },
      resend: {
        title: "Email (Resend)",
        lead: "Коды подтверждения и письма по заявкам. Тест: код 00000.",
      },
      telegram: {
        title: "Telegram",
        lead: "Уведомления о заявках. Тест: только журнал.",
      },
      openai: {
        title: "OpenAI",
        lead: "Классификация Nice. Mock: локальный запасной вариант.",
      },
      payme: {
        title: "Payme",
        lead: "Dev, sandbox или боевой режим.",
      },
      click: {
        title: "Click",
        lead: "Dev или боевой эквайринг.",
      },
      google: {
        title: "Google",
        lead: "Вход и привязка аккаунта.",
      },
      adliya: {
        title: "Adliya IM",
        lead: "Импорт реестра. Тест: токен не обязателен.",
      },
    },
  },
  login: {
    title: "Вход",
    lead: "Войдите в кабинет по email или телефону и паролю.",
    titleSignUp: "Регистрация",
    leadSignUp: "Подтвердите email или телефон, затем задайте пароль.",
    titleReset: "Восстановление пароля",
    leadReset: "После кода подтверждения вы зададите новый пароль.",
    titleOtp: "Подтверждение кода",
    leadOtp: "Введите код из SMS или письма.",
    titleSetPassword: "Создание пароля",
    leadSetPassword: "Придумайте пароль не короче 6 символов для следующего входа.",
    email: "Email",
    identity: "Email или телефон",
    identityHint: "email@example.com или +998…",
    password: "Пароль",
    setPassword: "Пароль",
    newPassword: "Новый пароль",
    signIn: "Войти",
    signUp: "Зарегистрироваться",
    continue: "Продолжить",
    google: "Войти через Google",
    otpSent: "Код подтверждения отправлен",
    otpTestHint: "Тестовый режим: код — 00000",
    otpCode: "Код подтверждения",
    verifyOtp: "Подтвердить код",
    forgotPassword: "Забыли пароль?",
    resetPassword: "Сохранить пароль",
    completeRegister: "Сохранить и войти",
    needDestination: "Сначала укажите email или телефон",
    switchToSignUp: "Нет аккаунта? Зарегистрироваться",
    switchToSignIn: "Уже есть аккаунт? Войти",
    error: "Не удалось выполнить действие. Попробуйте ещё раз.",
    errors: {
      invalid_credentials: "Неверный email/телефон или пароль",
      invalid_destination: "Проверьте формат email или телефона",
      invalid_purpose: "Некорректный запрос",
      invalid_json: "Некорректный запрос",
      invalid_ticket: "Срок действия кода истёк. Запросите новый",
      otp_invalid: "Неверный код подтверждения",
      otp_expired: "Срок действия кода истёк. Запросите новый",
      otp_locked: "Слишком много попыток. Попробуйте позже",
      otp_not_found: "Сначала запросите код подтверждения",
      otp_create_failed: "Не удалось отправить код. Попробуйте позже",
      rate_limited: "Слишком частые запросы. Подождите немного",
      identity_taken: "Этот email или телефон уже занят",
      weak_password: "Пароль должен содержать не менее 6 символов",
      password_not_set: "Сначала задайте пароль или войдите через Google",
      session_failed: "Не удалось открыть сессию. Попробуйте ещё раз",
      unauthorized: "Требуется авторизация",
      db_unavailable: "Сервис временно недоступен",
      service_role_missing:
        "Сервер не настроен: добавьте SUPABASE_SERVICE_ROLE_KEY в .env.local",
      auth_unavailable: "Сервис входа не настроен",
      user_not_found: "Пользователь не найден",
      provider_not_configured: "Провайдер не настроен",
      provider_taken: "Этот Google-аккаунт уже привязан к другому пользователю",
      email_belongs_other: "Этот email принадлежит другому аккаунту",
      google_email_required: "Нужен подтверждённый email в Google-аккаунте",
      last_auth_method: "Нельзя отключить последний способ входа",
      OTP_PEPPER_missing: "Сервер настроен не полностью",
    },
  },
  checkGate: {
    needLogin: "Войдите, чтобы проверить знак",
    needCredits: "Недостаточно кредитов — пополните баланс",
    balance: "Баланс",
  },
};

export function getAppCopy(locale: "uz" | "ru"): AppCopy {
  return locale === "ru" ? ruApp : uzApp;
}

export function authErrorMessage(
  copy: AppCopy,
  code?: string | null,
  fallback?: string,
): string {
  if (!code) return fallback ?? copy.login.error;
  return copy.login.errors[code] ?? fallback ?? copy.login.error;
}
