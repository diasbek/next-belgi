# Admin UI — atomic layers

Belgi admin screens use DashChrome + AppShell. Do **not** use marketing `sectionTitle` / `sectionLead` on admin routes.

## Layers

| Layer | Path | Examples |
|-------|------|----------|
| Atoms | `src/components/atoms/admin/` | `StatusBadge`, `IconButton`, `Spinner`, `AdminField` |
| Molecules | `src/components/molecules/admin/` | `FilterBar`, `Pagination`, `EmptyState`, `ErrorBanner`, `ConfirmDialog`, `StatGrid` |
| Organisms | `src/components/organisms/admin/` | `AdminDataTable`, `AdminCardList`, `AdminDetailDrawer`, `AdminEntityForm` |
| Templates | `src/components/templates/AdminListPage.tsx` | List chrome: header + filters + panel |

Shared dash primitives: `DashPageHeader`, `DashPanel`, `DashStatCard` in `molecules/DashChrome.tsx`.

## Overlay z-index

- Tab bar: `70`
- Confirm / drawer overlay + panel: `200` (portaled above shell chrome)

## Patterns

1. **List page** → `AdminListPage` + client browser (`Admin*Panel`) with table (md+) / cards (mobile).
2. **Row click** → `AdminDetailDrawer` (desktop side panel, mobile `BottomSheet`).
3. **Destructive** → `ConfirmDialog`.
4. **DB missing** → `ErrorBanner` via `dbUnavailable` on `AdminListPage`.

## Mutations

Admin APIs live under `/api/admin/*` and must call `requireAdminApi()`.

## Registry

Local SoT (`trademarks` uuid PK + `adliya_id`). Sync via `TrademarkRegistryProvider` (`src/lib/registry/`). Admin CRUD + sync at `/admin/registry/`. Checks use `search_trademarks_similar` when no upstream.