# Быстрый старт: Админ-панель StackScout

## 🚀 Запуск

### 1. Применить миграции БД

```bash
cd backend
./gradlew flywayMigrate
```

### 2. Запустить полный стек

```bash
docker-compose up -d
```

### 3. Создать администратора

Через приложение при первом запуске или SQL:

```sql
INSERT INTO users (username, email, password, role, enabled, locked, created_at, updated_at)
VALUES (
    'admin',
    'admin@stackscout.com',
    '$2a$10$YourBcryptHashHere',  -- Замените на реальный BCrypt хеш
    'ADMIN',
    true,
    false,
    NOW(),
    NOW()
);
```

Или через CLI:

```bash
./scripts/reset-admin-password.sh admin AdminPassword123!
```

### 4. Открыть админ-панель

```
Frontend: http://localhost:3000/admin
Backend API: http://localhost:8080/api/admin
Swagger UI: http://localhost:8080/swagger-ui.html
RabbitMQ Management: http://localhost:15672 (guest/guest)
```

## 📁 Структура проекта

```
StackScout/
├── backend/
│   ├── src/main/java/com/stackscout/
│   │   ├── controller/
│   │   │   ├── AdminScraperController.java      ✅ NEW
│   │   │   ├── AdminLibraryController.java      ✅ NEW
│   │   │   ├── AdminMaintenanceController.java  ✅ NEW
│   │   │   └── PasswordResetController.java     ✅ NEW
│   │   ├── service/
│   │   │   ├── ScraperTaskService.java          ✅ NEW
│   │   │   ├── ScraperCommandService.java       ✅ NEW
│   │   │   └── PasswordResetService.java        ✅ NEW
│   │   ├── model/
│   │   │   ├── ScraperTask.java                 ✅ NEW
│   │   │   ├── PasswordResetToken.java          ✅ NEW
│   │   │   └── ModerationStatus.java            ✅ NEW
│   │   ├── repository/
│   │   │   ├── ScraperTaskRepository.java       ✅ NEW
│   │   │   └── PasswordResetTokenRepository.java ✅ NEW
│   │   ├── dto/
│   │   │   ├── ScraperTaskDto.java              ✅ NEW
│   │   │   ├── ScraperCommandDto.java           ✅ NEW
│   │   │   └── PasswordResetRequestDto.java     ✅ NEW
│   │   ├── config/
│   │   │   └── RabbitMQConfig.java              ✅ UPDATED
│   │   └── cli/
│   │       └── ResetPasswordCommandLineRunner.java ✅ NEW
│   └── src/main/resources/db/migration/
│       ├── V4__create_scraper_tasks.sql         ✅ NEW
│       ├── V5__add_moderation_to_libraries.sql  ✅ NEW
│       └── V6__create_password_reset_tokens.sql ✅ NEW
├── frontend/
│   └── src/app/
│       ├── admin/
│       │   ├── page.tsx                         ✅ NEW (Dashboard)
│       │   ├── scrapers/page.tsx                ✅ NEW
│       │   ├── libraries/page.tsx               ✅ NEW
│       │   ├── maintenance/page.tsx             ✅ NEW
│       │   └── layout.tsx                       ✅ NEW
│       └── forgot-password/page.tsx             ✅ NEW
├── scripts/
│   └── reset-admin-password.sh                  ✅ NEW
└── docs/
    └── ADMIN_PANEL.md                           ✅ NEW
```

## 🔑 Авторизация

### Получить JWT токен

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminPassword123!"
  }'
```

Ответ:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "admin",
  "role": "ADMIN"
}
```

### Использовать токен

```bash
curl -X GET http://localhost:8080/api/admin/scrapers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Основные операции

### 1. Управление скрейперами

**Получить все скрейперы:**
```bash
GET /api/admin/scrapers
```

**Запустить скрейпер:**
```bash
POST /api/admin/scrapers/pypi-scraper/start
```

**Остановить скрейпер:**
```bash
POST /api/admin/scrapers/pypi-scraper/stop
```

### 2. Модерация библиотек

**Получить библиотеки:**
```bash
GET /api/admin/libraries?size=50&page=0
```

**Обновить статус модерации:**
```bash
PATCH /api/admin/libraries/123/moderation
Content-Type: application/json

{
  "moderationStatus": "VERIFIED",
  "moderationNotes": "Проверено, все в порядке"
}
```

**Пересчитать Health Score:**
```bash
POST /api/admin/libraries/123/recalculate-health
```

### 3. Регламентные работы

**Очистить кэш:**
```bash
POST /api/admin/maintenance/clear-cache
```

**Статистика кэша:**
```bash
GET /api/admin/maintenance/cache-stats
```

### 4. Сброс пароля

**Способ 1 - Через UI:**
1. Открыть http://localhost:3000/forgot-password
2. Ввести email
3. Получить токен из письма
4. Ввести токен и новый пароль

**Способ 2 - Через API:**
```bash
# Запросить токен
POST /api/auth/password-reset/request
{
  "email": "admin@stackscout.com"
}

# Подтвердить сброс
POST /api/auth/password-reset/confirm
{
  "token": "uuid-token-from-email",
  "newPassword": "NewPassword123!"
}
```

**Способ 3 - Аварийный (CLI):**
```bash
# Через shell скрипт
./scripts/reset-admin-password.sh admin NewPassword123!

# Через Docker
docker-compose exec backend java -jar app.jar \
  --reset-admin-password \
  --username=admin \
  --password=NewPassword123!
```

## 🐰 RabbitMQ

### Мониторинг очередей

```bash
# Web UI
http://localhost:15672

# CLI
docker-compose exec rabbitmq rabbitmqctl list_queues
```

### Отправка тестовой команды

```python
import pika
import json

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

message = {
    "commandType": "START",
    "scraperName": "pypi-scraper",
    "userId": 1
}

channel.basic_publish(
    exchange='scraper_command_exchange',
    routing_key='scraper.command.pypi-scraper',
    body=json.dumps(message)
)

print("Команда отправлена!")
connection.close()
```

## 🎨 Frontend

### Цветовая схема

```jsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'spring-green': '#6DB33F',
        'next-black': '#000000',
      }
    }
  }
}
```

### Основные компоненты

```tsx
// Статус скрейпера
<div className="bg-green-950/50 text-green-400 border-green-800">
  <Activity className="w-4 h-4" />
  RUNNING
</div>

// Прогресс-бар
<div className="bg-slate-800 rounded-full h-2">
  <div 
    className="h-full bg-gradient-to-r from-[#6DB33F] to-emerald-400"
    style={{ width: `${progress}%` }}
  />
</div>

// Кнопка действия
<button className="bg-[#6DB33F] hover:bg-[#5da335] text-white rounded-lg">
  Запустить
</button>
```

## 📊 Мониторинг

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

### Metrics

```bash
curl http://localhost:8080/actuator/metrics
```

### Prometheus

```bash
curl http://localhost:8080/actuator/prometheus
```

## 🔧 Troubleshooting

### Backend не запускается

```bash
# Проверить логи
docker-compose logs backend

# Проверить PostgreSQL
docker-compose logs postgres

# Проверить RabbitMQ
docker-compose logs rabbitmq
```

### Миграции не применились

```bash
# Проверить статус
./gradlew flywayInfo

# Принудительно применить
./gradlew flywayMigrate

# Откатить последнюю
./gradlew flywayUndo
```

### Скрейпер не получает команды

```bash
# Проверить очереди RabbitMQ
docker-compose exec rabbitmq rabbitmqctl list_queues

# Проверить connections
docker-compose exec rabbitmq rabbitmqctl list_connections

# Очистить очередь
docker-compose exec rabbitmq rabbitmqctl purge_queue scraper_command_queue
```

### JWT токен не работает

```bash
# Проверить секрет в application.yml
jwt:
  secret: your-secret-key-here
  expiration: 86400000

# Регенерировать токен
POST /api/auth/login
```

## 📚 Дополнительная документация

- [Полная документация админ-панели](./ADMIN_PANEL.md)
- [API документация](./API.md)
- [Архитектура проекта](./ARCHITECTURE.md)
- [База данных](./DATABASE.md)

## 🎓 Примеры использования

### Пример 1: Запуск скрейпера из UI

1. Логин → `/admin`
2. Перейти в `/admin/scrapers`
3. Найти "PyPI Package Scraper"
4. Нажать "Запустить"
5. Наблюдать обновление прогресса в реальном времени

### Пример 2: Модерация библиотеки

1. Перейти в `/admin/libraries`
2. Найти библиотеку через поиск
3. Нажать кнопку "Edit"
4. Выбрать статус модерации
5. Добавить заметки
6. Сохранить

### Пример 3: Аварийный сброс пароля

```bash
# SSH на сервер
ssh user@stackscout-server

# Перейти в директорию проекта
cd /opt/stackscout

# Запустить скрипт
./scripts/reset-admin-password.sh admin NewAdminPass2026!

# Результат
✅ Пароль успешно сброшен!
   Пользователь: admin
   Новый пароль: NewAdminPass2026!
```

---

**Готово!** Админ-панель запущена и готова к работе 🎉
