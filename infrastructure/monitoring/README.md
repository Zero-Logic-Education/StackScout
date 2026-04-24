# Мониторинг StackScout

## Обзор

Система мониторинга StackScout построена на базе Prometheus и Grafana и обеспечивает полный контроль над состоянием всех компонентов приложения.

## Компоненты

### Prometheus
- **URL**: http://localhost:9090
- **Назначение**: Сбор и хранение метрик
- **Retention**: 30 дней
- **Scrape interval**: 15s (backend: 30s)

### Grafana
- **URL**: http://localhost:3001
- **Логин**: admin
- **Пароль**: admin
- **Назначение**: Визуализация метрик и алертинг

### Exporters

#### PostgreSQL Exporter
- **Port**: 9187
- **Метрики**: Подключения, транзакции, размер БД, производительность запросов

#### Redis Exporter
- **Port**: 9121
- **Метрики**: Клиенты, операции, память, hit rate

## Собираемые метрики

### Backend (Spring Boot)
- **HTTP метрики**: Request rate, response time (p95, p99), error rate
- **JVM метрики**: Heap/non-heap memory, GC паузы, thread pool
- **Database pool**: Активные/idle соединения, время ожидания
- **Custom метрики**: Бизнес-метрики приложения

### PostgreSQL
- `pg_stat_database_numbackends` - активные подключения
- `pg_stat_database_xact_commit` - коммиты транзакций
- `pg_stat_database_xact_rollback` - откаты транзакций
- `pg_database_size_bytes` - размер БД

### Redis
- `redis_connected_clients` - подключенные клиенты
- `redis_commands_processed_total` - обработанные команды
- `redis_memory_used_bytes` - использование памяти
- `redis_keyspace_hits_total` / `redis_keyspace_misses_total` - cache hit rate

### RabbitMQ
- `rabbitmq_queue_messages` - сообщения в очереди
- `rabbitmq_queue_messages_ready` - готовые к обработке
- `rabbitmq_queue_messages_unacknowledged` - необработанные
- `rabbitmq_connections` - активные подключения

## Дашборды

### StackScout System Overview
**UID**: `stackscout-overview`

Основной дашборд с обзором всей системы:

1. **Service Status** - статус всех сервисов (Backend, PostgreSQL, Redis, RabbitMQ)
2. **Request Rate** - количество запросов в секунду по эндпоинтам
3. **Response Time** - p95 и p99 перцентили времени ответа
4. **JVM Memory** - использование heap памяти
5. **Database Connection Pool** - активные/idle/total соединения
6. **PostgreSQL Connections** - активные подключения к БД
7. **Redis Clients** - подключенные и заблокированные клиенты
8. **RabbitMQ Queue Messages** - сообщения в очередях
9. **Redis Operations Rate** - операций в секунду

### Backend Metrics
**File**: `backend-metrics.json`

Детальные метрики backend приложения.

## Алерты

Настроены следующие алерты (файл: `prometheus/rules/alerts.yml`):

### Critical (требуют немедленного реагирования)
- **ApplicationDown** - Backend недоступен > 1 мин
- **PostgresDown** - PostgreSQL недоступен > 1 мин
- **RedisDown** - Redis недоступен > 1 мин
- **RabbitMQDown** - RabbitMQ недоступен > 1 мин

### Warning (требуют внимания)
- **HighResponseTime** - среднее время ответа > 1с в течение 5 мин
- **HighErrorRate** - error rate > 5% в течение 5 мин
- **DatabaseConnectionPoolLow** - использование пула > 80% в течение 5 мин
- **HighMemoryUsage** - JVM heap > 90% в течение 5 мин
- **RabbitMQHighQueueSize** - > 1000 сообщений в очереди в течение 10 мин

## Быстрый старт

### Запуск мониторинга
```bash
docker compose up -d prometheus grafana postgres-exporter redis-exporter
```

### Проверка статуса targets
```bash
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

### Доступ к Grafana
1. Откройте http://localhost:3001
2. Войдите (admin/admin)
3. Перейдите в Dashboards → StackScout → StackScout System Overview

### Проверка метрик приложения
```bash
curl http://localhost:8081/actuator/prometheus | grep http_server_requests
```

## Конфигурация

### Prometheus
- **Config**: `infrastructure/monitoring/prometheus/prometheus.yml`
- **Rules**: `infrastructure/monitoring/prometheus/rules/alerts.yml`

### Grafana
- **Datasources**: `infrastructure/monitoring/grafana/provisioning/datasources.yml`
- **Dashboards**: `infrastructure/monitoring/grafana/provisioning/dashboards.yml`
- **Dashboard files**: `infrastructure/monitoring/grafana/dashboards/`

## Расширение мониторинга

### Добавление новых метрик в Spring Boot

```java
@Component
public class CustomMetrics {
    private final MeterRegistry registry;
    
    public CustomMetrics(MeterRegistry registry) {
        this.registry = registry;
    }
    
    public void recordCustomMetric(String name, double value) {
        registry.counter("custom.metric." + name).increment(value);
    }
}
```

### Добавление нового алерта

Отредактируйте `prometheus/rules/alerts.yml`:

```yaml
- alert: CustomAlert
  expr: your_metric > threshold
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Alert summary"
    description: "Alert description"
```

Перезагрузите конфигурацию:
```bash
curl -X POST http://localhost:9090/-/reload
```

## Troubleshooting

### Target down
```bash
# Проверить логи Prometheus
docker compose logs prometheus

# Проверить доступность target
curl http://app:8081/actuator/prometheus
```

### Grafana не показывает данные
1. Проверьте datasource: Configuration → Data Sources → Prometheus
2. Проверьте, что Prometheus собирает метрики: http://localhost:9090/targets
3. Проверьте query в панели дашборда

### Высокое использование памяти Prometheus
Уменьшите retention period в `docker-compose.yml`:
```yaml
command:
  - '--storage.tsdb.retention.time=15d'  # вместо 30d
```

## Best Practices

1. **Регулярно проверяйте дашборды** - минимум раз в день
2. **Настройте алерты** - интегрируйте с Slack/Email/PagerDuty
3. **Мониторьте тренды** - обращайте внимание на постепенный рост метрик
4. **Документируйте инциденты** - записывайте причины и решения
5. **Тестируйте алерты** - периодически проверяйте, что алерты срабатывают

## Полезные PromQL запросы

### Top 5 самых медленных эндпоинтов
```promql
topk(5, histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])))
```

### Error rate по эндпоинтам
```promql
rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / rate(http_server_requests_seconds_count[5m])
```

### Использование памяти JVM в процентах
```promql
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100
```

### Throughput базы данных
```promql
rate(pg_stat_database_xact_commit[5m]) + rate(pg_stat_database_xact_rollback[5m])
```

### Redis hit rate
```promql
rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))
```
