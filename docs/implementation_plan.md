# План реализации: Система подписок и ленты обновлений

**Дата создания**: 25 февраля 2026
**Версия**: 1.0

---

## Обзор

Этот документ описывает план реализации функционала подписок на библиотеки и ленты обновлений в StackScout.

### Цели

1. **Переиспользование компонентов** (Reusability) - компонентный подход Atomic Design
2. **Расширяемость** (Extensibility) - кастомные хуки для логики подписок и обновлений
3. **Типобезопасность** (Type Safety) - полное покрытие TypeScript интерфейсами
4. **Управление состоянием** (State Management) - Context API для глобального состояния подписок

---

## Архитектура решения

### 1. Backend изменения

#### 1.1 Новые таблицы БД (Flyway миграция)

**Таблица: user_subscriptions**
```sql
CREATE TABLE user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    library_id BIGINT NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_enabled BOOLEAN DEFAULT true,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (library_id) REFERENCES packages(id) ON DELETE CASCADE,
    UNIQUE(user_id, library_id)
);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_library ON user_subscriptions(library_id);
```

**Таблица: library_updates**
```sql
CREATE TABLE library_updates (
    id BIGSERIAL PRIMARY KEY,
    library_id BIGINT NOT NULL,
    version VARCHAR(100),
    release_date TIMESTAMP,
    changelog_text TEXT,
    change_type VARCHAR(50),  -- MAJOR, MINOR, PATCH, SECURITY
    download_url VARCHAR(500),
    
    FOREIGN KEY (library_id) REFERENCES packages(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_updates_library ON library_updates(library_id);
CREATE INDEX idx_updates_release_date ON library_updates(release_date DESC);
```

#### 1.2 JPA сущности

- `Subscription` (@Entity) - связь между пользователем и библиотекой
- `LibraryUpdate` (@Entity) - информация об обновлении библиотеки
- `User` (расширение существующей) - добавить коллекцию подписок

#### 1.3 REST API эндпоинты

**Подписки:**
```
POST   /api/v1/subscriptions              - создать подписку
DELETE /api/v1/subscriptions/{id}          - отписаться
GET    /api/v1/subscriptions               - получить мои подписки
GET    /api/v1/subscriptions/{libraryId}   - проверить статус подписки
```

**Обновления:**
```
GET    /api/v1/updates/feed                - получить ленту обновлений (для подписанных)
GET    /api/v1/updates/library/{libraryId} - обновления конкретной библиотеки
GET    /api/v1/updates                     - все обновления (с пагинацией)
```

#### 1.4 Сервисы

- `SubscriptionService` - управление подписками
- `LibraryUpdateService` - управление обновлениями библиотек
- `UpdateFeedService` - формирование ленты обновлений

### 2. Frontend структура

#### 2.1 API клиент типы (расширение lib/api.ts)

```typescript
// Типы для подписок
export interface Subscription {
  id: number;
  libraryId: number;
  libraryName: string;
  subscribedAt: string;
  notificationEnabled: boolean;
}

export interface SubscriptionResponse {
  isSubscribed: boolean;
  subscription?: Subscription;
  message: string;
}

// Типы для обновлений
export interface LibraryUpdate {
  id: number;
  libraryId: number;
  libraryName: string;
  version: string;
  releaseDate: string;
  changelogText: string;
  changeType: 'MAJOR' | 'MINOR' | 'PATCH' | 'SECURITY';
  downloadUrl?: string;
}

export interface UpdateFeedResponse {
  updates: LibraryUpdate[];
  totalElements: number;
  currentPage: number;
  totalPages: number;
}
```

#### 2.2 Структура компонентов (Atomic Design)

```
src/components/
├── atoms/
│   ├── SubscribeButton.tsx       # Кнопка подписки
│   ├── UpdateBadge.tsx           # Бейдж типа обновления
│   └── StatusIndicator.tsx       # Индикатор статуса подписки
├── molecules/
│   ├── UpdateCard.tsx            # Карточка одного обновления
│   ├── SubscriptionInfo.tsx      # Инфо о подписке
│   └── LibraryCard.tsx           # Карточка библиотеки (обновленная)
├── organisms/
│   ├── UpdateFeed.tsx            # Список обновлений
│   ├── SubscribedLibraries.tsx   # Список подписанных библиотек
│   └── LibraryHeader.tsx         # Заголовок с подпиской
├── library/
│   ├── LibraryInfo.tsx           # (существующий, обновленный)
│   ├── HealthMetricsDisplay.tsx  # (существующий)
│   └── SubscriptionPanel.tsx     # (новый) - панель управления подпиской
└── dashboard/
    ├── LibraryDetailView.tsx      # (существующий, обновленный)
    └── UpdatesPage.tsx            # (новый) - страница обновлений
```

#### 2.3 Кастомные хуки (hooks/)

```typescript
// hooks/useLibrarySubscription.ts
export const useLibrarySubscription = (libraryId: number) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleSubscription = async () => { ... }
  const checkSubscriptionStatus = async () => { ... }
  
  return { isSubscribed, isLoading, toggleSubscription, ... }
}

// hooks/useLibraryUpdates.ts
export const useLibraryUpdates = (libraryId?: number, page = 0) => {
  const [updates, setUpdates] = useState<LibraryUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchUpdates = async () => { ... }
  
  return { updates, loading, pagination, fetchUpdates, ... }
}

// hooks/useSubscriptionFeed.ts
export const useSubscriptionFeed = (page = 0) => {
  // Получает обновления для всех подписок пользователя
  const [feed, setFeed] = useState<LibraryUpdate[]>([]);
  
  return { feed, loading, pagination, ... }
}
```

#### 2.4 Context для управления состоянием

```typescript
// context/SubscriptionContext.tsx
export interface SubscriptionContextType {
  subscriptions: Map<number, Subscription>;
  isLoading: boolean;
  addSubscription: (libraryId: number) => Promise<void>;
  removeSubscription: (libraryId: number) => Promise<void>;
  isSubscribed: (libraryId: number) => boolean;
}

export const SubscriptionProvider = ({ children }) => { ... }
export const useSubscriptions = () => { ... }
```

#### 2.5 Страницы

**[id]/page.tsx** (новый)
```
/library/[id]  - детальная страница библиотеки с подпиской
- Заголовок с кнопкой подписки
- Информация о библиотеке
- Метрики здоровья
- История обновлений библиотеки (последние 10)
```

**/updates/page.tsx** (новый)
```
/updates  - ленты обновлений для подписанных библиотек
- Фильтры: по типу обновления, по дате
- Бесконечная прокрутка или пагинация
- Поиск по названию библиотеки
- Сортировка: по дате, по типу
```

---

## Компоненты детально

### Atoms (переиспользуемые элементы)

#### SubscribeButton.tsx
```tsx
interface SubscribeButtonProps {
  isSubscribed: boolean;
  isLoading: boolean;
  onToggle: () => void;
  variant?: 'contained' | 'outlined';
}
```

#### UpdateBadge.tsx
```tsx
interface UpdateBadgeProps {
  type: 'MAJOR' | 'MINOR' | 'PATCH' | 'SECURITY';
  size?: 'small' | 'medium';
}
```

### Molecules (простые комбинации)

#### UpdateCard.tsx
```tsx
interface UpdateCardProps {
  update: LibraryUpdate;
  showLibraryName?: boolean;
  onClick?: () => void;
}
```

### Organisms (сложные компоненты)

#### UpdateFeed.tsx
```tsx
interface UpdateFeedProps {
  updates: LibraryUpdate[];
  isLoading: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}
```

#### LibraryHeader.tsx
```tsx
interface LibraryHeaderProps {
  library: LibraryDetail;
  isSubscribed: boolean;
  onSubscriptionChange: (subscribed: boolean) => void;
}
```

---

## Типы данных (TypeScript)

### Backend DTOs (расширения)

```java
// SubscriptionDto.java
public class SubscriptionDto {
    private Long id;
    private Long libraryId;
    private String libraryName;
    private LocalDateTime subscribedAt;
    private boolean notificationEnabled;
}

// LibraryUpdateDto.java
public class LibraryUpdateDto {
    private Long id;
    private Long libraryId;
    private String libraryName;
    private String version;
    private LocalDateTime releaseDate;
    private String changelogText;
    private String changeType; // MAJOR, MINOR, PATCH, SECURITY
    private String downloadUrl;
}
```

---

## Управление состоянием

### Вариант 1: Context API (рекомендуется)

```
SubscriptionContext 
  ↓
 {subscriptions, loading, error}
  ↓
useSubscriptions hook (любой компонент)
```

**Преимущества:**
- Нативный React API
- Простое локальное состояние
- Полная типизация

### Вариант 2: Zustand (альтернатива)

```typescript
const useSubscriptionStore = create((set) => ({
  subscriptions: {},
  addSubscription: (libraryId) => { ... }
}))
```

**Рекомендация**: Context API для простоты.

---

## Данные и API

### Структура ответа ленты обновлений

```json
{
  "updates": [
    {
      "id": 1,
      "libraryId": 42,
      "libraryName": "requests",
      "version": "2.31.0",
      "releaseDate": "2024-01-15T10:30:00Z",
      "changelogText": "- Fixed handling of timeout parameter\n- Added support for IPv6",
      "changeType": "MINOR",
      "downloadUrl": "https://..."
    }
  ],
  "totalElements": 250,
  "currentPage": 0,
  "totalPages": 13
}
```

### Параметры пагинации

```
GET /api/v1/updates/feed?page=0&size=20&sort=releaseDate,desc
```

---

## UI/UX дизайн

### Страница деталей библиотеки (улучшенная)

**Сверху:**
- Заголовок: название + версия
- Кнопка подписки (большая, вызывающая)
- Иконка источника + лицензия + дата обновления

**Основное:**
- 3-колончный макет:
  - Левая: информация о библиотеке (описание, автор, лицензия)
  - Центр: метрики здоровья (графики)
  - Правая: быстрая информация (sticky)

**Внизу:**
- История последних обновлений (5-10 элементов)
- Ссылка "Смотреть все обновления" → /updates?libraryId=X

### Страница обновлений

**Заголовок:** "Обновления подписанных библиотек" или "История обновлений"

**Фильтры сверху:**
- Выбор типа: [Все] | Major | Minor | Patch | Security
- Поиск: по названию библиотеки
- Календарь: с какой даты

**Список:**
- Карточки обновлений в хронологическом порядке
- Каждая карточка: название библиотеки, версия, тип, дата, краткое описание
- Кнопка "Читать полностью" или раскрывающееся содержимое

**Макет:**
```
┌─────────────────────────────────────┐
│ Обновления подписанных библиотек    │
├─────────────────────────────────────┤
│ [Фильтры] [Поиск]                   │
├─────────────────────────────────────┤
│ 📦 requests 2.31.0                  │
│    🔶 Minor | 15 янв 2024           │
│    Fixed handling of timeout...      │
│                                      │
│ 🐳 docker 25.0.0                    │
│    🔴 Major | 14 янв 2024           │
│    Breaking changes in API...        │
│                                      │
│ [Загрузить еще]                     │
└─────────────────────────────────────┘
```

---

## Миграция данных

### Flyway версия
- V002__AddSubscriptionsAndUpdates.sql

### Начальные данные
```sql
-- Заполнить таблицу library_updates из существующих версий пакетов
-- (можно добавить задачу в scheduler для сбора истории)
```

---

## Тестирование

### Unit тесты (Jest)

```typescript
describe('useLibrarySubscription', () => {
  test('toggleSubscription переключает статус подписки', async () => { ... })
  test('checkSubscriptionStatus получает текущий статус', async () => { ... })
})

describe('UpdateFeed', () => {
  test('отображает список обновлений', () => { ... })
  test('Фильтр по типу работает корректно', () => { ... })
})
```

### Integration тесты
- Проверка синхронизации состояния подписок между страницами
- Проверка персистентности подписок при перезагрузке

---

## Timeline (ориентировочно)

| Задача | Время |
|--------|-------|
| Backend: миграции БД | 1-2 часа |
| Backend: сущности и репозитории | 1-2 часа |
| Backend: сервисы и контроллеры | 2-3 часа |
| Backend: тесты | 1-2 часа |
| Frontend: типы и API клиент | 30 мин |
| Frontend: кастомные хуки | 1-2 часа |
| Frontend: Atoms и Molecules компоненты | 2-3 часа |
| Frontend: Organisms компоненты | 2-3 часа |
| Frontend: страницы | 2-3 часа |
| Frontend: тесты | 1-2 часа |
| Интеграция и тестирование | 2-3 часа |
| **Итого** | **~18-27 часов** |

---

## Следующие шаги

1. ✅ Утвердить план
2. Начать с Backend (БД, сущности)
3. Реализовать API контроллеры
4. Создать Frontend компоненты
5. Интеграционное тестирование
6. Развертывание в production

---

## Контакты и вопросы

Если у вас есть вопросы по плану - обратитесь к разработчику перед началом работы.
