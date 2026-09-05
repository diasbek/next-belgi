# Belgi.ai — agent notes

Next.js 16 App Router. Prefer docs under `node_modules/next/dist/docs/` when APIs differ.

## Scope

- Public site for AI trademark check in Uzbekistan
- Static TypeScript content (`src/data`, `src/i18n`)
- Locales: `uz` (default, unprefixed) and `ru` (`/ru/`)
- Check API via BFF + env adapter; mock when `BELGI_CHECK_API_URL` is unset
- Account `/account` + Admin `/admin` (RBAC `profiles.role`); credits + Payme/Click

## Product rules

- Reports are informational AI estimates, not legal opinions
- Always show the Ministry of Justice disclaimer on reports
- Final registration advice only via lawyer / agency contact

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
