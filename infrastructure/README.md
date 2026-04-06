<div align="center">

# StackScout Infrastructure

**Инфраструктурные конфигурации проекта StackScout**

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-E6522C?logo=prometheus)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?logo=grafana)](https://grafana.com/)

</div>

---

## Содержание

- [Назначение](#назначение)
- [Структура каталогов](#структура-каталогов)
- [Конфигурация](#конфигурация)
- [Связанные файлы](#связанные-файлы)

---

## Назначение

Папка содержит инфраструктурные артефакты проекта:

- bootstrap для сервисов хранения и кэша;
- мониторинг и визуализацию метрик;
- вспомогательные конфиги контейнеров.

---

## Структура каталогов

<div align="center">

| **Путь** | **Назначение** |
|:---|:---|
| `docker/postgres/init.sql` | Инициализация схем и данных PostgreSQL |
| `docker/redis/redis.conf` | Конфигурация Redis (память, persistence) |
| `monitoring/prometheus/prometheus.yml` | Источники сбора метрик Prometheus |
| `monitoring/grafana/provisioning/` | Автоматический provisioning Grafana |
| `monitoring/grafana/dashboards/` | Дашборды Grafana |

</div>

---

## Конфигурация

<div align="center">

| **Сервис** | **Конфиг** | **Что настраивается** |
|:---|:---|:---|
| PostgreSQL | `docker/postgres/init.sql` | Инициализация схем и базовые данные |
| Redis | `docker/redis/redis.conf` | Лимиты памяти и режим persistence |
| Prometheus | `monitoring/prometheus/prometheus.yml` | Источники сбора метрик (scrape targets) |
| Grafana | `monitoring/grafana/provisioning/` | Источники данных и дашборды |

</div>

---

## Связанные файлы

- Основная оркестрация контейнеров: `docker-compose.yml` (корень проекта)
- Dockerfile backend: `Dockerfile` (корень проекта)
- Dockerfile frontend: `frontend/Dockerfile`
- CI workflow: `.github/workflows/ci.yml`
- CD workflow: `.github/workflows/deploy.yml`