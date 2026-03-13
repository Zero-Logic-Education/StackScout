<div align="center">

# StackScout API

Технический справочник по REST API платформы.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539?logo=swagger)](https://swagger.io/specification/)

</div>

---

## Содержание

- [Базовые сведения](#базовые-сведения)
- [Актуальная спецификация](#актуальная-спецификация)
- [Основные группы эндпоинтов](#основные-группы-эндпоинтов)
- [Контракты ответов и ошибок](#контракты-ответов-и-ошибок)
- [Версионирование](#версионирование)
- [Ссылки](#ссылки)

---

## Базовые сведения

- Базовый префикс API: `http://localhost:8081/api/v1`
- Формат запросов/ответов: `application/json`
- Основная версия: `v1`

Документ описывает API на уровне контракта. Пошаговые примеры вынесены в Postman-коллекцию.

---

## Актуальная спецификация

Источником истины для endpoint является runtime-документация backend:

- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`

Если есть расхождения между этим файлом и OpenAPI, приоритет у OpenAPI.

---

## Основные группы эндпоинтов

- `packages`: каталог библиотек и фильтрация;
- `projects`: проекты пользователя и зависимости;
- `licenses`: лицензии и совместимость;
- `health`: технические проверки сервиса;
- `auth/users` (если включено): аутентификация и пользовательские операции.

Полные примеры: [Postman README](./Postman/README.md).

---

## Контракты ответов и ошибок

Ожидаемые принципы:

- успешные ответы возвращают JSON и HTTP 2xx;
- бизнес-ошибки возвращают HTTP 4xx;
- системные ошибки возвращают HTTP 5xx;
- пагинация использует `content`, `totalElements`, `totalPages`, `currentPage`.

Пример ошибки:

```json
{
  "timestamp": "2026-03-13T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/packages/search"
}
```

---

## Версионирование

- Неломающие изменения в `v1` добавляются без смены префикса.
- Ломающие изменения требуют новой версии API.
- Deprecated endpoint сопровождаются периодом миграции.

---

## Ссылки

- [Root README](../README.md)
- [Postman Collection](./Postman/README.md)
- [Architecture](./ARCHITECTURE.md)
- [Database](./DATABASE.md)
