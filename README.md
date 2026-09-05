# Belgi.ai — AI-проверка товарных знаков

Публичный сайт Belgi.ai на Next.js 16.

## Стек

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Formik + Yup
- Локали: **UZ** (без префикса) и **RU** (`/ru/`)

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

## API проверки

Если задан `BELGI_CHECK_API_URL`, BFF `POST /api/check` проксирует запрос.
Иначе используется типизированный mock-отчёт.
