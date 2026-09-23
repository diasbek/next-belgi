/**
 * Kazpatent (KZ) — research stub.
 *
 * gosreestr.kazpatent.kz exposes a public web registry with IMG/PDF outputs
 * and no documented public REST API for trademark text search. Until a
 * bulk-export or official API appears, live search returns unavailable.
 * See docs/research/kazpatent.md for the decision record.
 */

import { getIntegration } from "@/lib/integrations/store";
import type {
  ExternalSearchOptions,
  ExternalSearchResult,
  ExternalTrademarkSearchProvider,
} from "./types";

export const kazpatentProvider: ExternalTrademarkSearchProvider = {
  id: "kazpatent",
  jurisdiction: "kz",

  async searchSimilar(
    _query: string,
    _options?: ExternalSearchOptions,
  ): Promise<ExternalSearchResult> {
    const payload = await getIntegration("kazpatent");
    if (!payload) {
      return { matches: [], unavailable: true };
    }
    // No public JSON API — always unavailable in live; mock returns empty
    // with unavailable flag so the report shows "source unavailable".
    const mode = String(payload.mode || "mock");
    if (mode === "mock") {
      return {
        matches: [],
        unavailable: true,
        fetchedAt: new Date().toISOString(),
      };
    }
    return { matches: [], unavailable: true };
  },
};
