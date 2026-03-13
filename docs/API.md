<div align="center">

# StackScout API

**Технический справочник по REST API платформы**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539?logo=swagger)](https://swagger.io/specification/)

</div>

---

## Содержание

- [Базовые сведения](#базовые-сведения)
- [Актуальная спецификация](#актуальная-спецификация)
- [Основные группы эндпоинтов](#основные-группы-эндпоинтов)
- [Контракты ответов и ошибок](#контракты-ответов-и-ошибок)

---

## Базовые сведения

<div align="center">

| **Параметр** | **Значение** |
|:---|:---|
| Базовый префикс | `http://localhost:8081/api/v1` |
| Формат запросов/ответов | `application/json` |
| Текущая версия | `v1` |

</div>

---

## Актуальная спецификация

Источником истины для endpoint является runtime-документация backend:

<div align="center">

| **Интерфейс** | **URL** |
|:---|:---|
| Swagger UI | `http://localhost:8081/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8081/v3/api-docs` |

</div>

Если есть расхождения между этим файлом и OpenAPI, приоритет у OpenAPI.

---

## Основные группы эндпоинтов

<div align="center">

| **Группа** | **Назначение** |
|:---|:---|
| `packages` | Каталог библиотек и фильтрация |
| `projects` | Проекты пользователя и зависимости |
| `licenses` | Лицензии и совместимость |
| `health` | Технические проверки сервиса |
| `auth/users` | Аутентификация и пользовательские операции |

</div>

---

## Контракты ответов и ошибок

<div align="center">

| **Ситуация** | **HTTP-код** |
|:---|:---|
| Успешный ответ | `2xx` + JSON |
| Бизнес-ошибка | `4xx` |
| Системная ошибка | `5xx` |
| Пагинация | `content`, `totalElements`, `totalPages`, `currentPage` |

</div>

Пример тела ошибки:

```json
{
  "timestamp": "2026-03-13T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/packages/search"
}
```