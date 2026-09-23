# Kazpatent (Kazakhstan) — integration research

**Date:** 2026-09-23  
**Status:** Deferred (no public REST API)  
**Portal:** https://gosreestr.kazpatent.kz/

## Findings

1. **Public registry UI** — gosreestr.kazpatent.kz provides trademark / patent search with results delivered as **IMG/PDF** downloads and HTML pages. There is no documented OpenAPI / JSON search endpoint for third-party commercial use.

2. **WIPO API Catalog** — lists Kazpatent among regional offices but does not expose a Madrid-style public trademark search API for KZ national marks.

3. **Automation risk** — scraping the portal would conflict with typical government ToS and is brittle (captcha / session / PDF-only payloads). Not acceptable for production Belgi.ai.

4. **Bulk data** — no confirmed public bulk dump equivalent to WIPO Madrid XML or Adliya list API was found at research time.

## Decision

| Option | Verdict |
|--------|---------|
| Live REST adapter | **No** — no API |
| HTML/PDF scrape | **No** — ToS + fragility |
| Manual / partner feed | Possible later if Kazpatent or a reseller provides dump |
| Product UI | Show **KZ** as “coming soon / source unavailable” |

## Implementation in this repo

- Integration module `kazpatent` exists in `MODULE_CATALOG` (mock mode only).
- Adapter `src/lib/check/external/kazpatent.ts` always returns `unavailable: true`.
- Coverage page lists KZ as planned / unavailable.

## Revisit when

- Official API or bulk ZIP is published, **or**
- A licensed data partner supplies UZ/KZ overlapping marks.

Until then, keep KZ optional in the jurisdiction selector but never bill live search as working.
