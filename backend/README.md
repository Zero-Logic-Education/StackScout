<div align="center">

# StackScout Backend

Backend-сервис платформы StackScout на Spring Boot.

[![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)

</div>

---

## Содержание

- [Назначение](#назначение)
- [Границы backend](#границы-backend)
- [Структура модулей](#структура-модулей)
- [Команды backend](#команды-backend)
- [Конфигурация](#конфигурация)
- [Ссылки](#ссылки)

---

## Назначение

Этот модуль отвечает за:

- REST API и доменную бизнес-логику;
- хранение и обработку данных библиотек;
- оценку health score и лицензий;
- интеграцию с PostgreSQL, Redis и RabbitMQ.

Общая информация о проекте, полном запуске и инфраструктуре находится в корневом README.

---

## Границы backend

В модуль backend не входят:

- UI и клиентские страницы (см. frontend);
- docker orchestration проекта в целом (см. infrastructure);
- общий onboarding (см. CONTRIBUTING).

---

## Структура модулей

```text
backend/src/main/java/com/stackscout/
  api/           REST-контроллеры, DTO, обработка ошибок
  domain/        сущности и доменные модели
  service/       бизнес-логика и анализ
  repository/    доступ к данным
  config/        конфигурация Spring
```

---

## Команды backend

```bash
cd backend
./gradlew build
./gradlew bootRun
./gradlew test
./gradlew clean
```

---

## Конфигурация

Ключевые файлы:

- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-dev.yml`
- `backend/src/main/resources/db/migration/*`