# Улучшения мониторинга StackScout

## Обзор изменений

Система мониторинга была значительно улучшена для обеспечения полного контроля над производительностью, доступностью и качеством сервиса.

---

## 1. Специализированные дашборды

### Executive Dashboard (`stackscout-executive`)
**Для**: Менеджмента и руководства  
**URL**: http://localhost:3001/d/stackscout-executive

**Метрики:**
- 24h Uptime (%) - доступность за последние сутки
- Error Rate (1h) - процент ошибок за час
- Error Budget (30d) - остаток бюджета ошибок для SLA 99.9%
- Response Time (p99) - время ответа 99-го перцентиля
- Request Throughput - график запросов (total, success, errors)
- Response Time Percentiles - p50, p95, p99
- Active Alerts - количество активных алертов
- Total Requests (24h) - общее количество запросов
- Current RPS - текущий RPS
- Service Health - таблица статусов всех сервисов

### Developer Dashboard (`stackscout-developer`)
**Для**: Разработчиков  
**URL**: http://localhost:3001/d/stackscout-developer

**Метрики:**
- Top 10 Slowest Endpoints (p95) - таблица самых медленных эндпоинтов
- Top 10 Endpoints by Error Rate - эндпоинты с наибольшим процентом ошибок
- Response Time Heatmap - тепловая карта распределения latency
- Top 5 Endpoints by Traffic - самые нагруженные эндпоинты
- Error Rate by Status Code - ошибки по HTTP кодам (4xx, 5xx)
- API Latency Percentiles - p50, p90, p95, p99
- JVM Thread States - состояния потоков JVM
- GC Pause Time - время пауз сборщика мусора
- Log Events by Level - логи по уровням (ERROR, WARN, INFO)
- Apdex Score - индекс производительности приложения (T=500ms)

### Database Dashboard (`stackscout-database`)
**Для**: DBA и DevOps  
**URL**: http://localhost:3001/d/stackscout-database

**PostgreSQL метрики:**
- Active Connections - активные подключения по базам
- Transaction Rate - commits и rollbacks в секунду
- HikariCP Connection Pool - active, idle, pending соединения
- Connection Acquire Time - время получения соединения из пула

**Redis метрики:**
- Redis Clients - connected и blocked клиенты
- Operations Rate - операций в секунду
- Cache Hit Rate (%) - процент попаданий в кэш
- Memory Usage - использование памяти
- Key Evictions & Expirations - вытеснения и истечения ключей

### System Overview Dashboard (`stackscout-overview`)
**Для**: Общего мониторинга  
**URL**: http://localhost:3001/d/stackscout-overview

Комплексный дашборд со всеми основными метриками системы.

---

## 2. Расширенные алерты

### SLO Alerts (Service Level Objectives)
```yaml
- LatencySLOBreach: p99 latency > 1s в течение 10 минут
- ErrorBudgetExhausted: error rate > 0.1% за 30 дней (нарушение SLA 99.9%)
- AvailabilitySLOBreach: uptime < 99.9% за последний час
```

### Anomaly Detection (Обнаружение аномалий)
```yaml
- ErrorRateAnomaly: error rate в 3x выше среднего за день
- TrafficSpike: request rate в 5x выше среднего за день
- LatencySpike: p95 latency в 2x выше среднего за час
```

### Resource Leaks (Утечки ресурсов)
```yaml
- MemoryLeakSuspected: heap растет >1MB/30min при использовании >80%
- ConnectionLeakSuspected: активные соединения растут 30 минут
- ThreadLeakSuspected: количество потоков растет 1 час
```

### Performance Degradation (Деградация производительности)
```yaml
- HighGCPressure: средняя пауза GC > 100ms в течение 10 минут
- SlowDatabaseQueries: среднее время получения соединения > 500ms
- RedisSlowOperations: средняя длительность команды > 10ms
- HighCacheMissRate: cache miss rate > 50% в течение 15 минут
```

**Всего алертов**: 22 (9 базовых + 13 расширенных)

---

## 3. Synthetic Monitoring (Blackbox Exporter)

### HTTP Endpoints Monitoring
Проверка доступности HTTP эндпоинтов:
- `http://app:8081/actuator/health` - health check бэкенда
- `http://app:8081/api/v1/libraries` - API эндпоинт
- `http://frontend:3000` - фронтенд

### TCP Connectivity Monitoring
Проверка TCP подключений:
- `postgres:5432` - PostgreSQL
- `redis:6379` - Redis
- `rabbitmq:5672` - RabbitMQ

**Метрики:**
- `probe_success` - успешность проверки (0/1)
- `probe_duration_seconds` - время выполнения проверки
- `probe_http_status_code` - HTTP код ответа

---

## 4. Ключевые метрики

### SLA Metrics

#### Uptime (Доступность)
```promql
# 24h uptime percentage
avg_over_time(up{job="stackscout-backend"}[24h]) * 100
```

#### Error Budget (Бюджет ошибок)
```promql
# Remaining error budget for 99.9% SLA
(1 - (sum(rate(http_server_requests_seconds_count{status=~"5.."}[30d])) / 
      sum(rate(http_server_requests_seconds_count[30d])))) / 0.001 * 100
```

#### Apdex Score (Индекс производительности)
```promql
# Application Performance Index (T=500ms)
(
  sum(rate(http_server_requests_seconds_count{status!~"5.."}[5m])) +
  sum(rate(http_server_requests_seconds_bucket{le="0.5"}[5m]))
) / 2 / sum(rate(http_server_requests_seconds_count[5m]))
```

### Performance Metrics

#### GC Pressure
```promql
rate(jvm_gc_pause_seconds_sum[5m]) / rate(jvm_gc_pause_seconds_count[5m])
```

#### Memory Allocation Rate
```promql
rate(jvm_gc_memory_allocated_bytes_total[5m])
```

#### Cache Hit Rate
```promql
rate(redis_keyspace_hits_total[5m]) / 
(rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))
```

#### Connection Pool Saturation
```promql
hikaricp_connections_active / hikaricp_connections
```

---

## 5. Структура файлов

```
infrastructure/monitoring/
├── prometheus/
│   ├── prometheus.yml          # Конфигурация Prometheus
│   └── rules/
│       └── alerts.yml          # 22 правила алертинга
├── grafana/
│   ├── provisioning/
│   │   ├── datasources.yml     # Prometheus datasource
│   │   └── dashboards.yml      # Автоматическая загрузка дашбордов
│   └── dashboards/
│       ├── executive-dashboard.json      # Executive Dashboard
│       ├── developer-dashboard.json      # Developer Dashboard
│       ├── database-dashboard.json       # Database Dashboard
│       ├── stackscout-dashboard.json     # System Overview
│       └── backend-metrics.json          # Backend Metrics
├── blackbox/
│   └── blackbox.yml            # Конфигурация Blackbox Exporter
└── README.md                   # Документация
```

---

## 6. Доступ к системе мониторинга

### Prometheus
- **URL**: http://localhost:9090
- **Targets**: http://localhost:9090/targets
- **Alerts**: http://localhost:9090/alerts
- **Rules**: http://localhost:9090/rules

### Grafana
- **URL**: http://localhost:3001
- **Login**: admin
- **Password**: admin

### Exporters
- **Blackbox Exporter**: http://localhost:9115
- **PostgreSQL Exporter**: http://localhost:9187
- **Redis Exporter**: http://localhost:9121

### Application Metrics
- **Backend Metrics**: http://localhost:8081/actuator/prometheus
- **Health Check**: http://localhost:8081/actuator/health

---

## 7. Быстрый старт

### Запуск всей системы
```bash
docker compose up -d
```

### Проверка статуса
```bash
# Все сервисы
docker compose ps

# Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | "\(.labels.job): \(.health)"'

# Загруженные правила алертинга
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[] | {name: .name, rules: (.rules | length)}'
```

### Доступ к дашбордам
1. Откройте http://localhost:3001
2. Войдите (admin/admin)
3. Перейдите в Dashboards → StackScout
4. Выберите нужный дашборд:
   - Executive Dashboard - для менеджмента
   - Developer Dashboard - для разработчиков
   - Database Dashboard - для DBA
   - System Overview - общий обзор

---

## 8. Мониторинг в действии

### Проверка SLA
```bash
# Uptime за 24 часа
curl -s 'http://localhost:9090/api/v1/query?query=avg_over_time(up{job="stackscout-backend"}[24h])*100' | jq '.data.result[0].value[1]'

# Error rate за час
curl -s 'http://localhost:9090/api/v1/query?query=sum(rate(http_server_requests_seconds_count{status=~"5.."}[1h]))/sum(rate(http_server_requests_seconds_count[1h]))*100' | jq '.data.result[0].value[1]'
```

### Проверка производительности
```bash
# p99 latency
curl -s 'http://localhost:9090/api/v1/query?query=histogram_quantile(0.99,rate(http_server_requests_seconds_bucket[5m]))*1000' | jq '.data.result[0].value[1]'

# Current RPS
curl -s 'http://localhost:9090/api/v1/query?query=sum(rate(http_server_requests_seconds_count[5m]))' | jq '.data.result[0].value[1]'
```

### Проверка алертов
```bash
# Активные алерты
curl -s http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.state=="firing") | {alert: .labels.alertname, severity: .labels.severity}'
```

---

## 9. Best Practices

### Для разработчиков
1. **Проверяйте Developer Dashboard** перед деплоем
2. **Мониторьте Top 10 Slowest Endpoints** после изменений
3. **Следите за Error Rate** по эндпоинтам
4. **Анализируйте Heatmap** для выявления аномалий latency
5. **Проверяйте GC Pause Time** при изменениях в коде

### Для DevOps
1. **Ежедневно проверяйте Executive Dashboard**
2. **Настройте алерты** в Slack/Email/PagerDuty
3. **Мониторьте Error Budget** - не допускайте исчерпания
4. **Следите за Resource Leaks** - memory, connections, threads
5. **Анализируйте Database Dashboard** при проблемах с производительностью

### Для менеджмента
1. **Проверяйте Executive Dashboard** для оценки качества сервиса
2. **Отслеживайте Uptime** и соответствие SLA
3. **Мониторьте Error Budget** - индикатор стабильности
4. **Анализируйте тренды** Response Time и Throughput

---

## 10. Troubleshooting

### Высокий Error Rate
1. Проверьте Developer Dashboard → Top 10 Endpoints by Error Rate
2. Посмотрите логи: `docker compose logs app`
3. Проверьте Database Dashboard → Connection Pool

### Медленные запросы
1. Проверьте Developer Dashboard → Top 10 Slowest Endpoints
2. Проверьте Database Dashboard → Connection Acquire Time
3. Проверьте Redis Cache Hit Rate

### Утечка памяти
1. Проверьте System Overview → JVM Memory Usage
2. Проверьте алерт MemoryLeakSuspected
3. Проверьте Developer Dashboard → GC Pause Time

### Проблемы с БД
1. Проверьте Database Dashboard → PostgreSQL Active Connections
2. Проверьте Connection Pool Saturation
3. Проверьте Transaction Rate

---

## Итоги улучшений

✅ **4 специализированных дашборда** для разных ролей  
✅ **22 правила алертинга** включая SLO, anomaly detection, resource leaks  
✅ **Synthetic monitoring** с Blackbox Exporter  
✅ **SLA метрики**: Uptime, Error Budget, Apdex Score  
✅ **Performance метрики**: GC pressure, cache hit rate, connection pool  
✅ **Полная документация** с примерами запросов  

Система мониторинга теперь обеспечивает:
- Проактивное обнаружение проблем
- Детальную диагностику производительности
- Контроль соблюдения SLA
- Раннее обнаружение утечек ресурсов
- Визуализацию для всех ролей команды
