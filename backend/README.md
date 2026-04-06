<div align="center">

# StackScout Backend

**Backend-сервис платформы StackScout на Spring Boot**

[![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)

</div>

---

## Содержание

- [Назначение](#назначение)
- [Структура модулей](#структура-модулей)
- [Интеграции источников](#интеграции-источников)
- [Команды backend](#команды-backend)
- [Конфигурация](#конфигурация)

---

## Назначение

Этот модуль отвечает за:

- REST API и доменную бизнес-логику;
- хранение и обработку данных библиотек;
- оценку health score и лицензий;
- интеграцию с PostgreSQL, Redis и RabbitMQ.

---

## Структура модулей

<div align="center">

| **Пакет** | **Назначение** |
|:---|:---|
| `controller/` | REST-контроллеры и маппинг маршрутов |
| `dto/` | Объекты передачи данных (Request / Response) |
| `exception/` | Глобальная обработка ошибок |
| `mapper/` | Конвертация между сущностями и DTO |
| `messaging/` | Продюсеры и консьюмеры RabbitMQ |
| `model/` | JPA-сущности и доменные модели |
| `repository/` | Доступ к данным (Spring Data JPA) |
| `scheduler/` | Планировщики фоновых задач |
| `service/` | Бизнес-логика и анализ |
| `config/` | Конфигурация Spring-компонентов |
| `util/` | Вспомогательные утилиты |

</div>

---

## Интеграции источников

Backend поддерживает адаптеры источников для:

- PyPI, npm, Maven Central, NuGet
- Docker Hub
- GitHub и GitLab
- NVD, OSV и GitHub Security Advisories

---

## Команды backend

```bash
# Перейти в директорию backend
cd backend

# Сборка проекта
./gradlew build

# Запуск в режиме разработки
./gradlew bootRun

# Запуск тестов
./gradlew test

# Сборка без тестов
./gradlew build -x test

# Очистка артефактов сборки
./gradlew clean
```

---

## Конфигурация

<div align="center">

| **Файл** | **Назначение** |
|:---|:---|
| `src/main/resources/application.yml` | Основная конфигурация приложения |
| `src/main/resources/application-dev.yml` | Конфигурация для профиля `dev` |
| `src/main/resources/application.yml.example` | Пример конфигурации с описанием переменных |
| `src/main/resources/db/migration/` | Flyway-миграции базы данных |
| `src/main/resources/static/` | Статические ресурсы backend |

</div>