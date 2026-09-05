# Belgi.ai — AI-проверка товарных знаков

Публичный сайт Belgi.ai на Next.js 16.

## Стек

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Formik + Yup
- Supabase (Postgres + Storage)
- Локали: **UZ** (без префикса) и **RU** (`/ru/`)

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

## Импорт реестра товарных знаков (Adliya)

Источник: `https://im.adliya.uz/register/TRADEMARK` (~110 111 записей).  
Логотипы: `https://api-ip.adliya.uz/v1/file/application/open-source/{logoId}` (без авторизации).

API списка/деталей требует Bearer-токен (иначе 401). После входа на portal:

1. DevTools → Network → любой запрос к `api-ip.adliya.uz`
2. Скопируйте `Authorization: Bearer …` в `.env.local` как `ADLIYA_ACCESS_TOKEN`
3. Нужен также `SUPABASE_SERVICE_ROLE_KEY`

```bash
npm install
npm run import:trademarks                 # полный импорт (резюмируется)
npm run import:trademarks -- --max-pages=2
npm run import:trademarks -- --reset      # очистить и начать заново
```

Таблицы: `trademarks`, `trademark_mgs`, `trademark_import_state`.

