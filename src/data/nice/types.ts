export type NiceLocale = "uz" | "ru" | "en";

export type NiceKind = "goods" | "services";

export type NiceTerm = {
  id: string;
  classNumber: number;
  kind: NiceKind;
  label: string;
};

export type NiceClassInfo = {
  classNumber: number;
  kind: NiceKind;
  titles: Record<NiceLocale, string>;
};

export type NiceSelectionTerm = {
  id: string;
  classNumber: number;
  term: string;
};

export type NiceSelection = {
  terms: NiceSelectionTerm[];
  customText?: string;
  classNumbers: number[];
};
