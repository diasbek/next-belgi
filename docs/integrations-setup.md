# Настройка интеграций Belgi.ai — пошагово

Админка: `/admin/integrations/`  
Реестр (Adliya sync + Madrid XML): `/admin/registry/`  
Секреты шифруются `SECRETS_MASTER_KEY` (обязателен в env).

## Порядок подключения (рекомендуемый)

1. **Mock/test сначала** — сайт работает без внешних ключей.
2. **Adliya** — национальный реестр UZ (блок «Реестр УЗ» в отчёте).
3. **Madrid XML** — блок WIPO в отчёте (импорт на `/admin/registry/`, не в Integrations).
4. **EUIPO** → **USPTO** → **IP Australia** — доп. страны в проверке (+1 кредит).
5. **Kazpatent** — пока только mock / «источник недоступен».

---

## 0. Общие правила

| Действие | Где |
|----------|-----|
| Режим mock/test/sandbox/live | плитка модуля → «Режим» |
| Ключи | поля в drawer; пустое secret-поле = оставить старое значение |
| Вкл/выкл | чекбокс «Включено» |
| Сброс всех в test/mock | кнопка «Все в тестовый режим» |
| **Demo Mode** | тоггл сверху на `/admin/integrations/` — синтетика по всем юрисдикциям |
| Env fallback | `EUIPO_CLIENT_ID`, `USPTO_API_KEY`, … — только если в БД нет строки |

### Demo Mode (глобальный)

Не путать с per-provider **mock/test**.

| | |
|--|--|
| Флаг | `app_settings.demo_mode.enabled` |
| Что реально | OpenAI chat (live) — придумывает совпадения; Nice classify тоже через OpenAI |
| Что синтетика | Adliya + Madrid **всегда** заполняются выдуманными хитами; EUIPO / USPTO / AU / KZ — тоже (по выбранным юрисдикциям). Живые реестры не вызываются |
| Картинки | локальный SVG wordmark (`data:image/svg+xml`) |
| Кредиты | не списываются |
| EUIPO Pending | не мешает — демо не ходит в EUIPO |

Импорт ключа OpenAI из takleef (один раз):

```bash
# JSON из saas_platform_integrations.llm_gateway.providers.openai
echo '{"api_key":"…","model":"gpt-4.1"}' | npx tsx --env-file=.env.local scripts/import-openai-from-takleef.ts --stdin
```

После live-настройки: проверь на `/account/check/` с выбором нужных юрисдикций.

---

## 1. Adliya IM (реестр Узбекистана)

**Зачем:** поиск по национальным знакам → блок `uz` в отчёте.

### Шаги

1. Открой [im.adliya.uz](https://im.adliya.uz) (или рабочий кабинет API).
2. Войди, в DevTools → Network найди запрос к `api-ip.adliya.uz` → скопируй `Authorization: Bearer …`.
3. `/admin/integrations/` → **Adliya IM**.
4. Режим **Jangovar / Live**.
5. Вставь `access_token`, при необходимости `api_base` (`https://api-ip.adliya.uz`).
6. Сохрани → **Test** (пингует API).
7. Перейди в `/admin/registry/` → **Синхронизация** (подтянуть страницы) или JSON import.

**Test-режим:** токен не обязателен; live-поиск без токена не заработает.

Env (опционально): `ADLIYA_ACCESS_TOKEN`, `ADLIYA_API_BASE`.

---

## 2. Madrid / WIPO (указания UZ)

**Зачем:** блок `wipo` в отчёте из локального SoT (`source=madrid`).

**Важно:** live-скрейп Madrid Monitor запрещён ToS. Только bulk XML/JSON.

### Шаги

1. Получи выгрузку Madrid (WIPO bulk / партнёрский dump) с designations.
2. `/admin/registry/` → **Madrid XML/JSON yuklash**.
3. Загрузи `.xml` / `.json` / `.jsonl` (формат: см. `scripts/fixtures/madrid-sample.json`).
4. Импортёр оставит только designations **UZ**, upsert в `trademarks`.
5. Статус: строка «Madrid holati» на той же странице.

Проверка: поиск знака из fixture → в отчёте блок Madrid не пустой.

---

## 3. EUIPO (Европа)

**Зачем:** юрисдикция `eu` в проверке (Trademark Search). Goods & Services — опционально (Nice terms).

### Шаги

1. Зарегистрируйся на [EUIPO Developer Portal](https://dev.euipo.europa.eu/) (**Production**) и/или [Sandbox](https://dev-sandbox.euipo.europa.eu/) — это **разные** realm’ы и разные client_id/secret.
2. Apps → создай приложение (client credentials / OAuth2).
3. Подпиши app на продукты:
   - [Trademark Search](https://dev.euipo.europa.eu/product/trademark-search_110)
   - [Goods and Services](https://dev.euipo.europa.eu/product/goods-and-services_120) (по желанию)
4. Дождись статуса **Approved** в Apps → Subscriptions.
   - Sandbox: обычно быстрее (до ~недели).
   - Production: нужны документы на `docs.apiplatform@euipo.europa.eu` (паспорт / выписка из реестра) — иначе API даёт **403** при живом токене.
5. `/admin/integrations/` → **EUIPO**.
6. Режим **Sandbox** или **Live** (должен совпадать с порталом, где выпущены ключи).
7. `client_id` + `client_secret` → Сохранить → **Test**.
8. На проверке включи «Европа (EUIPO)» (+1 кредит).

**Mock:** демо-совпадения без ключей.

**Auth (официально):**
- Live token: `https://euipo.europa.eu/cas-server-webapp/oidc/accessToken`
- Sandbox token: `https://auth-sandbox.euipo.europa.eu/oidc/accessToken`
- Каждый вызов API: `Authorization: Bearer …` **и** `X-IBM-Client-Id: <client_id>`
- Поиск: RSQL `query=wordMarkSpecification.verbalElement==*NAME*` (не `markName`)

Env: `EUIPO_CLIENT_ID`, `EUIPO_CLIENT_SECRET` (+ опционально `EUIPO_TOKEN_URL`, `EUIPO_SANDBOX_TOKEN_URL`, `EUIPO_LIVE_BASE`, `EUIPO_SANDBOX_BASE`).

### Если Test: token OK, search 403

Подписка ещё не Approved (или ключи от другого портала). Проверь Subscriptions и письмо с EUIPO; для prod отправь документы. Mock/Sandbox работают без prod-approve.

---

## 4. USPTO (США)

**Зачем:** юрисдикция `us`.

### Шаги

1. Аккаунт на [USPTO developer / API](https://developer.uspto.gov/) (или portal.gov для API key).
2. Выпусти ключ `USPTO-API-KEY` (лимит ~60 req/min на TSDR; поиск — ODP/TM endpoint).
3. `/admin/integrations/` → **USPTO** → режим **Live** → `api_key` → Сохранить.
4. В проверке включи «США (USPTO)».

**Mock:** демо без ключа.  
Env: `USPTO_API_KEY` (+ `USPTO_TM_SEARCH_URL` при смене endpoint).

---

## 5. IP Australia

**Зачем:** юрисдикция `au` — [Australian Trade Mark Search API](https://descriptions.api.gov.au/ipaustralia/trademark-search/iptms.html).  
Локальный спек **v1.0.5**: [`docs/research/ipaustralia/`](research/ipaustralia/).

| Env | Base URL |
|-----|----------|
| Test (UAT) | `https://test.api.ipaustralia.gov.au/public/australian-trade-mark-search-api/v1` |
| Production | `https://production.api.ipaustralia.gov.au/public/australian-trade-mark-search-api/v1` |

OAuth token (client credentials):  
`…/public/external-token-api/v1/access_token` на том же host (test или production).

Адаптер:

1. `POST /page/advanced` — pageable `ApiTrademark[]` (word PART, statuses `PENDING_REGISTERED`)
2. Fallback: `POST /search/quick` → `trademarkIds` → `GET /trade-mark/{id}`

### Шаги

1. [IP Australia Developer Portal](https://portal.api.ipaustralia.gov.au/) — запроси доступ к **Australian Trade Mark Search API**.
2. Выпусти **client_id** + **client_secret** (OAuth client credentials).
3. `/admin/integrations/` → **IP Australia** → **Test** или **Live** → `client_id` / `client_secret` → Сохранить → **Test**.
4. В проверке включи «Австралия» (+1 кредит).

**Mock:** демо без ключей.  
Ключи только через Admin → Integrations (Supabase `integration_secrets`). Env для секретов не используется.  
Override host (не секреты): `IPAUSTRALIA_TEST_BASE`, `IPAUSTRALIA_LIVE_BASE`.

---

## 6. Kazpatent (KZ)

**Статус:** публичного JSON API нет (`docs/research/kazpatent.md`).

В админке только **Mock** → в отчёте «источник недоступен». Не биллить как рабочий live.

---

## 7. Проверка end-to-end

1. Баланс ≥ 1 + N доп. стран.
2. `/account/check/` → бренд + товары → шаг 3 → отметить EU/US/AU.
3. Отчёт: блоки UZ / Madrid / выбранные офисы; при сбое API — «источник недоступен», не падение всего отчёта.
4. PDF: те же блоки в заключении.

---

## Для агента Cursor

При задачах «подключить EUIPO / настроить Adliya / импорт Madrid»:

1. Читай этот файл и `.cursor/rules/integrations-setup.mdc`.
2. Не предлагай скрейп Madrid Monitor / GBD.
3. Ключи — через админку или env; не коммить секреты.
4. После кода — напомни миграцию `20260923190000_multi_jurisdiction_hub.sql` и порядок mock → live.
5. UI шаги дублируются в drawer модуля (`adminIntegrations.modules.*.steps`).
