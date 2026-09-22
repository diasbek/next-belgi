# Belgi.ai — AI-проверка товарных знаков

Публичный сайт Belgi.ai на Next.js 16.

## Стек

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Formik + Yup
- Supabase (Postgres + Storage)
- Локали: **UZ** (без префикса), **RU** (`/ru/`), **EN** (`/en/`)

## Запуск

```bash
npm install
cp .env.example .env.local
# заполните SUPABASE_SERVICE_ROLE_KEY из Dashboard → API
npm run dev
```

Домен: `https://belgi.nocode.uz/`  
Supabase: [belgi-ai](https://supabase.com/dashboard/project/yfslkvdnnlbbuqriyfcu)

Схема БД: `supabase/migrations/` (`profiles`, `leads`, `trademark_checks`, `otp_challenges`, `notification_log`, `media_assets`).

## Hostinger

Скопируйте переменные из `.env.hostinger.example` в Hostinger → Environment Variables.
Обязательно: `SUPABASE_SERVICE_ROLE_KEY`, `SECRETS_MASTER_KEY`, `SESSION_SECRET`, `OTP_PEPPER`.

Eskiz / Resend / OpenAI / Payme / Click / Google / Telegram — в **Admin → Integrations**, не в env.

В Supabase Auth → URL Configuration:
- Site URL: `https://belgi.nocode.uz`
- Redirect URLs: `https://belgi.nocode.uz/**`

### Деплой архивом (standalone)

Локально собирает Node-standalone и пакует zip/tar.gz:

```bash
npm run build:archive
# → dist/belgi-deploy-YYYYMMDD-HHMMSS.zip
# → dist/belgi-deploy-YYYYMMDD-HHMMSS.tar.gz
```

1. Загрузите zip в корень Node-приложения Hostinger и распакуйте.
2. Пропишите env из `.env.hostinger.example`.
3. Start command: `node server.js` (или `npm start`).

Локали: **UZ** без префикса (`/`), **RU** — `/ru/`, **EN** — `/en/`.

## Импорт / синк реестра (локальный SoT + Adliya)

Локальные таблицы `trademarks` / `trademark_mgs` — **источник правды** для check и admin.  
Adliya (`api-ip.adliya.uz`) — внешний provider для sync (public API сейчас; официальный — позже через `ADLIYA_PROVIDER`).

Логотипы: `https://api-ip.adliya.uz/v1/file/application/open-source/{logoId}`.

1. DevTools → Network → `api-ip.adliya.uz` → скопируйте Bearer в `ADLIYA_ACCESS_TOKEN`
2. Нужен `SUPABASE_SERVICE_ROLE_KEY` (или anon + `BELGI_IMPORT_SECRET`)
3. Примените миграцию `20260922230000_registry_sot_uuid.sql`

```bash
npm run import:trademarks                 # resume sync (pages)
npm run import:trademarks -- --max-pages=2
npm run import:trademarks -- --list-only  # без detail enrich
npm run import:trademarks -- --enrich-only
npm run import:trademarks -- --start-page=10
```

Admin: `/admin/registry/` — CRUD (manual), Sync now, field locks, soft-delete.  
Merge: sync не перезаписывает `source=manual` и поля из `field_locks`.

