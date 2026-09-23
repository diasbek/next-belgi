import type { JurisdictionCode } from "@/lib/check/jurisdictions";
import { readExternalCache, writeExternalCache } from "./cache";
import { euipoProvider } from "./euipo";
import { ipAustraliaProvider } from "./ipaustralia";
import { kazpatentProvider } from "./kazpatent";
import type {
  ExternalSearchOptions,
  ExternalSearchResult,
  ExternalTrademarkSearchProvider,
} from "./types";
import { usptoProvider } from "./uspto";

const PROVIDERS: ExternalTrademarkSearchProvider[] = [
  euipoProvider,
  usptoProvider,
  ipAustraliaProvider,
  kazpatentProvider,
];

const BY_JURISDICTION = new Map(
  PROVIDERS.map((p) => [p.jurisdiction, p] as const),
);

export function getExternalProvider(
  code: JurisdictionCode,
): ExternalTrademarkSearchProvider | null {
  return BY_JURISDICTION.get(code) ?? null;
}

export function listExternalProviders(): ExternalTrademarkSearchProvider[] {
  return [...PROVIDERS];
}

const DEFAULT_TIMEOUT_MS = Number(
  process.env.EXTERNAL_SEARCH_TIMEOUT_MS || 12_000,
);

/**
 * Search a jurisdiction via its adapter, with cache + timeout.
 * Never throws — returns unavailable on failure.
 */
export async function searchExternalJurisdiction(
  jurisdiction: JurisdictionCode,
  query: string,
  options?: ExternalSearchOptions & { skipCache?: boolean },
): Promise<ExternalSearchResult> {
  const provider = getExternalProvider(jurisdiction);
  if (!provider) {
    return { matches: [], unavailable: true };
  }

  if (!options?.skipCache) {
    const cached = await readExternalCache({
      jurisdiction,
      query,
      niceClasses: options?.niceClasses,
    });
    if (cached) return cached;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const result = await provider.searchSimilar(query, {
      ...options,
      signal: controller.signal,
    });
    await writeExternalCache({
      jurisdiction,
      query,
      niceClasses: options?.niceClasses,
      result,
    });
    return result;
  } catch (e) {
    console.warn(`[external:${jurisdiction}]`, e);
    const result = { matches: [], unavailable: true as const };
    await writeExternalCache({
      jurisdiction,
      query,
      niceClasses: options?.niceClasses,
      result,
      ttlMs: 5 * 60 * 1000,
    });
    return result;
  } finally {
    clearTimeout(timer);
  }
}
