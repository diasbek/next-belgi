import type {
  AdliyaPage,
  AdliyaSearchHit,
  AdliyaTrademark,
} from "@/lib/adliya/types";
import {
  ADLIYA_API_BASE,
  ADLIYA_LOGO_BASE,
  adliyaLogoUrl,
} from "@/lib/adliya/types";
import { mapSearchHit } from "@/lib/adliya/client";
import type {
  RegistryListPage,
  RegistryRemoteTrademark,
  TrademarkRegistryProvider,
} from "./types";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function authHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Origin: "https://im.adliya.uz",
    Referer: "https://im.adliya.uz/",
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  };
}

function unwrapData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null;
  return (value as T) ?? null;
}

function normalizePage(raw: unknown): AdliyaPage<AdliyaTrademark> {
  const root =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const payload = "data" in root ? root.data : raw;

  let content: AdliyaTrademark[] = [];
  if (Array.isArray(payload)) {
    content = payload.map((item) =>
      item && typeof item === "object" && "APPLICATION" in item
        ? mapSearchHit(item as AdliyaSearchHit)
        : (item as AdliyaTrademark),
    );
  }

  content = content.filter((tm) => typeof tm.id === "number" && tm.id > 0);

  const totalElements = Number(
    root.total_count ?? root.totalElements ?? content.length,
  );
  const size = Number(root.size ?? content.length ?? 100) || 100;
  const totalPages = Number(
    root.total_pages ??
      root.totalPages ??
      Math.max(1, Math.ceil(totalElements / size)),
  );
  const number = Number(root.page ?? root.number ?? 0);

  return {
    content,
    totalElements,
    totalPages,
    number,
    size,
    last: Boolean(root.last ?? number + 1 >= totalPages),
  };
}

export function mapAdliyaToRemote(tm: AdliyaTrademark): RegistryRemoteTrademark {
  return {
    adliyaId: tm.id,
    applicationNumber: tm.applicationNumber ?? null,
    number: tm.number ?? null,
    date: tm.date ?? null,
    registration_number: tm.registration_number ?? null,
    registration_date: tm.registration_date ?? null,
    expired: tm.expired ?? null,
    publication_date: tm.publication_date ?? null,
    logo: tm.logo ?? null,
    vienna_classification: tm.vienna_classification ?? null,
    collective: Boolean(tm.collective),
    transliteration: tm.transliteration ?? null,
    trademark_type: tm.trademark_type ?? null,
    colors: tm.colors ?? null,
    applicant: tm.applicant ?? null,
    owner: tm.owner ?? null,
    owner_address: tm.owner_address ?? null,
    applicant_old: tm.applicant_old ?? null,
    owner_old: tm.owner_old ?? null,
    address: tm.address ?? null,
    status: tm.status ?? null,
    unprotected_element: tm.unprotected_element ?? null,
    mgs: (tm.mgs_classification || [])
      .filter((m) => Number(m.number) >= 1 && Number(m.number) <= 45)
      .map((m) => ({
        adliyaMgsId: typeof m.id === "number" ? m.id : null,
        classNumber: Number(m.number),
        textUz: m.uz ?? null,
        textRu: m.ru ?? null,
      })),
    raw: tm as unknown as Record<string, unknown>,
  };
}

/**
 * Public Adliya register API.
 * Uses token directly — does not depend on Integrations silent/test mode.
 */
export class AdliyaPublicProvider implements TrademarkRegistryProvider {
  readonly name = "adliya_public";
  private readonly apiBase: string;
  private readonly token: string;

  constructor(opts?: { token?: string; apiBase?: string }) {
    const token =
      opts?.token?.trim() || process.env.ADLIYA_ACCESS_TOKEN?.trim() || "";
    if (!token) {
      throw new Error("adliya_token_missing");
    }
    this.token = token;
    this.apiBase = (
      opts?.apiBase ||
      process.env.ADLIYA_API_BASE ||
      ADLIYA_API_BASE
    ).replace(/\/$/, "");
  }

  logoUrl(logoId: string | null | undefined): string | null {
    return adliyaLogoUrl(logoId) || null;
  }

  private async fetch(path: string, init?: RequestInit): Promise<Response> {
    const url = path.startsWith("http") ? path : `${this.apiBase}${path}`;
    return fetch(url, {
      ...init,
      headers: {
        ...authHeaders(this.token),
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  }

  async listPage(params: {
    page: number;
    size: number;
  }): Promise<RegistryListPage<RegistryRemoteTrademark>> {
    const size = params.size;
    const path = `/v1/register/public/search?objectType=TRADEMARK&page=${params.page}&size=${size}`;
    let lastStatus = 0;
    for (let attempt = 0; attempt <= 8; attempt++) {
      const res = await this.fetch(path, {
        method: "POST",
        body: JSON.stringify({ page: params.page, size }),
      });
      lastStatus = res.status;
      if (res.ok) {
        const page = normalizePage(await res.json());
        return {
          content: page.content.map(mapAdliyaToRemote),
          totalElements: page.totalElements,
          totalPages: page.totalPages,
          number: page.number,
          size: page.size,
          last: page.last,
        };
      }
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get("retry-after") || 0);
        await sleep(
          Math.max(retryAfter * 1000, Math.min(60_000, 1500 * 2 ** attempt)),
        );
        continue;
      }
      throw new Error(`adliya_search_${res.status}:${await res.text()}`);
    }
    throw new Error(`adliya_search_${lastStatus}_exhausted`);
  }

  async getDetail(
    applicationNumber: string | number,
  ): Promise<RegistryRemoteTrademark | null> {
    const num = String(applicationNumber).replace(/\D/g, "");
    if (!num) return null;
    const path = `/v1/register/public/search/${num}?objectType=TRADEMARK`;
    let lastStatus = 0;
    for (let attempt = 0; attempt <= 6; attempt++) {
      const res = await this.fetch(path, { method: "GET" });
      lastStatus = res.status;
      if (res.ok) {
        const data = unwrapData<AdliyaTrademark>(await res.json());
        if (!data || typeof data.id !== "number") return null;
        return mapAdliyaToRemote({
          ...data,
          applicationNumber: Number(num),
        });
      }
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        await sleep(Math.min(30_000, 800 * 2 ** attempt));
        continue;
      }
      throw new Error(`adliya_detail_${res.status}:${path}`);
    }
    throw new Error(`adliya_detail_${lastStatus}_exhausted`);
  }
}

/** Placeholder for future official Adliya partnership API. */
export class AdliyaOfficialProvider implements TrademarkRegistryProvider {
  readonly name = "adliya_official";

  logoUrl(logoId: string | null | undefined): string | null {
    if (!logoId) return null;
    if (logoId.startsWith("http")) return logoId;
    return `${ADLIYA_LOGO_BASE}/${encodeURIComponent(logoId)}`;
  }

  async listPage(): Promise<RegistryListPage<RegistryRemoteTrademark>> {
    throw new Error("adliya_official_not_configured");
  }

  async getDetail(): Promise<RegistryRemoteTrademark | null> {
    throw new Error("adliya_official_not_configured");
  }
}

export function createRegistryProvider(opts?: {
  token?: string;
  apiBase?: string;
}): TrademarkRegistryProvider {
  const kind = (process.env.ADLIYA_PROVIDER || "public").toLowerCase();
  if (kind === "official") {
    return new AdliyaOfficialProvider();
  }
  return new AdliyaPublicProvider(opts);
}

export { adliyaLogoUrl, ADLIYA_LOGO_BASE };
