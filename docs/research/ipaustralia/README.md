# Australian Trade Mark Search API (IP Australia)

Spec snapshot **v1.0.5** from the Anypoint / developer portal packages:

- [`australian-trade-mark-search-api.raml`](./australian-trade-mark-search-api.raml)
- [`openapi-1.0.5.json`](./openapi-1.0.5.json) (fat OAS)
- [`examples/`](./examples/) — quick search request/response + GET trade mark

## Endpoints we use

| Method | Path | Role |
|--------|------|------|
| POST | `/page/advanced` | Preferred — returns `ApiTrademark[]` with details |
| POST | `/search/quick` | Fallback — returns `trademarkIds` only |
| GET | `/trade-mark/{ipRightIdentifier}` | Hydrate quick-search IDs |
| POST | `{host}/public/external-token-api/v1/access_token` | OAuth2 client_credentials |

## Hosts

- Test: `https://test.api.ipaustralia.gov.au/public/australian-trade-mark-search-api/v1`
- Prod: `https://production.api.ipaustralia.gov.au/public/australian-trade-mark-search-api/v1`

Adapter: [`src/lib/check/external/ipaustralia.ts`](../../src/lib/check/external/ipaustralia.ts).
Setup: [`docs/integrations-setup.md`](../integrations-setup.md) § IP Australia.
