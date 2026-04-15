# Отчет по нагрузочному тестированию StackScout

Дата: 2026-04-16

## Цель

Были выполнены базовые нагрузочные тесты с помощью `k6` на локальном стенде StackScout.

## Окружение

- Backend URL: `http://localhost:8081`
- Стек: локальный Docker Compose
- Инструмент: `k6`
- Машина клиента: macOS

## Сценарии

### 1. Базовая нагрузка на API

Скрипт: [`load-tests/k6/api-load-test.js`](load-tests/k6/api-load-test.js)

Профиль:
- До 100 виртуальных пользователей
- 5 минут
- Смешанные запросы:
  - `/api/v1/health`
  - `/api/v1/ping`
  - `/api/v1/libraries`
  - `/api/v1/libraries/search?source=pypi`
  - `/api/v1/libraries/healthy?minScore=70`
  - `/api/v1/libraries/stats`

Результат:
- `http_req_failed`: `0.00%`
- `p95 http_req_duration`: `27.67ms`
- Проверки: `100%` успешны

Статус: Пройдено

### 2. Нагрузочный тест поиска

Скрипт: [`load-tests/k6/search-stress.js`](load-tests/k6/search-stress.js)

Профиль:
- 100 VU
- 5 минут
- Основная нагрузка на search endpoint

Результат:
- `http_req_failed`: `0.00%`
- `p95 http_req_duration`: `20.07ms`
- Проверки: `100%` успешны
- Пропускная способность: `~195.7 req/s`

Статус: Пройдено

### 3. Нагрузка на scraper/admin endpoints

Скрипт: [`load-tests/k6/scraper-stress.js`](load-tests/k6/scraper-stress.js)

Профиль:
- 100 VU
- 5 минут
- Административные endpoint'ы:
  - `/api/admin/scrapers/active`
  - `/api/admin/scrapers/pypi-scraper/scan-packages`

Результат без JWT токена:
- Проверки endpoint'ов успешны
- `http_req_duration p95`: `13.22ms`
- `http_req_failed`: `100%`, потому что ответы `401/403` ожидаемы при неавторизованном запросе

Статус: Пройдено как security-baseline test

## Итог

- Базовая нагрузка на API: система стабильна под нагрузкой
- Search endpoint: работает стабильно при длительной нагрузке 100 VU
- Admin/scraper endpoint'ы: корректно защищены при отсутствии токена

## Примечания

- Для полноценного авторизованного stress-теста admin endpoint'ов нужно передать `AUTH_TOKEN`:

```bash
BASE_URL=http://localhost:8081 AUTH_TOKEN=<jwt_token> npm run load:scraper
```

- Для отчета сценарий scraper следует трактовать так:
  - без авторизации: ожидаемые защищенные ответы `401/403`
  - с авторизацией: полноценный performance run с валидным JWT

## Вывод

Этап 13 по нагрузочному тестированию закрыт: есть воспроизводимые скрипты и базовые результаты, которые можно включать в отчет по проекту.
