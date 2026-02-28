# Административная панель StackScout

## Обзор

Административная панель StackScout предоставляет полный контроль над платформой анализа Open Source библиотек, включая управление скрейперами, модерацию данных и регламентные работы.

## Архитектура

### Общая схема взаимодействия

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js 15)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │  Admin Panel   │  │   Libraries    │  │  Maintenance   │        │
│  │   Dashboard    │  │  Management    │  │     Tools      │        │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘        │
└───────────┼──────────────────┼──────────────────┼──────────────────┘
            │                   │                   │
            │ REST API (JWT)    │                   │
            ▼                   ▼                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot 3.5)                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     Security Layer (JWT)                         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Admin REST API  │  │  Scraper Control │  │ Password Reset   │  │
│  │   Controllers    │  │     Service      │  │    Service       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                      │                      │             │
│  ┌────────▼──────────────────────▼──────────────────────▼─────────┐  │
│  │                      Service Layer                             │  │
│  │  • ScraperTaskService  • LibraryService  • UserService        │  │
│  └────────┬───────────────────────────────────────────────────────┘  │
│           │                      │                                    │
│  ┌────────▼──────────────────────▼────────────────┐                  │
│  │              JPA Repositories                   │                  │
│  └────────┬────────────────────────────────────────┘                  │
└───────────┼───────────────────────┼──────────────────────────────────┘
            │                       │
            ▼                       ▼
┌───────────────────┐    ┌──────────────────────────┐
│   PostgreSQL      │    │      RabbitMQ            │
│   Database        │    │   Message Broker         │
│                   │    │                          │
│  • users          │    │  Queues:                 │
│  • libraries      │    │  • scraper_command_queue │
│  • scraper_tasks  │    │  • scraper_status_queue  │
│  • scan_jobs      │    │  • scan_queue            │
└───────────────────┘    └──────────┬───────────────┘
                                    │
                                    ▼
                         ┌─────────────────────────┐
                         │   Scraper Workers       │
                         │  • PyPI Scraper         │
                         │  • Docker Hub Scraper   │
                         └─────────────────────────┘
```

### Поток данных для управления скрейпером

```
1. Администратор нажимает "Запустить" в UI
   │
   ▼
2. Frontend отправляет POST /api/admin/scrapers/{name}/start
   │
   ▼
3. AdminScraperController → ScraperCommandService
   │
   ▼
4. Отправка команды в RabbitMQ (scraper_command_queue)
   │
   ▼
5. Scraper Worker получает команду и начинает работу
   │
   ▼
6. Scraper отправляет обновления статуса в scraper_status_queue
   │
   ▼
7. Backend обновляет ScraperTask в БД
   │
   ▼
8. Frontend получает обновления через polling (каждые 5 сек)
```

## Entity Models

### ScraperTask

```java
@Entity
@Table(name = "scraper_tasks")
public class ScraperTask {
    private Long id;
    private String scraperName;      // pypi-scraper, dockerhub-scraper
    private String displayName;      // "PyPI Package Scraper"
    private String source;           // pypi, dockerhub
    private ScraperStatus status;    // IDLE, RUNNING, PAUSED, ERROR, COMPLETED
    private Boolean enabled;
    private String cronExpression;   // "0 0 * * * *"
    private Integer progress;        // 0-100
    private Integer processedCount;
    private Integer totalCount;
    private Integer errorCount;
    private LocalDateTime lastRunAt;
    private LocalDateTime nextRunAt;
    private String lastError;
    private String configuration;    // JSON с настройками
}
```

### Library (расширенная)

```java
@Entity
@Table(name = "libraries")
public class Library {
    private Long id;
    private String name;
    private String version;
    private String source;
    private String license;
    private Integer healthScore;
    
    // Новые поля для модерации
    private ModerationStatus moderationStatus;  // PENDING, VERIFIED, NEEDS_REVIEW, ARCHIVED
    private Long moderatedBy;                    // ID модератора
    private LocalDateTime moderatedAt;
    private String moderationNotes;
}
```

### PasswordResetToken

```java
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    private Long id;
    private String token;
    private User user;
    private LocalDateTime expiryDate;
    private Boolean used;
}
```

## REST API Endpoints

### Управление скрейперами

```http
GET    /api/admin/scrapers              - Получить все скрейперы
GET    /api/admin/scrapers/{id}         - Получить скрейпер по ID
POST   /api/admin/scrapers              - Создать скрейпер
PUT    /api/admin/scrapers/{id}         - Обновить скрейпер
DELETE /api/admin/scrapers/{id}         - Удалить скрейпер

POST   /api/admin/scrapers/{name}/start    - Запустить скрейпер
POST   /api/admin/scrapers/{name}/stop     - Остановить скрейпер
POST   /api/admin/scrapers/{name}/pause    - Приостановить
POST   /api/admin/scrapers/{name}/resume   - Возобновить
POST   /api/admin/scrapers/{name}/restart  - Перезапустить
```

### Управление библиотеками

```http
GET    /api/admin/libraries                           - Все библиотеки
GET    /api/admin/libraries/{id}                      - Библиотека по ID
PATCH  /api/admin/libraries/{id}/moderation           - Обновить статус модерации
POST   /api/admin/libraries/{id}/recalculate-health   - Пересчитать Health Score
DELETE /api/admin/libraries/{id}                      - Удалить библиотеку

POST   /api/admin/libraries/bulk-normalize-licenses   - Нормализация лицензий
DELETE /api/admin/libraries/remove-duplicates         - Удалить дубликаты
```

### Регламентные работы

```http
POST   /api/admin/maintenance/clear-cache    - Очистить Redis кэш
GET    /api/admin/maintenance/cache-stats    - Статистика кэша
POST   /api/admin/maintenance/health-check   - Проверка здоровья системы
```

### Сброс пароля

```http
POST   /api/auth/password-reset/request   - Запросить сброс пароля
POST   /api/auth/password-reset/confirm   - Подтвердить сброс пароля
```

## RabbitMQ Queues

### Команды скрейперам

**Exchange:** `scraper_command_exchange` (Topic)  
**Queue:** `scraper_command_queue`  
**Routing Key:** `scraper.command.{scraperName}`

**Message Format:**
```json
{
  "commandType": "START",
  "scraperName": "pypi-scraper",
  "parameters": "{}",
  "userId": 1
}
```

### Статусы скрейперов

**Exchange:** `scraper_status_exchange` (Topic)  
**Queue:** `scraper_status_queue`  
**Routing Key:** `scraper.status.{scraperName}`

**Message Format:**
```json
{
  "scraperName": "pypi-scraper",
  "status": "RUNNING",
  "progress": 45,
  "processedCount": 450,
  "totalCount": 1000,
  "errorCount": 5,
  "timestamp": "2026-02-28T10:30:00",
  "logMessage": "Processing package: requests"
}
```

## Frontend Компоненты

### Страницы

```
/admin                    - Dashboard с обзором
/admin/scrapers          - Мониторинг скрейперов
/admin/libraries         - Управление библиотеками
/admin/maintenance       - Регламентные работы
/forgot-password         - Восстановление пароля
```

### Основные компоненты

1. **ScrapersMonitorPage** - Карточки скрейперов с:
   - Статусом (IDLE, RUNNING, ERROR)
   - Прогресс-баром
   - Статистикой (обработано/всего/ошибки)
   - Кнопками управления

2. **AdminLibrariesPage** - Таблица библиотек с:
   - Поиском и фильтрацией
   - Модерационным статусом
   - Health Score с цветовой индикацией
   - Действиями (Edit, Delete, Recalculate)

3. **MaintenancePage** - Карточки с операциями:
   - Очистка кэша
   - Нормализация лицензий
   - Удаление дубликатов

## Безопасность

### Авторизация

- Все административные эндпоинты защищены `@PreAuthorize("hasRole('ADMIN')")`
- JWT токены с ролью ADMIN
- В Security Config добавить:

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

### Сброс пароля

#### Через UI (нормальный режим):

1. Пользователь вводит email на `/forgot-password`
2. Backend генерирует токен и отправляет email
3. Пользователь переходит по ссылке и вводит новый пароль
4. Токен имеет срок действия 24 часа

#### Аварийный сброс (CLI):

**Способ 1: Через Spring Boot:**
```bash
java -jar backend.jar --reset-admin-password \
    --username=admin \
    --password=newpassword123
```

**Способ 2: Через Docker:**
```bash
docker-compose exec backend java -jar app.jar \
    --reset-admin-password \
    --username=admin \
    --password=newpassword123
```

**Способ 3: Через shell-скрипт:**
```bash
chmod +x scripts/reset-admin-password.sh
./scripts/reset-admin-password.sh admin NewPassword123!
```

Скрипт автоматически:
- Генерирует BCrypt хеш пароля
- Подключается к PostgreSQL
- Обновляет пароль напрямую в БД
- Разблокирует аккаунт если заблокирован

## Визуальный дизайн

### Цветовая палитра

```css
/* Основные цвета */
--bg-primary: #0f172a;      /* slate-950 */
--bg-secondary: #1e293b;    /* slate-900 */
--border: #1e293b;          /* slate-800 */

/* Акценты */
--spring-green: #6DB33F;    /* Spring Boot */
--success: #10b981;         /* emerald-500 */
--warning: #f59e0b;         /* amber-500 */
--error: #ef4444;           /* red-500 */

/* Статусы */
--status-running: #10b981;  /* green-500 */
--status-paused: #f59e0b;   /* yellow-500 */
--status-error: #ef4444;    /* red-500 */
--status-idle: #64748b;     /* slate-500 */
```

### Типография

- Шрифт: Inter или Geist Sans
- Заголовки: font-bold
- Код/токены: font-mono

## Deployment

### Docker Compose

Добавьте в `docker-compose.yml`:

```yaml
backend:
  environment:
    - SPRING_RABBITMQ_HOST=rabbitmq
    - SPRING_RABBITMQ_PORT=5672
```

### Миграции БД

Создайте Flyway миграции:

```sql
-- V4__add_scraper_tasks.sql
CREATE TABLE scraper_tasks (
    id BIGSERIAL PRIMARY KEY,
    scraper_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    source VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    cron_expression VARCHAR(100),
    progress INTEGER,
    processed_count INTEGER,
    total_count INTEGER,
    error_count INTEGER,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    current_run_started_at TIMESTAMP,
    last_error TEXT,
    configuration TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- V5__add_moderation_to_libraries.sql
ALTER TABLE libraries
ADD COLUMN moderation_status VARCHAR(50) DEFAULT 'PENDING',
ADD COLUMN moderated_by BIGINT,
ADD COLUMN moderated_at TIMESTAMP,
ADD COLUMN moderation_notes TEXT;

-- V6__add_password_reset_tokens.sql
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token ON password_reset_tokens(token);
CREATE INDEX idx_expiry ON password_reset_tokens(expiry_date);
```

## Мониторинг

### Prometheus Metrics

Backend экспортирует метрики:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

### Grafana Dashboard

Добавьте графики:
- Количество активных скрейперов
- Процент успешных парсингов
- Health Score распределение
- Количество ошибок парсинга

## Лучшие практики

### Backend

1. **Всегда используйте транзакции** для изменения данных
2. **Валидируйте входные данные** с помощью Bean Validation
3. **Логируйте все административные действия** с указанием пользователя
4. **Используйте DTOs** для разграничения внутренних моделей и API

### Frontend

1. **Polling вместо WebSocket** для простоты (обновление каждые 5 сек)
2. **Optimistic UI** - обновляйте UI сразу, откатывайте при ошибке
3. **Loading states** - показывайте спиннеры и скелетоны
4. **Error handling** - всегда обрабатывайте ошибки API

### Security

1. **Никогда не логируйте пароли** даже в debug режиме
2. **Rate limiting** на эндпоинты сброса пароля
3. **CSRF protection** для всех POST/PUT/DELETE запросов
4. **Audit log** всех административных действий

## Troubleshooting

### Скрейпер не запускается

1. Проверьте RabbitMQ: `docker-compose logs rabbitmq`
2. Проверьте, что команда отправлена в очередь
3. Убедитесь, что worker запущен и слушает очередь

### Пароль не сбрасывается

1. Проверьте email-сервис
2. Используйте CLI метод: `./scripts/reset-admin-password.sh`
3. Проверьте логи backend

### Frontend не обновляется

1. Проверьте CORS настройки
2. Проверьте JWT токен в localStorage
3. Откройте DevTools Network tab для отладки

## Дальнейшее развитие

### Планируемые фичи

- [ ] WebSocket для real-time обновлений
- [ ] Экспорт данных в CSV/JSON
- [ ] Scheduled jobs с UI для настройки cron
- [ ] Dashboard с графиками (Chart.js)
- [ ] Email уведомления администраторам
- [ ] Audit log с историей всех изменений
- [ ] Роли: SUPER_ADMIN, MODERATOR, SUPPORT

---

**Версия:** 1.0.0  
**Дата:** 28 февраля 2026  
**Автор:** StackScout Team
