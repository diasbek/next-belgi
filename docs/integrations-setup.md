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
| Env fallback | `EUIPO_CLIENT_ID`, `USPTO_API_KEY`, … — только если в БД нет строки |

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

**Зачем:** юрисдикция `eu` в проверке.

### Шаги

1. Зарегистрируйся на [EUIPO Developer Portal](https://dev.euipo.europa.eu/) (или актуальный portal на developer.euipo.europa.eu).
2. Создай приложение **client credentials** (OAuth2).
3. Подпишись на **Trademark Search API** (sandbox → после approve production). Одобрение может занять ~неделю.
4. `/admin/integrations/` → **EUIPO**.
5. Режим **Sandbox** (разработка) или **Live**.
6. `client_id` + `client_secret` → Сохранить.
7. На проверке включи «Европа (EUIPO)» (+1 кредит).

**Mock:** демо-совпадения без ключей.  
Env: `EUIPO_CLIENT_ID`, `EUIPO_CLIENT_SECRET` (+ опционально `EUIPO_SANDBOX_BASE`, `EUIPO_TOKEN_URL`).

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

**Зачем:** юрисдикция `au`.

### Шаги

1. [IP Australia API portal](https://www.ipaustralia.gov.au/) / developer registration для Trade Mark Search API.
2. Получи API key (если портал требует).
3. `/admin/integrations/` → **IP Australia** → **Live** → `api_key` → Сохранить.
4. В проверке включи «Австралия».

**Mock:** демо.  
Env: `IPAUSTRALIA_API_KEY`, `IPAUSTRALIA_BASE`.

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
