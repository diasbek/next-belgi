import type { TrademarkMatch } from "@/lib/check/types";
import type { JurisdictionCode } from "@/lib/check/jurisdictions";

export type ExternalSearchOptions = {
  niceClasses?: number[];
  limit?: number;
  signal?: AbortSignal;
};

export type ExternalSearchResult = {
  matches: TrademarkMatch[];
  unavailable?: boolean;
  fetchedAt?: string;
  fromCache?: boolean;
};

/**
 * Live trademark search against a foreign IP office API.
 * Implementations must never throw for "not found" — return empty matches.
 * Network / auth failures → unavailable: true.
 */
export interface ExternalTrademarkSearchProvider {
  readonly jurisdiction: JurisdictionCode;
  readonly id: string;
  searchSimilar(
    query: string,
    options?: ExternalSearchOptions,
  ): Promise<ExternalSearchResult>;
}
