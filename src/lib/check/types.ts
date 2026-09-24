export type RiskTone = "high" | "medium" | "low" | "none";

export interface TrademarkMatch {
  id: string;
  name: string;
  owner?: string;
  registeredFrom?: string;
  registeredTo?: string;
  status?: string;
  similarity: number;
  classesText?: string;
  sourceLabel?: string;
  imageUrl?: string;
}

export interface TrademarkSourceBlock {
  id: string;
  title: string;
  empty?: boolean;
  emptyText?: string;
  matches: TrademarkMatch[];
  /** External office / cache miss — block shown but not treated as "clear" */
  unavailable?: boolean;
  unavailableText?: string;
  /** ISO date when office data was fetched */
  asOf?: string;
  sourceOffice?: string;
}

export interface ClassRisk {
  classNumber: number;
  percent: number;
}

export interface ReportLawyer {
  id: string;
  name: string;
  role: string;
  rating?: number;
  imageUrl?: string;
}

export interface TrademarkReport {
  query: string;
  activity: string;
  markType: string;
  niceClasses: string[];
  sources: TrademarkSourceBlock[];
  conclusion: {
    title: string;
    lead: string;
    positive: boolean;
  };
  classRisks: ClassRisk[];
  recommendations: {
    title: string;
    replaceHint: string;
    alternatives: string[];
  };
  lawyers: ReportLawyer[];
  disclaimer: string;
}

export interface CheckRequest {
  query: string;
  activity: string;
  locale?: string;
  /** Jurisdiction codes: uz always; wipo local; eu/us/au/kz external */
  jurisdictions?: string[];
  niceSelection?: {
    terms: { id?: string; classNumber: number; term: string }[];
    customText?: string;
    classNumbers: number[];
  };
}

export interface CheckResponse {
  ok: boolean;
  report?: TrademarkReport;
  error?: string;
  source?: "upstream" | "mock" | "registry";
  /** Guest teaser — full check requires auth + credit */
  preview?: boolean;
  /** Global admin Demo Mode — synthetic multi-jurisdiction hits */
  demoMode?: boolean;
}
