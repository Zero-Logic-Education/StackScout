<div align="center">

# StackScout Infrastructure

Инфраструктурные конфигурации проекта.

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-E6522C?logo=prometheus)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?logo=grafana)](https://grafana.com/)

</div>

---

## Содержание

- [Назначение](#назначение)
- [Структура каталогов](#структура-каталогов)
- [Что настраивается здесь](#что-настраивается-здесь)
- [Правила изменения инфраструктуры](#правила-изменения-инфраструктуры)
- [Ссылки](#ссылки)

---

## Назначение

Папка содержит инфраструктурные артефакты проекта:

- bootstrap для сервисов хранения и кэша;
- мониторинг и визуализацию метрик;
- вспомогательные конфиги контейнеров.

Общие команды запуска и остановки описаны в корневом README.

---

## Структура каталогов

```text
infrastructure/
  docker/
    postgres/init.sql
    redis/redis.conf
  monitoring/
    prometheus/prometheus.yml
    grafana/
      dashboards/
      provisioning/
```

---

## Что настраивается здесь

- PostgreSQL: инициализация схем и базовые данные.
- Redis: лимиты памяти и поведение persistence.
- Prometheus: источники сбора метрик.
- Grafana: provisioning источников и дашбордов.

---

## Правила изменения инфраструктуры

- любые изменения конфигов сопровождаются пояснением в PR;
- чувствительные данные не хранятся в репозитории;
- параметры по умолчанию должны работать локально без ручных правок.

---

## Ссылки

- [Root README](../README.md)
- [Architecture](../docs/ARCHITECTURE.md)
- [Database](../docs/DATABASE.md)
