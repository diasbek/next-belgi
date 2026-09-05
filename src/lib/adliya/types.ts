/** Adliya IM register API helpers */

export const ADLIYA_API_BASE =
  process.env.ADLIYA_API_BASE?.replace(/\/$/, "") ||
  "https://api-ip.adliya.uz";

export const ADLIYA_LOGO_BASE = `${ADLIYA_API_BASE}/v1/file/application/open-source`;

export function adliyaLogoUrl(logo: string | null | undefined): string | null {
  if (!logo) return null;
  return `${ADLIYA_LOGO_BASE}/${encodeURIComponent(logo)}`;
}

export interface AdliyaMgsClass {
  id: number;
  number: number;
  uz?: string | null;
  ru?: string | null;
}

export interface AdliyaTrademark {
  id: number;
  /** Application / register number used in detail URL, e.g. 202608691 */
  applicationNumber?: number | null;
  number?: string | null;
  date?: string | null;
  registration_number?: string | null;
  registration_date?: string | null;
  expired?: string | null;
  publication_date?: string | null;
  logo?: string | null;
  vienna_classification?: string | null;
  collective?: boolean | null;
  transliteration?: string | null;
  trademark_type?: string | null;
  colors?: string | null;
  applicant?: string | null;
  owner?: string | null;
  owner_address?: string | null;
  applicant_old?: string | null;
  owner_old?: string | null;
  address?: string | null;
  status?: string | null;
  unprotected_element?: string | null;
  mgs_classification?: AdliyaMgsClass[] | null;
}

export interface AdliyaPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last?: boolean;
}

/** Nested list-hit shape from POST /v1/register/public/search */
export interface AdliyaSearchHit {
  PUBLICATION?: {
    publication_date?: Array<string | null> | string | null;
    publication_number?: Array<string | null> | string | null;
  };
  TRADEMARK?: {
    image?: Array<string | null> | string | null;
  };
  MGS_CLASSIFICATION?: {
    number?: Array<string | number | null> | string | number | null;
  };
  APPLICATION?: {
    id?: number | null;
    number?: number | string | null;
    registration_date?: string | null;
    send_date?: string | null;
    expiry_date?: string | null;
    application_status?: string | null;
  };
}
