import type { Locale } from "@/i18n/config";

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
  workspace: string;
  nav: {
    overview: string;
    newCheck: string;
    history: string;
    billing: string;
    profile: string;
    more: string;
    accountMenu: string;
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
    report: string;
    openReport: string;
    searchPlaceholder: string;
    filterClasses: string;
    filterDates: string;
    allDates: string;
    last7Days: string;
    last30Days: string;
    noClasses: string;
    shownOf: string;
    classesHint: string;
    newCheck: string;
    emptyFilter: string;
  };
  billing: {
    title: string;
    lead: string;
    plans: string;
    choosePackage: string;
    payPackage: string;
    yourBalance: string;
    startCheck: string;
    perCheck: string;
    savings: string;
    selectedPackage: string;
    willCredit: string;
    toPay: string;
    balanceAfter: string;
    paymentMethod: string;
    payAmount: string;
    payPayme: string;
    payClick: string;
    payDev: string;
    notConfigured: string;
    ledger: string;
    colDate: string;
    colOp: string;
    colCredits: string;
    colBalance: string;
    opPurchase: string;
    opCheck: string;
    opRefund: string;
    opAdjust: string;
    ledgerEmpty: string;
    creditsLabel: string;
    creditsOne: string;
    creditsFew: string;
    creditsMany: string;
    priceLabel: string;
    resumeHint: string;
    continueCheck: string;
    payNotice: string;
    debitMoment: string;
    offerLink: string;
    refundLink: string;
    creditsLink: string;
    genericError: string;
    paidSuccess: string;
    plansEmpty: string;
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
    changeEmail: string;
    changePhone: string;
    currentValue: string;
    emptyEmail: string;
    emptyPhone: string;
    newEmail: string;
    newPhone: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    sendOtp: string;
    linkDone: string;
    changeDone: string;
    cancel: string;
    company: string;
    jobTitle: string;
    intent: string;
  };
  onboarding: {
    eyebrow: string;
    title: string;
    lead: string;
    fullName: string;
    fullNamePlaceholder: string;
    company: string;
    companyPlaceholder: string;
    jobTitle: string;
    jobTitlePlaceholder: string;
    intent: string;
    intents: {
      own_brand: string;
      agency: string;
      lawyer: string;
      other: string;
    };
    submit: string;
    required: string;
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
    inviteEmail: string;
    invitePassword: string;
    inviteSubmit: string;
    changeRole: string;
    confirmRole: string;
    confirmRoleLead: string;
    statusUnknown: string;
    company: string;
    jobTitle: string;
    intent: string;
    checks: string;
    lastSeen: string;
    joined: string;
    contact: string;
    onboarding: string;
    onboardingDone: string;
    onboardingPending: string;
    colCompany: string;
    statusInactive: string;
  };
  adminPayments: {
    title: string;
    lead: string;
    colProvider: string;
    colAmount: string;
    colCredits: string;
    colStatus: string;
    colDate: string;
    colUser: string;
    empty: string;
    emptyLead: string;
    detailTitle: string;
    allStatuses: string;
    markReviewed: string;
    reviewed: string;
    copyId: string;
    providerId: string;
    raw: string;
  };
  adminPlans: {
    title: string;
    lead: string;
    colCode: string;
    colCredits: string;
    colPrice: string;
    colActive: string;
    colSort: string;
    empty: string;
    emptyLead: string;
    detailTitle: string;
    create: string;
    save: string;
    active: string;
    inactive: string;
    titleUz: string;
    titleRu: string;
    titleEn: string;
    codeLabel: string;
  };
  adminChecks: {
    title: string;
    lead: string;
    colQuery: string;
    colActivity: string;
    colSource: string;
    colDate: string;
    colUser: string;
    empty: string;
    emptyLead: string;
    detailTitle: string;
    classes: string;
    report: string;
    risk: string;
  };
  adminLeads: {
    title: string;
    lead: string;
    colType: string;
    colStatus: string;
    colContact: string;
    colDate: string;
    empty: string;
    emptyLead: string;
    detailTitle: string;
    saveStatus: string;
    allStatuses: string;
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
    emptyLead: string;
    create: string;
    syncNow: string;
    syncDone: string;
    detailTitle: string;
    colName: string;
    colNumber: string;
    colType: string;
    colClasses: string;
    colStatus: string;
    colOwner: string;
    colApplicant: string;
    colRegNumber: string;
    colSource: string;
    colActive: string;
    allSources: string;
    allActive: string;
    activeOnly: string;
    inactiveOnly: string;
    fetchAdliya: string;
    deactivate: string;
    deactivateConfirm: string;
    deactivateLead: string;
    fieldLocks: string;
    pasteImport: string;
    pasteImportLead: string;
    pasteImportPlaceholder: string;
    pasteImportRun: string;
    pasteImportDone: string;
    pasteImportProgress: string;
    pasteImportInvalid: string;
    pasteImportTruncated: string;
    allStatuses: string;
    colFilingDate: string;
    colRegDate: string;
    colUpdated: string;
    colSynced: string;
    exportCsv: string;
    sortBy: string;
    sortDir: string;
    sortUpdated: string;
    sortFiling: string;
    sortReg: string;
    sortStatus: string;
    sortNumber: string;
    sortName: string;
    sortSynced: string;
    sortAsc: string;
    sortDesc: string;
  };
  adminAttorneys: {
    title: string;
    lead: string;
    count: string;
    staticNote: string;
  };
  adminLedger: {
    title: string;
    lead: string;
    colDelta: string;
    colBalance: string;
    colReason: string;
    colDate: string;
    colUser: string;
    empty: string;
    emptyLead: string;
    allReasons: string;
  };
  adminNotifications: {
    title: string;
    lead: string;
    colProvider: string;
    colKind: string;
    colStatus: string;
    colDest: string;
    colDate: string;
    empty: string;
    emptyLead: string;
    detailTitle: string;
  };
  adminSessions: {
    title: string;
    lead: string;
    active: string;
    revoked: string;
    colUser: string;
    colCreated: string;
    colExpires: string;
    colStatus: string;
    empty: string;
    emptyLead: string;
    revoke: string;
    revokeConfirm: string;
    revokeLead: string;
  };
  adminSettings: {
    title: string;
    lead: string;
    envNote: string;
  };
  adminUi: {
    search: string;
    clearFilters: string;
    shown: string;
    dbUnavailable: string;
    view: string;
    cancel: string;
    confirm: string;
    save: string;
    close: string;
    noResults: string;
    copy: string;
    copied: string;
    loading: string;
    error: string;
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
    acceptTerms: string;
    acceptMarketing: string;
    acceptRequired: string;
    error: string;
    errors: Record<string, string>;
  };
  checkGate: {
    needLogin: string;
    needCredits: string;
    balance: string;
    unlockTitle: string;
    unlockLead: string;
    signIn: string;
    signUp: string;
  };
};

export const uzApp: AppCopy = {
  brand: "Belgi.ai",
  account: "Kabinet",
  admin: "Admin",
  logout: "Chiqish",
  credits: "kredit",
  backToSite: "Saytga",
  workspace: "Ishchi makon",
  nav: {
    overview: "Umumiy",
    newCheck: "Yangi tekshiruv",
    history: "Tekshiruvlar tarixi",
    billing: "Toʻlov va kreditlar",
    profile: "Profil",
    more: "Yana",
    accountMenu: "Hisob",
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
    lead: "Tovar belgilari tahlili saqlangan natijalari.",
    empty: "Tarix boʻsh.",
    query: "Tovar belgisi",
    date: "Tekshiruv sanasi",
    classes: "MKTU sinflari",
    report: "Hisobot",
    openReport: "Hisobotni ochish",
    searchPlaceholder: "Nom boʻyicha qidirish",
    filterClasses: "MKTU sinflari",
    filterDates: "Barcha sanalar",
    allDates: "Barcha sanalar",
    last7Days: "7 kun",
    last30Days: "30 kun",
    noClasses: "Maʼlumot yoʻq",
    shownOf: "Koʻrsatildi {shown} / {total} tekshiruv",
    classesHint:
      "Baʼzi tekshiruvlarda MKTU sinflari koʻrsatilmaydi. Tafsilotlar hisobotda.",
    newCheck: "+ Yangi tekshiruv",
    emptyFilter: "Filtr boʻyicha natija yoʻq.",
  },
  billing: {
    title: "Toʻlov va kreditlar",
    lead: "1 tekshiruv = 1 kredit. Paket va toʻlov usulini tanlang.",
    plans: "Paketlar",
    choosePackage: "Paketni tanlang",
    payPackage: "Paketni toʻlang",
    yourBalance: "Balansingiz",
    startCheck: "Tekshiruvni boshlash",
    perCheck: "{price} soʻm / 1 tekshiruv",
    savings: "Tejam {amount} soʻm",
    selectedPackage: "Tanlangan paket",
    willCredit: "Hisobga qoʻshiladi",
    toPay: "Toʻlovga",
    balanceAfter: "Toʻlovdan keyin balans",
    paymentMethod: "Toʻlov usuli",
    payAmount: "Toʻlash {amount} soʻm",
    payPayme: "Payme",
    payClick: "Click",
    payDev: "Sinov toʻlovi",
    notConfigured: "Toʻlov hozircha sozlanmagan. Admin bilan bogʻlaning.",
    ledger: "Operatsiyalar tarixi",
    colDate: "Sana",
    colOp: "Operatsiya",
    colCredits: "Kreditlar",
    colBalance: "Balans",
    opPurchase: "Toʻldirish",
    opCheck: "Tekshiruv ishga tushirish",
    opRefund: "Qaytarish",
    opAdjust: "Admin tuzatishi",
    ledgerEmpty: "Hali operatsiyalar yoʻq.",
    creditsLabel: "kredit",
    creditsOne: "kredit",
    creditsFew: "kredit",
    creditsMany: "kredit",
    priceLabel: "soʻm",
    resumeHint:
      "Kredit yetarli emas. Toʻldiring — tekshiruv avtomatik davom etadi.",
    continueCheck: "Tekshiruvni davom ettirish",
    payNotice:
      "Toʻlovdan oldin paket, kreditlar soni, narx, yechib olish va qaytarish shartlarini tekshiring.",
    debitMoment:
      "Kredit AI-tekshiruv muvaffaqiyatli ishga tushganda yechib olinadi (odatda 1 kredit).",
    offerLink: "Ommaviy oferta",
    refundLink: "Qaytarish shartlari",
    creditsLink: "Tarif va kreditlar",
    genericError: "Toʻlov amalga oshmadi. Qayta urinib koʻring.",
    paidSuccess: "Toʻlov qabul qilindi. Balans yangilandi.",
    plansEmpty: "Hozircha paketlar yoʻq. Keyinroq qaytib keling.",
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
    linkEmail: "Email qoʻshish",
    linkPhone: "Telefon qoʻshish",
    changeEmail: "Emailni oʻzgartirish",
    changePhone: "Telefonni oʻzgartirish",
    currentValue: "Hozirgi",
    emptyEmail: "Email hali bogʻlanmagan.",
    emptyPhone: "Telefon hali bogʻlanmagan.",
    newEmail: "Yangi email",
    newPhone: "Yangi telefon",
    emailPlaceholder: "email@example.com",
    phonePlaceholder: "+998…",
    sendOtp: "Tasdiqlash kodini yuborish",
    linkDone: "Muvaffaqiyatli bogʻlandi",
    changeDone: "Muvaffaqiyatli oʻzgartirildi",
    cancel: "Bekor qilish",
    company: "Kompaniya",
    jobTitle: "Lavozim",
    intent: "Maqsad",
  },
  
  onboarding: {
    eyebrow: "Boshlash",
    title: "Profilingizni toʻldiring",
    lead: "Bir necha savol — tekshiruvlar va hisobotlar shaxsiylashtiriladi.",
    fullName: "F.I.Sh.",
    fullNamePlaceholder: "Ism Familiya",
    company: "Kompaniya",
    companyPlaceholder: "Kompaniya nomi",
    jobTitle: "Lavozim",
    jobTitlePlaceholder: "Masalan, marketing menejeri",
    intent: "Nima uchun Belgi?",
    intents: {
      own_brand: "Oʻz brendimni himoya qilaman",
      agency: "Agentlik / brending",
      lawyer: "Yurist / patent vakili",
      other: "Boshqa",
    },
    submit: "Davom etish",
    required: "F.I.Sh. va kompaniya majburiy.",
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
    inviteEmail: "Email",
    invitePassword: "Vaqtinchalik parol",
    inviteSubmit: "Yaratish",
    changeRole: "Rolni o‘zgartirish",
    confirmRole: "Rolni o‘zgartirasizmi?",
    confirmRoleLead: "Foydalanuvchi admin huquqlariga ega bo‘ladi yoki yo‘qotadi.",
    statusUnknown: "Noma’lum",
    company: "Kompaniya",
    jobTitle: "Lavozim",
    intent: "Maqsad",
    checks: "Tekshiruvlar",
    lastSeen: "Oxirgi faollik",
    joined: "Roʻyxatdan oʻtgan",
    contact: "Aloqa",
    onboarding: "Onboarding",
    onboardingDone: "Toʻldirilgan",
    onboardingPending: "Kutilmoqda",
    colCompany: "Kompaniya",
    statusInactive: "Nofaol",
  },
  adminPayments: {
    title: "Toʻlovlar",
    lead: "Barcha toʻlovlar.",
    colProvider: "Provayder",
    colAmount: "Summa",
    colCredits: "Kreditlar",
    colStatus: "Holat",
    colDate: "Sana",
    colUser: "Foydalanuvchi",
    empty: "Toʻlovlar yoʻq",
    emptyLead: "Hali toʻlovlar kelmagan.",
    detailTitle: "Toʻlov",
    allStatuses: "Barcha holatlar",
    markReviewed: "Ko‘rib chiqildi",
    reviewed: "Tekshirildi",
    copyId: "ID nusxa",
    providerId: "Provayder ID",
    raw: "Raw / meta",
  },
  adminPlans: {
    title: "Tariflar",
    lead: "Kredit paketlari.",
    colCode: "Kod",
    colCredits: "Kreditlar",
    colPrice: "Narx",
    colActive: "Holat",
    colSort: "Tartib",
    empty: "Tariflar yoʻq",
    emptyLead: "Paket yarating.",
    detailTitle: "Tarif",
    create: "Paket qoʻshish",
    save: "Saqlash",
    active: "Faol",
    inactive: "Oʻchirilgan",
    titleUz: "Sarlavha (uz)",
    titleRu: "Sarlavha (ru)",
    titleEn: "Sarlavha (en)",
    codeLabel: "Kod",
  },
  adminChecks: {
    title: "Tekshiruvlar",
    lead: "Barcha hisobotlar.",
    colQuery: "Belgi",
    colActivity: "Faoliyat",
    colSource: "Manba",
    colDate: "Sana",
    colUser: "Foydalanuvchi",
    empty: "Tekshiruvlar yoʻq",
    emptyLead: "Hali tekshiruvlar yoʻq.",
    detailTitle: "Tekshiruv",
    classes: "MKTU",
    report: "Hisobot",
    risk: "Risk",
  },
  adminLeads: {
    title: "Murojaatlar",
    lead: "Kontakt va advokat soʻrovlari.",
    colType: "Tur",
    colStatus: "Holat",
    colContact: "Kontakt",
    colDate: "Sana",
    empty: "Murojaatlar yoʻq",
    emptyLead: "Hali soʻrovlar yoʻq.",
    detailTitle: "Murojaat",
    saveStatus: "Holatni saqlash",
    allStatuses: "Barcha holatlar",
  },
  adminRegistry: {
    title: "Tovar belgilari reestri",
    lead: "Mahalliy reestr (SoT) — CRUD, sync Adliya, qidiruv.",
    count: "Yozuvlar",
    importStatus: "Import holati",
    search: "Qidirish",
    searchPlaceholder: "Nom, raqam, egasi…",
    showing: "Koʻrsatilmoqda",
    empty: "Yozuv topilmadi.",
    emptyLead: "Yangi yozuv yarating yoki sinkronizatsiyani ishga tushiring.",
    create: "Qoʻshish",
    syncNow: "Sinkronlash",
    syncDone: "Import",
    detailTitle: "Tovar belgisi",
    colName: "Nom",
    colNumber: "Raqam",
    colType: "Tur",
    colClasses: "MKTU",
    colStatus: "Holat",
    colOwner: "Egasi",
    colApplicant: "Ariza beruvchi",
    colRegNumber: "Roʻyxat №",
    colSource: "Manba",
    colActive: "Faol",
    allSources: "Barcha manbalar",
    allActive: "Barchasi",
    activeOnly: "Faol",
    inactiveOnly: "Nofaol",
    fetchAdliya: "Adliyadan yuklash",
    deactivate: "Oʻchirish",
    deactivateConfirm: "Yozuvni nofaol qilish?",
    deactivateLead: "Yumshoq oʻchirish — qidiruvda koʻrinmaydi.",
    fieldLocks: "Sync lock maydonlari",
    pasteImport: "JSON import",
    pasteImportLead:
      "Adliya roʻyxat JSONini joylashtiring yoki .json yuklang (data[]). Bir martada 20 000 yozuvgacha — katta fayllar uchun fayl yuklash tavsiya etiladi.",
    pasteImportPlaceholder: '{ "status": 0, "data": [ … ] }',
    pasteImportRun: "Import qilish",
    pasteImportDone: "Import yakunlandi",
    pasteImportProgress: "Import: {done}/{total}",
    pasteImportInvalid: "JSON yoki data[] topilmadi",
    pasteImportTruncated: "Faqat birinchi 20 000 yozuv import qilinadi",
    allStatuses: "Barcha holatlar",
    colFilingDate: "Topshirish sanasi",
    colRegDate: "Roʻyxatga olish",
    colUpdated: "Yangilangan",
    colSynced: "Sync",
    exportCsv: "CSV",
    sortBy: "Saralash",
    sortDir: "Tartib",
    sortUpdated: "Yangilangan",
    sortFiling: "Topshirish sanasi",
    sortReg: "Roʻyxatga olish sanasi",
    sortStatus: "Holat",
    sortNumber: "Raqam",
    sortName: "Nom",
    sortSynced: "Sync vaqti",
    sortAsc: "Oʻsish",
    sortDesc: "Kamayish",
  },
  adminAttorneys: {
    title: "Patent vakillari",
    lead: "Rasmiy roʻyxat (im.adliya.uz) — saytdagi katalog.",
    count: "Jami",
    staticNote: "Statik katalog — sajtdagi maʼlumotlar bilan bir xil.",
  },
  adminLedger: {
    title: "Kredit harakatlari",
    lead: "Barcha ledger yozuvlari.",
    colDelta: "Delta",
    colBalance: "Balans",
    colReason: "Sabab",
    colDate: "Sana",
    colUser: "Foydalanuvchi",
    empty: "Yozuvlar yoʻq",
    emptyLead: "Hali harakatlar yoʻq.",
    allReasons: "Barcha sabablar",
  },
  adminNotifications: {
    title: "Bildirishnomalar",
    lead: "SMS / email / Telegram yuborish logi.",
    colProvider: "Provayder",
    colKind: "Tur",
    colStatus: "Holat",
    colDest: "Manzil",
    colDate: "Sana",
    empty: "Log boʻsh",
    emptyLead: "Hali yuborishlar yoʻq.",
    detailTitle: "Bildirishnoma",
  },
  adminSessions: {
    title: "Sessiyalar",
    lead: "Foydalanuvchi sessiyalari (BFF cookie).",
    active: "Faol",
    revoked: "Yopilgan",
    colUser: "Foydalanuvchi",
    colCreated: "Yaratilgan",
    colExpires: "Tugash",
    colStatus: "Holat",
    empty: "Sessiyalar yoʻq",
    emptyLead: "Hali sessiyalar yoʻq.",
    revoke: "Yopish",
    revokeConfirm: "Sessiyani yopish?",
    revokeLead: "Foydalanuvchi qayta kirishi kerak boʻladi.",
  },
  adminSettings: {
    title: "Sozlamalar",
    lead: "Infra kalitlari faqat muhitda; integratsiyalar — Admin → Integratsiyalar.",
    envNote:
      "SUPABASE_*, SECRETS_MASTER_KEY, SESSION_SECRET, OTP_PEPPER — faqat env. Eskiz/OpenAI/Payme va boshqalar — /admin/integrations/.",
  },
  adminUi: {
    search: "Qidirish",
    clearFilters: "Tozalash",
    shown: "{from}–{to} / {total}",
    dbUnavailable: "Maʼlumotlar bazasi sozlanmagan.",
    view: "Koʻrish",
    cancel: "Bekor",
    confirm: "Tasdiqlash",
    save: "Saqlash",
    close: "Yopish",
    noResults: "Hech narsa topilmadi",
    copy: "Nusxa",
    copied: "Nusxalandi",
    loading: "Yuklanmoqda…",
    error: "Xatolik yuz berdi",
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
    acceptTerms:
      "Foydalanuvchi kelishuvi (oferta)ni qabul qilaman va Maxfiylik siyosati bilan tanishganimni tasdiqlayman.",
    acceptMarketing:
      "Xizmat yangiliklari va takliflar haqida xabar olishga roziman (ixtiyoriy).",
    acceptRequired: "Davom etish uchun shartlarni qabul qiling",
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
    unlockTitle: "Toʻliq hisobotni oching",
    unlockLead:
      "Bu dastlabki natija. Kirish yoki roʻyxatdan oʻting — toʻliq AI-hisobot va kreditlar kabinetda.",
    signIn: "Kirish",
    signUp: "Roʻyxatdan oʻtish",
  },
};

export const ruApp: AppCopy = {
  brand: "Belgi.ai",
  account: "Кабинет",
  admin: "Админ",
  logout: "Выйти",
  credits: "кредит",
  backToSite: "На сайт",
  workspace: "Рабочее пространство",
  nav: {
    overview: "Обзор",
    newCheck: "Новая проверка",
    history: "История проверок",
    billing: "Оплата и кредиты",
    profile: "Профиль",
    more: "Ещё",
    accountMenu: "Аккаунт",
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
    lead: "Сохранённые результаты анализа товарных знаков.",
    empty: "История пуста.",
    query: "Товарный знак",
    date: "Дата проверки",
    classes: "Классы МКТУ",
    report: "Отчёт",
    openReport: "Открыть отчёт",
    searchPlaceholder: "Поиск по названию",
    filterClasses: "Классы МКТУ",
    filterDates: "Все даты",
    allDates: "Все даты",
    last7Days: "7 дней",
    last30Days: "30 дней",
    noClasses: "Нет данных",
    shownOf: "Показано {shown} из {total} проверок",
    classesHint:
      "Классы МКТУ не отображаются для части проверок. Подробности доступны в отчёте.",
    newCheck: "+ Новая проверка",
    emptyFilter: "По фильтру ничего не найдено.",
  },
  billing: {
    title: "Оплата и кредиты",
    lead: "1 проверка = 1 кредит. Выберите пакет и способ оплаты.",
    plans: "Пакеты",
    choosePackage: "Выберите пакет",
    payPackage: "Оплатите пакет",
    yourBalance: "Ваш баланс",
    startCheck: "Начать проверку",
    perCheck: "{price} сум / 1 проверка",
    savings: "Экономия {amount} сум",
    selectedPackage: "Выбранный пакет",
    willCredit: "Будет зачислено",
    toPay: "К оплате",
    balanceAfter: "Баланс после оплаты",
    paymentMethod: "Способ оплаты",
    payAmount: "Оплатить {amount} сум",
    payPayme: "Payme",
    payClick: "Click",
    payDev: "Тестовая оплата",
    notConfigured: "Оплата ещё не настроена. Свяжитесь с администратором.",
    ledger: "История операций",
    colDate: "Дата",
    colOp: "Операция",
    colCredits: "Кредиты",
    colBalance: "Баланс",
    opPurchase: "Пополнение",
    opCheck: "Запуск проверки",
    opRefund: "Возврат",
    opAdjust: "Корректировка",
    ledgerEmpty: "Операций пока нет.",
    creditsLabel: "кредит",
    creditsOne: "кредит",
    creditsFew: "кредита",
    creditsMany: "кредитов",
    priceLabel: "сум",
    resumeHint:
      "Недостаточно кредитов. Пополните — проверка продолжится автоматически.",
    continueCheck: "Продолжить проверку",
    payNotice:
      "Перед оплатой проверьте тариф, число кредитов, стоимость, момент списания и условия возврата.",
    debitMoment:
      "Кредит списывается при успешном запуске AI-проверки (как правило, 1 кредит).",
    offerLink: "Публичная оферта",
    refundLink: "Условия возврата",
    creditsLink: "Тарифы и кредиты",
    genericError: "Оплата не удалась. Попробуйте ещё раз.",
    paidSuccess: "Оплата принята. Баланс обновлён.",
    plansEmpty: "Пакетов пока нет. Загляните позже.",
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
    linkEmail: "Добавить email",
    linkPhone: "Добавить телефон",
    changeEmail: "Изменить email",
    changePhone: "Изменить телефон",
    currentValue: "Текущий",
    emptyEmail: "Email ещё не привязан.",
    emptyPhone: "Телефон ещё не привязан.",
    newEmail: "Новый email",
    newPhone: "Новый телефон",
    emailPlaceholder: "email@example.com",
    phonePlaceholder: "+998…",
    sendOtp: "Отправить код подтверждения",
    linkDone: "Успешно привязано",
    changeDone: "Успешно изменено",
    cancel: "Отмена",
    company: "Компания",
    jobTitle: "Должность",
    intent: "Цель",
  },
  
  onboarding: {
    eyebrow: "Онбординг",
    title: "Заполните профиль",
    lead: "Несколько вопросов — отчёты и кабинет станут персональнее.",
    fullName: "ФИО",
    fullNamePlaceholder: "Имя Фамилия",
    company: "Компания",
    companyPlaceholder: "Название компании",
    jobTitle: "Должность",
    jobTitlePlaceholder: "Например, маркетолог",
    intent: "Зачем вам Belgi?",
    intents: {
      own_brand: "Защищаю свой бренд",
      agency: "Агентство / брендинг",
      lawyer: "Юрист / патентный поверенный",
      other: "Другое",
    },
    submit: "Продолжить",
    required: "ФИО и компания обязательны.",
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
    inviteEmail: "Email",
    invitePassword: "Временный пароль",
    inviteSubmit: "Создать",
    changeRole: "Сменить роль",
    confirmRole: "Сменить роль?",
    confirmRoleLead: "Пользователь получит или потеряет права администратора.",
    statusUnknown: "Неизвестно",
    company: "Компания",
    jobTitle: "Должность",
    intent: "Цель",
    checks: "Проверки",
    lastSeen: "Был в сети",
    joined: "Регистрация",
    contact: "Контакты",
    onboarding: "Онбординг",
    onboardingDone: "Заполнен",
    onboardingPending: "Не заполнен",
    colCompany: "Компания",
    statusInactive: "Неактивен",
  },
  adminPayments: {
    title: "Платежи",
    lead: "Все платежи.",
    colProvider: "Провайдер",
    colAmount: "Сумма",
    colCredits: "Кредиты",
    colStatus: "Статус",
    colDate: "Дата",
    colUser: "Пользователь",
    empty: "Платежей нет",
    emptyLead: "Пока нет поступлений.",
    detailTitle: "Платёж",
    allStatuses: "Все статусы",
    markReviewed: "Отметить просмотренным",
    reviewed: "Просмотрено",
    copyId: "Копировать ID",
    providerId: "ID провайдера",
    raw: "Raw / meta",
  },
  adminPlans: {
    title: "Тарифы",
    lead: "Пакеты кредитов.",
    colCode: "Код",
    colCredits: "Кредиты",
    colPrice: "Цена",
    colActive: "Статус",
    colSort: "Сорт.",
    empty: "Тарифов нет",
    emptyLead: "Создайте пакет.",
    detailTitle: "Тариф",
    create: "Добавить пакет",
    save: "Сохранить",
    active: "Активен",
    inactive: "Выключен",
    titleUz: "Название (uz)",
    titleRu: "Название (ru)",
    titleEn: "Название (en)",
    codeLabel: "Код",
  },
  adminChecks: {
    title: "Проверки",
    lead: "Все отчёты.",
    colQuery: "Знак",
    colActivity: "Деятельность",
    colSource: "Источник",
    colDate: "Дата",
    colUser: "Пользователь",
    empty: "Проверок нет",
    emptyLead: "Пока нет проверок.",
    detailTitle: "Проверка",
    classes: "МКТУ",
    report: "Отчёт",
    risk: "Риск",
  },
  adminLeads: {
    title: "Заявки",
    lead: "Контакты и запросы к юристам.",
    colType: "Тип",
    colStatus: "Статус",
    colContact: "Контакт",
    colDate: "Дата",
    empty: "Заявок нет",
    emptyLead: "Пока нет обращений.",
    detailTitle: "Заявка",
    saveStatus: "Сохранить статус",
    allStatuses: "Все статусы",
  },
  adminRegistry: {
    title: "Реестр товарных знаков",
    lead: "Локальный реестр (SoT) — CRUD, sync Adliya, поиск.",
    count: "Записей",
    importStatus: "Статус импорта",
    search: "Искать",
    searchPlaceholder: "Название, номер, владелец…",
    showing: "Показано",
    empty: "Записей не найдено.",
    emptyLead: "Создайте запись или запустите синхронизацию.",
    create: "Добавить",
    syncNow: "Синхронизировать",
    syncDone: "Импорт",
    detailTitle: "Товарный знак",
    colName: "Название",
    colNumber: "Номер",
    colType: "Тип",
    colClasses: "МКТУ",
    colStatus: "Статус",
    colOwner: "Владелец",
    colApplicant: "Заявитель",
    colRegNumber: "Рег. №",
    colSource: "Источник",
    colActive: "Активен",
    allSources: "Все источники",
    allActive: "Все",
    activeOnly: "Активные",
    inactiveOnly: "Неактивные",
    fetchAdliya: "Загрузить из Adliya",
    deactivate: "Деактивировать",
    deactivateConfirm: "Деактивировать запись?",
    deactivateLead: "Мягкое удаление — не показывается в поиске.",
    fieldLocks: "Поля, защищённые от sync",
    pasteImport: "Импорт JSON",
    pasteImportLead:
      "Вставьте JSON списка Adliya или загрузите .json (data[]). До 20 000 записей — для больших объёмов лучше файл.",
    pasteImportPlaceholder: '{ "status": 0, "data": [ … ] }',
    pasteImportRun: "Импортировать",
    pasteImportDone: "Импорт завершён",
    pasteImportProgress: "Импорт: {done}/{total}",
    pasteImportInvalid: "Не найден JSON или массив data[]",
    pasteImportTruncated: "Будут импортированы только первые 20 000 записей",
    allStatuses: "Все статусы",
    colFilingDate: "Дата подачи",
    colRegDate: "Дата регистрации",
    colUpdated: "Обновлено",
    colSynced: "Синхронизация",
    exportCsv: "CSV",
    sortBy: "Сортировка",
    sortDir: "Порядок",
    sortUpdated: "По обновлению",
    sortFiling: "По дате подачи",
    sortReg: "По дате регистрации",
    sortStatus: "По статусу",
    sortNumber: "По номеру",
    sortName: "По названию",
    sortSynced: "По sync",
    sortAsc: "По возрастанию",
    sortDesc: "По убыванию",
  },
  adminAttorneys: {
    title: "Патентные поверенные",
    lead: "Официальный список (im.adliya.uz) — каталог на сайте.",
    count: "Всего",
    staticNote: "Статический каталог — совпадает с публичной страницей.",
  },
  adminLedger: {
    title: "Движения кредитов",
    lead: "Все записи ledger.",
    colDelta: "Дельта",
    colBalance: "Баланс",
    colReason: "Причина",
    colDate: "Дата",
    colUser: "Пользователь",
    empty: "Записей нет",
    emptyLead: "Пока нет движений.",
    allReasons: "Все причины",
  },
  adminNotifications: {
    title: "Уведомления",
    lead: "Лог SMS / email / Telegram.",
    colProvider: "Провайдер",
    colKind: "Тип",
    colStatus: "Статус",
    colDest: "Адрес",
    colDate: "Дата",
    empty: "Лог пуст",
    emptyLead: "Пока нет отправок.",
    detailTitle: "Уведомление",
  },
  adminSessions: {
    title: "Сессии",
    lead: "Пользовательские сессии (BFF cookie).",
    active: "Активна",
    revoked: "Закрыта",
    colUser: "Пользователь",
    colCreated: "Создана",
    colExpires: "Истекает",
    colStatus: "Статус",
    empty: "Сессий нет",
    emptyLead: "Пока нет сессий.",
    revoke: "Отозвать",
    revokeConfirm: "Отозвать сессию?",
    revokeLead: "Пользователю нужно будет войти снова.",
  },
  adminSettings: {
    title: "Настройки",
    lead: "Инфра-ключи только в env; интеграции — Admin → Интеграции.",
    envNote:
      "SUPABASE_*, SECRETS_MASTER_KEY, SESSION_SECRET, OTP_PEPPER — только env. Eskiz/OpenAI/Payme и др. — /admin/integrations/.",
  },
  adminUi: {
    search: "Поиск",
    clearFilters: "Сбросить",
    shown: "{from}–{to} / {total}",
    dbUnavailable: "База данных не настроена.",
    view: "Открыть",
    cancel: "Отмена",
    confirm: "Подтвердить",
    save: "Сохранить",
    close: "Закрыть",
    noResults: "Ничего не найдено",
    copy: "Копировать",
    copied: "Скопировано",
    loading: "Загрузка…",
    error: "Произошла ошибка",
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
    acceptTerms:
      "Я принимаю Пользовательское соглашение (оферту) и подтверждаю ознакомление с Политикой конфиденциальности.",
    acceptMarketing:
      "Согласен(на) получать новости и предложения сервиса (необязательно).",
    acceptRequired: "Примите условия, чтобы продолжить",
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
    unlockTitle: "Откройте полный отчёт",
    unlockLead:
      "Это предварительный результат. Войдите или зарегистрируйтесь — полный AI-отчёт и кредиты в кабинете.",
    signIn: "Войти",
    signUp: "Регистрация",
  },
};

export const enApp: AppCopy = {
  brand: "Belgi.ai",
  account: "Account",
  admin: "Admin",
  logout: "Sign out",
  credits: "credit",
  backToSite: "Back to site",
  workspace: "Workspace",
  nav: {
    overview: "Overview",
    newCheck: "New check",
    history: "Check history",
    billing: "Billing & credits",
    profile: "Profile",
    more: "More",
    accountMenu: "Account",
    dashboard: "Dashboard",
    users: "Users",
    payments: "Payments",
    plans: "Plans",
    checks: "Checks",
    leads: "Leads",
    registry: "Registry",
    attorneys: "Patent attorneys",
    ledger: "Ledger",
    notifications: "Notifications",
    sessions: "Sessions",
    settings: "Settings",
    integrations: "Integrations",
  },
  overview: {
    title: "Account",
    lead: "Balance and recent checks.",
    balance: "Balance",
    recent: "Recent checks",
    emptyChecks: "No checks yet.",
    topUp: "Top up",
    totalChecks: "Checks",
  },
  history: {
    title: "Check history",
    lead: "Saved trademark analysis results.",
    empty: "History is empty.",
    query: "Trademark",
    date: "Check date",
    classes: "Nice classes",
    report: "Report",
    openReport: "Open report",
    searchPlaceholder: "Search by name",
    filterClasses: "Nice classes",
    filterDates: "All dates",
    allDates: "All dates",
    last7Days: "7 days",
    last30Days: "30 days",
    noClasses: "No data",
    shownOf: "Showing {shown} of {total} checks",
    classesHint:
      "Nice classes are missing for some checks. Details are available in the report.",
    newCheck: "+ New check",
    emptyFilter: "No checks match these filters.",
  },
  billing: {
    title: "Billing and credits",
    lead: "1 check = 1 credit. Choose a package and payment method.",
    plans: "Packages",
    choosePackage: "Choose a package",
    payPackage: "Pay for the package",
    yourBalance: "Your balance",
    startCheck: "Start a check",
    perCheck: "{price} UZS / 1 check",
    savings: "Save {amount} UZS",
    selectedPackage: "Selected package",
    willCredit: "Will be credited",
    toPay: "Total",
    balanceAfter: "Balance after payment",
    paymentMethod: "Payment method",
    payAmount: "Pay {amount} UZS",
    payPayme: "Payme",
    payClick: "Click",
    payDev: "Test payment",
    notConfigured: "Payments are not configured yet. Contact an administrator.",
    ledger: "Transaction history",
    colDate: "Date",
    colOp: "Operation",
    colCredits: "Credits",
    colBalance: "Balance",
    opPurchase: "Top-up",
    opCheck: "Check run",
    opRefund: "Refund",
    opAdjust: "Adjustment",
    ledgerEmpty: "No transactions yet.",
    creditsLabel: "credit",
    creditsOne: "credit",
    creditsFew: "credits",
    creditsMany: "credits",
    priceLabel: "UZS",
    resumeHint:
      "Not enough credits. Top up — the check will continue automatically.",
    continueCheck: "Continue check",
    payNotice:
      "Before paying, review the plan, credit count, price, debit timing, and refund terms.",
    debitMoment:
      "A credit is deducted when an AI check starts successfully (usually 1 credit).",
    offerLink: "Public offer",
    refundLink: "Refund terms",
    creditsLink: "Plans and credits",
    genericError: "Payment failed. Please try again.",
    paidSuccess: "Payment received. Balance updated.",
    plansEmpty: "No plans available yet. Please check back later.",
  },
  profile: {
    title: "Profile",
    lead: "Personal details and sign-in methods.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    save: "Save",
    saved: "Saved",
    error: "Could not save changes",
    providers: "Sign-in methods",
    hasPassword: "Password set",
    noPassword: "No password (e.g. Google only)",
    linkGoogle: "Link Google",
    unlinkGoogle: "Unlink Google",
    googleUnlinked: "Google unlinked",
    linkEmail: "Add email",
    linkPhone: "Add phone",
    changeEmail: "Change email",
    changePhone: "Change phone",
    currentValue: "Current",
    emptyEmail: "Email is not linked yet.",
    emptyPhone: "Phone is not linked yet.",
    newEmail: "New email",
    newPhone: "New phone",
    emailPlaceholder: "email@example.com",
    phonePlaceholder: "+998…",
    sendOtp: "Send verification code",
    linkDone: "Linked successfully",
    changeDone: "Changed successfully",
    cancel: "Cancel",
    company: "Company",
    jobTitle: "Job title",
    intent: "Intent",
  },
  onboarding: {
    eyebrow: "Get started",
    title: "Complete your profile",
    lead: "A few questions so checks and reports feel personal.",
    fullName: "Full name",
    fullNamePlaceholder: "First Last",
    company: "Company",
    companyPlaceholder: "Company name",
    jobTitle: "Job title",
    jobTitlePlaceholder: "e.g. Marketing manager",
    intent: "Why Belgi?",
    intents: {
      own_brand: "Protecting my own brand",
      agency: "Agency / branding",
      lawyer: "Lawyer / patent attorney",
      other: "Other",
    },
    submit: "Continue",
    required: "Full name and company are required.",
  },
  adminDash: {
    title: "Control panel",
    lead: "System metrics.",
    users: "Users",
    checksToday: "Checks today",
    revenue: "Paid (UZS)",
    failedPayments: "Failed payments",
  },
  adminUsers: {
    title: "Users",
    lead: "Manage roles and credit balances.",
    role: "Role",
    balance: "Balance",
    adjust: "Add credits",
    roleAdmin: "Administrator",
    roleUser: "User",
    searchPlaceholder: "Search users",
    allRoles: "All roles",
    allStatuses: "All statuses",
    colUser: "User",
    status: "Status",
    statusActive: "Active",
    actions: "Actions",
    shown: "Showing {shown} of {total} users",
    statTotal: "Total users",
    statActive: "Active",
    statBalance: "Total balance",
    addUser: "Add user",
    userId: "User ID",
    inviteEmail: "Email",
    invitePassword: "Temporary password",
    inviteSubmit: "Create",
    changeRole: "Change role",
    confirmRole: "Change role?",
    confirmRoleLead: "The user will gain or lose admin access.",
    statusUnknown: "Unknown",
    company: "Company",
    jobTitle: "Job title",
    intent: "Intent",
    checks: "Checks",
    lastSeen: "Last seen",
    joined: "Joined",
    contact: "Contact",
    onboarding: "Onboarding",
    onboardingDone: "Complete",
    onboardingPending: "Pending",
    colCompany: "Company",
    statusInactive: "Inactive",
  },
  adminPayments: {
    title: "Payments",
    lead: "All payments.",
    colProvider: "Provider",
    colAmount: "Amount",
    colCredits: "Credits",
    colStatus: "Status",
    colDate: "Date",
    colUser: "User",
    empty: "No payments",
    emptyLead: "No payments yet.",
    detailTitle: "Payment",
    allStatuses: "All statuses",
    markReviewed: "Mark reviewed",
    reviewed: "Reviewed",
    copyId: "Copy ID",
    providerId: "Provider ID",
    raw: "Raw / meta",
  },
  adminPlans: {
    title: "Plans",
    lead: "Credit packages.",
    colCode: "Code",
    colCredits: "Credits",
    colPrice: "Price",
    colActive: "Status",
    colSort: "Sort",
    empty: "No plans",
    emptyLead: "Create a package.",
    detailTitle: "Plan",
    create: "Add plan",
    save: "Save",
    active: "Active",
    inactive: "Inactive",
    titleUz: "Title (uz)",
    titleRu: "Title (ru)",
    titleEn: "Title (en)",
    codeLabel: "Code",
  },
  adminChecks: {
    title: "Checks",
    lead: "All reports.",
    colQuery: "Mark",
    colActivity: "Activity",
    colSource: "Source",
    colDate: "Date",
    colUser: "User",
    empty: "No checks",
    emptyLead: "No checks yet.",
    detailTitle: "Check",
    classes: "Nice",
    report: "Report",
    risk: "Risk",
  },
  adminLeads: {
    title: "Leads",
    lead: "Contact and lawyer requests.",
    colType: "Type",
    colStatus: "Status",
    colContact: "Contact",
    colDate: "Date",
    empty: "No leads",
    emptyLead: "No requests yet.",
    detailTitle: "Lead",
    saveStatus: "Save status",
    allStatuses: "All statuses",
  },
  adminRegistry: {
    title: "Trademark registry",
    lead: "Local registry (SoT) — CRUD, Adliya sync, search.",
    count: "Records",
    importStatus: "Import status",
    search: "Search",
    searchPlaceholder: "Name, number, owner…",
    showing: "Showing",
    empty: "No records found.",
    emptyLead: "Create a record or run sync.",
    create: "Add",
    syncNow: "Sync now",
    syncDone: "Imported",
    detailTitle: "Trademark",
    colName: "Name",
    colNumber: "Number",
    colType: "Type",
    colClasses: "Nice classes",
    colStatus: "Status",
    colOwner: "Owner",
    colApplicant: "Applicant",
    colRegNumber: "Reg. no.",
    colSource: "Source",
    colActive: "Active",
    allSources: "All sources",
    allActive: "All",
    activeOnly: "Active",
    inactiveOnly: "Inactive",
    fetchAdliya: "Fetch from Adliya",
    deactivate: "Deactivate",
    deactivateConfirm: "Deactivate this record?",
    deactivateLead: "Soft delete — hidden from search.",
    fieldLocks: "Sync-locked fields",
    pasteImport: "Import JSON",
    pasteImportLead:
      "Paste Adliya list JSON or upload a .json file (data[]). Up to 20,000 records — prefer file upload for large dumps.",
    pasteImportPlaceholder: '{ "status": 0, "data": [ … ] }',
    pasteImportRun: "Import",
    pasteImportDone: "Import finished",
    pasteImportProgress: "Import: {done}/{total}",
    pasteImportInvalid: "JSON or data[] not found",
    pasteImportTruncated: "Only the first 20,000 records will be imported",
    allStatuses: "All statuses",
    colFilingDate: "Filing date",
    colRegDate: "Registration date",
    colUpdated: "Updated",
    colSynced: "Synced",
    exportCsv: "CSV",
    sortBy: "Sort by",
    sortDir: "Order",
    sortUpdated: "Updated",
    sortFiling: "Filing date",
    sortReg: "Registration date",
    sortStatus: "Status",
    sortNumber: "Number",
    sortName: "Name",
    sortSynced: "Synced at",
    sortAsc: "Ascending",
    sortDesc: "Descending",
  },
  adminAttorneys: {
    title: "Patent attorneys",
    lead: "Official list (im.adliya.uz) — site catalogue.",
    count: "Total",
    staticNote: "Static catalog — same as the public page.",
  },
  adminLedger: {
    title: "Credit ledger",
    lead: "All ledger entries.",
    colDelta: "Delta",
    colBalance: "Balance",
    colReason: "Reason",
    colDate: "Date",
    colUser: "User",
    empty: "No entries",
    emptyLead: "No movements yet.",
    allReasons: "All reasons",
  },
  adminNotifications: {
    title: "Notifications",
    lead: "SMS / email / Telegram send log.",
    colProvider: "Provider",
    colKind: "Kind",
    colStatus: "Status",
    colDest: "Destination",
    colDate: "Date",
    empty: "Log empty",
    emptyLead: "No sends yet.",
    detailTitle: "Notification",
  },
  adminSessions: {
    title: "Sessions",
    lead: "User sessions (BFF cookie).",
    active: "Active",
    revoked: "Revoked",
    colUser: "User",
    colCreated: "Created",
    colExpires: "Expires",
    colStatus: "Status",
    empty: "No sessions",
    emptyLead: "No sessions yet.",
    revoke: "Revoke",
    revokeConfirm: "Revoke session?",
    revokeLead: "The user will need to sign in again.",
  },
  adminSettings: {
    title: "Settings",
    lead: "Infra keys stay in env; integrations — Admin → Integrations.",
    envNote:
      "SUPABASE_*, SECRETS_MASTER_KEY, SESSION_SECRET, OTP_PEPPER — env only. Eskiz/OpenAI/Payme and others — /admin/integrations/.",
  },
  adminUi: {
    search: "Search",
    clearFilters: "Clear",
    shown: "{from}–{to} / {total}",
    dbUnavailable: "Database is not configured.",
    view: "View",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    close: "Close",
    noResults: "No results",
    copy: "Copy",
    copied: "Copied",
    loading: "Loading…",
    error: "Error",
  },
  adminIntegrations: {
    title: "Integrations",
    lead: "External modules as tiles. Each has its own mode.",
    save: "Save",
    test: "Test",
    saved: "Saved",
    configured: "configured",
    missing: "missing",
    enabled: "Enabled",
    disabled: "off",
    close: "Close",
    mode: "Mode",
    modeLive: "Live",
    modeTest: "Test",
    modeSandbox: "Sandbox",
    modeDev: "Dev",
    modeMock: "Mock",
    testOtpHint:
      "Test mode: for a valid phone or email the code is always 00000. No real SMS or email is sent.",
    devPayHint:
      "Dev mode: the pay button tops up the balance directly without Payme/Click.",
    sandboxPayHint:
      "Payme sandbox (checkout.test.paycom.uz): enter test keys.",
    masterKeyNote:
      "Secrets are encrypted with SECRETS_MASTER_KEY. An empty field keeps the previous value.",
    resetSilent: "Switch all to test mode",
    resetSilentDone: "All modules are in test / mock mode",
    catMessaging: "Messaging and verification codes",
    catPayments: "Payments",
    catAi: "AI",
    catAuth: "Sign-in",
    catData: "Data",
    modules: {
      eskiz: {
        title: "SMS (Eskiz)",
        lead: "Verification codes by SMS. Test: code 00000.",
      },
      resend: {
        title: "Email (Resend)",
        lead: "Verification codes and lead emails. Test: code 00000.",
      },
      telegram: {
        title: "Telegram",
        lead: "Lead notifications. Test: log only.",
      },
      openai: {
        title: "OpenAI",
        lead: "Nice classification. Mock: local fallback.",
      },
      payme: {
        title: "Payme",
        lead: "Dev, sandbox, or live mode.",
      },
      click: {
        title: "Click",
        lead: "Dev or live acquiring.",
      },
      google: {
        title: "Google",
        lead: "Sign-in and account linking.",
      },
      adliya: {
        title: "Adliya IM",
        lead: "Registry import. Test: token optional.",
      },
    },
  },
  login: {
    title: "Sign in",
    lead: "Sign in with email or phone and a password.",
    titleSignUp: "Sign up",
    leadSignUp: "Verify email or phone, then set a password.",
    titleReset: "Reset password",
    leadReset: "After the verification code you will set a new password.",
    titleOtp: "Verify code",
    leadOtp: "Enter the code from SMS or email.",
    titleSetPassword: "Set password",
    leadSetPassword: "Create a password of at least 6 characters for the next sign-in.",
    email: "Email",
    identity: "Email or phone",
    identityHint: "email@example.com or +998…",
    password: "Password",
    setPassword: "Password",
    newPassword: "New password",
    signIn: "Sign in",
    signUp: "Sign up",
    continue: "Continue",
    google: "Continue with Google",
    otpSent: "Verification code sent",
    otpTestHint: "Test mode: code — 00000",
    otpCode: "Verification code",
    verifyOtp: "Verify code",
    forgotPassword: "Forgot password?",
    resetPassword: "Save password",
    completeRegister: "Save and sign in",
    needDestination: "Enter email or phone first",
    switchToSignUp: "No account? Sign up",
    switchToSignIn: "Already have an account? Sign in",
    acceptTerms:
      "I accept the User agreement (offer) and confirm that I have read the Privacy policy.",
    acceptMarketing:
      "I agree to receive product news and offers (optional).",
    acceptRequired: "Accept the terms to continue",
    error: "Could not complete the action. Try again.",
    errors: {
      invalid_credentials: "Incorrect email/phone or password",
      invalid_destination: "Check the email or phone format",
      invalid_purpose: "Invalid request",
      invalid_json: "Invalid request",
      invalid_ticket: "Code expired. Request a new one",
      otp_invalid: "Incorrect verification code",
      otp_expired: "Code expired. Request a new one",
      otp_locked: "Too many attempts. Try again later",
      otp_not_found: "Request a verification code first",
      otp_create_failed: "Could not send the code. Try later",
      rate_limited: "Too many requests. Wait a moment",
      identity_taken: "This email or phone is already in use",
      weak_password: "Password must be at least 6 characters",
      password_not_set: "Set a password first or sign in with Google",
      session_failed: "Could not open a session. Try again",
      unauthorized: "Authorization required",
      db_unavailable: "Service temporarily unavailable",
      service_role_missing:
        "Server not configured: add SUPABASE_SERVICE_ROLE_KEY to .env.local",
      auth_unavailable: "Sign-in service is not configured",
      user_not_found: "User not found",
      provider_not_configured: "Provider is not configured",
      provider_taken: "This Google account is linked to another user",
      email_belongs_other: "This email belongs to another account",
      google_email_required: "A verified Google email is required",
      last_auth_method: "Cannot remove the last sign-in method",
      OTP_PEPPER_missing: "Server configuration is incomplete",
    },
  },
  checkGate: {
    needLogin: "Sign in to check a mark",
    needCredits: "Not enough credits — top up your balance",
    balance: "Balance",
    unlockTitle: "Unlock the full report",
    unlockLead:
      "This is a preview. Sign in or create an account — full AI report and credits live in your cabinet.",
    signIn: "Sign in",
    signUp: "Create account",
  },
};

const appByLocale: Record<Locale, AppCopy> = {
  uz: uzApp,
  ru: ruApp,
  en: enApp,
};

export function getAppCopy(locale: Locale): AppCopy {
  return appByLocale[locale] ?? uzApp;
}

export function authErrorMessage(
  copy: AppCopy,
  code?: string | null,
  fallback?: string,
): string {
  if (!code) return fallback ?? copy.login.error;
  return copy.login.errors[code] ?? fallback ?? copy.login.error;
}
