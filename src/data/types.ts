export interface NavItem {
  label: string;
  href: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  text: string;
  duration: string;
}

export interface AnalysisStep {
  id: string;
  number: number;
  title: string;
}

export interface LawyerCard {
  id: string;
  name: string;
  role: string;
}

export interface SiteCopy {
  meta: {
    homeTitle: string;
    homeDescription: string;
    worksTitle: string;
    worksDescription: string;
    servicesTitle: string;
    servicesDescription: string;
    coverageTitle: string;
    coverageDescription: string;
    contactsTitle: string;
    contactsDescription: string;
    checkTitle: string;
    checkDescription: string;
    checkResultTitle: string;
    checkResultDescription: string;
    loginTitle: string;
    loginDescription: string;
    registerTitle: string;
    registerDescription: string;
    privacyTitle: string;
    privacyDescription: string;
    termsTitle: string;
    termsDescription: string;
    notFoundTitle: string;
  };
  ui: {
    check: string;
    checkTrademark: string;
    login: string;
    menu: string;
    close: string;
    send: string;
    cookieText: string;
    cookieAccept: string;
    cookieDecline: string;
    required: string;
    brandPlaceholder: string;
    activityPlaceholder: string;
    activitySearchHint: string;
    activityCreateLabel: string;
    activityNoOptions: string;
    activityLoading: string;
    affectedClassesTitle: string;
    affectedClassesEmpty: string;
    affectedClassChip: string;
    contactLawyer: string;
    checkFormNote: string;
  };
  nav: NavItem[];
  footer: {
    blurb: string;
    privacy: string;
    terms: string;
    contacts: string;
  };
  home: {
    heroTitle: string;
    heroLead: string;
    heroCta: string;
    sampleCards: Array<{
      name: string;
      category: string;
      risk: string;
      similarity: string;
      tone: "high" | "medium";
    }>;
    features: Array<{ title: string }>;
    checkTitle: string;
    checkLead: string;
    processTitle: string;
    processLead: string;
    processSteps: ProcessStep[];
    analysisTitle: string;
    analysisLead: string;
    analysisSteps: AnalysisStep[];
  };
  works: {
    title: string;
    lead: string;
    empty: string;
  };
  services: {
    title: string;
    lead: string;
    items: Array<{ title: string; text: string }>;
    attorneysTitle: string;
    attorneysLead: string;
    attorneysSource: string;
    attorneysSearch: string;
    attorneysEmpty: string;
    attorneysCount: string;
    attorneysColumns: {
      name: string;
      contacts: string;
      location: string;
      services: string;
    };
  };
  coverage: {
    title: string;
    lead: string;
    disclaimer: string;
    liveLabel: string;
    plannedLabel: string;
    items: Array<{
      title: string;
      text: string;
      status: "live" | "planned";
    }>;
    cta: string;
  };
  contacts: {
    title: string;
    lead: string;
    formTitle: string;
    successTitle: string;
    successText: string;
  };
  check: {
    title: string;
    lead: string;
    searchingTitle: string;
    searchingItems: string[];
    errorTitle: string;
    errorText: string;
    retry: string;
    stepper: {
      title: string;
      stepBrand: string;
      stepGoods: string;
      stepConfirm: string;
      leadBrand: string;
      leadGoods: string;
      leadConfirm: string;
      brandLabel: string;
      selectGoodsTitle: string;
      yourCheck: string;
      change: string;
      selectedCount: string;
      multiHint: string;
      back: string;
      continue: string;
      startCheck: string;
      creditNote: string;
      nextGoodsHint: string;
      nextConfirmHint: string;
      nextRunHint: string;
      niceChip: string;
      confirmGoods: string;
      confirmClasses: string;
      searchResults: string;
      classRow: string;
      jurisdictionsTitle: string;
      jurisdictionsHint: string;
      jurisUz: string;
      jurisWipo: string;
      jurisEu: string;
      jurisUs: string;
      jurisAu: string;
      jurisKz: string;
      creditCost: string;
    };
  };
  report: {
    markTypeLabel: string;
    classesLabel: string;
    registryUz: string;
    wipo: string;
    internet: string;
    similarityLabel: string;
    nameSimilarity: string;
    noMatches: string;
    sourceUnavailable: string;
    asOfPrefix: string;
    conclusionTitle: string;
    conclusionLead: string;
    recommendationsTitle: string;
    replaceHint: string;
    specialistHint: string;
    disclaimer: string;
    lawyersTitle: string;
    registeredPrefix: string;
    classSuffix: string;
    notFoundTitle: string;
    notFoundLead: string;
    loading: string;
  };
  login: {
    title: string;
    lead: string;
    stubNote: string;
  };
  privacy: {
    title: string;
    body: string[];
  };
  terms: {
    title: string;
    body: string[];
  };
  notFound: {
    title: string;
    lead: string;
  };
  formCommon: {
    name: string;
    phone: string;
    email: string;
    message: string;
    consent: string;
    honeypot: string;
  };
}
