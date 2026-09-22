/** Shared registry domain types (local SoT). */

export type RegistrySource = "adliya" | "manual" | "seed";

export type RegistryTrademark = {
  id: string;
  adliya_id: number | null;
  number: string | null;
  application_date: string | null;
  registration_number: string | null;
  registration_date: string | null;
  expired: string | null;
  publication_date: string | null;
  logo: string | null;
  vienna_classification: string | null;
  collective: boolean;
  transliteration: string | null;
  trademark_type: string | null;
  colors: string | null;
  applicant: string | null;
  owner: string | null;
  owner_address: string | null;
  applicant_old: string | null;
  owner_old: string | null;
  address: string | null;
  status: string | null;
  unprotected_element: string | null;
  raw: Record<string, unknown>;
  source: RegistrySource;
  active: boolean;
  field_locks: string[];
  synced_at: string | null;
  created_by: string | null;
  imported_at: string;
  updated_at: string;
};

export type RegistryMgs = {
  id: string;
  adliya_mgs_id: number | null;
  trademark_id: string;
  class_number: number;
  text_uz: string | null;
  text_ru: string | null;
};

export type RegistryListPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last?: boolean;
};

/** Normalized detail from any Adliya provider */
export type RegistryRemoteTrademark = {
  adliyaId: number;
  applicationNumber: number | null;
  number: string | null;
  date: string | null;
  registration_number: string | null;
  registration_date: string | null;
  expired: string | null;
  publication_date: string | null;
  logo: string | null;
  vienna_classification: string | null;
  collective: boolean;
  transliteration: string | null;
  trademark_type: string | null;
  colors: string | null;
  applicant: string | null;
  owner: string | null;
  owner_address: string | null;
  applicant_old: string | null;
  owner_old: string | null;
  address: string | null;
  status: string | null;
  unprotected_element: string | null;
  mgs: Array<{
    adliyaMgsId: number | null;
    classNumber: number;
    textUz: string | null;
    textRu: string | null;
  }>;
  raw: Record<string, unknown>;
};

export interface TrademarkRegistryProvider {
  readonly name: string;
  listPage(params: {
    page: number;
    size: number;
  }): Promise<RegistryListPage<RegistryRemoteTrademark>>;
  getDetail(
    applicationNumber: string | number,
  ): Promise<RegistryRemoteTrademark | null>;
  logoUrl(logoId: string | null | undefined): string | null;
}
