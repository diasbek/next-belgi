import type { Locale } from "@/i18n/config";

export type ConclusionMatchCard = {
  id: string;
  name: string;
  owner?: string;
  term?: string;
  status?: string;
  classesText?: string;
  imageUrl?: string;
  similarity?: number;
  note?: string;
};

export type ConclusionInternetItem = {
  title: string;
  url?: string;
  note?: string;
};

export type ConclusionClassVerdict = {
  classNumber: number;
  chanceLabel: string;
  chanceMin: number;
  chanceMax: number;
};

export type ConclusionDocument = {
  docNumber: string;
  locale: Locale;
  issuedAt: string;
  reportAt: string;
  agencyName: string;
  title: string;
  subject: {
    appearance: string;
    mark: string;
    markType: string;
    niceClasses: number[];
  };
  methodology: {
    intro: string;
    excludedTitle: string;
    excluded: string[];
  };
  sections: {
    adliyaTitle: string;
    adliya: ConclusionMatchCard[];
    adliyaEmpty: string;
    madridTitle: string;
    madrid: ConclusionMatchCard[];
    madridEmpty: string;
    internetTitle: string;
    internetSubtitle: string;
    internet: ConclusionInternetItem[];
    internetEmpty: string;
  };
  verdict: {
    title: string;
    lead: string;
    byClass: ConclusionClassVerdict[];
  };
  disclaimer: string;
  verification: {
    code: string;
    url: string;
    label: string;
  };
  preview?: boolean;
};

export type VerifyStatus = "valid" | "not_found" | "revoked";

export type VerifyResponse = {
  ok: boolean;
  status: VerifyStatus;
  subject?: {
    mark: string;
    markType: string;
    niceClasses: number[];
  };
  verdict?: ConclusionClassVerdict[];
  issuedAt?: string;
  reportAt?: string;
  docNumber?: string;
  hashPrefix?: string;
  locale?: Locale;
};
