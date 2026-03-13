<div align="center">

# Contributing to StackScout

**Руководство для контрибьюторов проекта StackScout**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#pull-requests)

</div>

---

## Содержание

- [Для начинающих](#для-начинающих)
- [Процесс разработки](#процесс-разработки)
- [Установка локального окружения](#установка-локального-окружения)
- [Правила кода](#правила-кода)
- [Тестирование](#тестирование)
- [Pull Requests](#pull-requests)
- [Commit сообщения](#commit-сообщения)
- [Общение с сообществом](#общение-с-сообществом)
- [Дополнительные ресурсы](#дополнительные-ресурсы)

---

## Для начинающих

### По каким направлениям можно внести вклад?

StackScout приветствует контрибьюции в следующих областях:

- Backend (Java): API improvements, performance optimization, bug fixes
- Frontend (Next.js/React): UI/UX improvements, new features, testing
- DevOps: Docker, CI/CD, deployment optimization
- Documentation: улучшение документации, добавление примеров
- Testing: unit tests, integration tests, E2E tests
- Translations: локализация на другие языки

### Чего искать для начала?

Начните с issues, отмеченных как:

- `good first issue` - идеальные для новичков
- `help wanted` - нужна помощь сообщества
- `documentation` - задачи по документации

---

## Процесс разработки

### 1. Форк и клонирование репозитория

```bash
# Форк репозитория на GitHub (кнопка Fork)

# Клонирование вашего форка
git clone https://github.com/YOUR_USERNAME/StackScout.git
cd StackScout

# Добавление ссылки на оригинальный репозиторий
git remote add upstream https://github.com/Zero-Logic-Education/StackScout.git
```

### 2. Создание ветки для разработки

```bash
# Получение актуальной версии

git fetch upstream
git checkout -b feature/your-feature-name upstream/main

# Или альтернативные префиксы
git checkout -b fix/issue-description upstream/main
git checkout -b docs/documentation-update upstream/main
```

### Правила именования веток

- `feature/*` - новые функции
- `fix/*` - исправление ошибок
- `docs/*` - документация
- `refactor/*` - рефакторинг
- `test/*` - добавление тестов

Пример: `feature/license-compatibility-check`

---

## Установка локального окружения

### Требования

<div align="center">

| Компонент | Минимум | Рекомендуется |
|:---:|:---:|:---:|
| Java | 21+ | 21 |
| Node.js | 18+ | 20+ |
| pnpm | 8+ | Latest |
| PostgreSQL | 16 | 16 |
| Docker | 24+ | Latest |
| Docker Compose | 2.20+ | Latest |

</div>

### Backend (Java/Spring Boot)

```bash
cd backend

# Установка зависимостей и сборка
./gradlew build

# Запуск в режиме разработки
./gradlew bootRun

# Запуск тестов
./gradlew test

# Тесты с покрытием
./gradlew test jacocoTestReport
```

Environment переменные:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/stackscout_dev
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_DATA_REDIS_HOST=localhost
SPRING_RABBITMQ_HOST=localhost
```

### Frontend (Next.js/React)

```bash
cd frontend

# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev

# Сборка для production
pnpm build

# Запуск тестов
pnpm test

# Линтинг
pnpm lint
```

Environment переменные:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
```

### Docker Compose (быстрый старт)

```bash
# Запуск всех сервисов
docker compose up -d

# Проверка статуса
docker compose ps

# Остановка
docker compose down

# Просмотр логов
docker compose logs -f app
```

После запуска:

- Backend: http://localhost:8081
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5433
- Redis: localhost:6379
- RabbitMQ: http://localhost:15672 (guest/guest)

---

## Правила кода

### Java (Backend)

#### Стиль кодирования

```java
// Хорошо: camelCase для переменных/методов
private String packageName;
public PackageDto getPackageById(Long id) { }

// Недопустимо: snake_case
private String package_name;

// Используйте описательные имена
public List<PackageDto> findActivePackages() { }

// Избегайте сокращений
public List<PackageDto> getActPkgs() { }
```

#### Конвенции

```java
@Service
@Transactional
public class PackageService {

    @Autowired
    private PackageRepository packageRepository;

    /**
     * Получить пакет по ID.
     */
    public PackageDto getPackageById(Long id) {
        try {
            return packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException());
        } catch (DatabaseException e) {
            logger.error("Database error: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch package", e);
        }
    }
}
```

### TypeScript/React (Frontend)

#### Стиль компонентов

```typescript
interface PackageCardProps {
  packageId: number;
  name: string;
  healthScore: number;
  onSelect: (id: number) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  packageId,
  name,
  healthScore,
  onSelect,
}) => {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>Health: {healthScore}</p>
      <button onClick={() => onSelect(packageId)}>Select</button>
    </div>
  );
};
```

#### Конвенции

```typescript
const MAX_RETRIES = 3;
let currentAttempt = 0;

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchPackages(): Promise<Package[]> {
  try {
    const response = await apiClient.get('/packages');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    throw error;
  }
}
```

### Общие правила

1. Комментарии: объясняйте почему, а не что.
2. Документация: документируйте публичные методы.
3. Логирование: используйте уровни логирования корректно.
4. Производительность: профилируйте до оптимизации.
5. Безопасность: никогда не коммитьте secrets/passwords.

---

## Тестирование

### Backend (JUnit 5 + Mockito)

```java
@SpringBootTest
class PackageServiceTest {

    @Mock
    private PackageRepository packageRepository;

    @InjectMocks
    private PackageService packageService;

    @Test
    void shouldReturnPackageById() {
        Long packageId = 1L;
        Package pkg = new Package();
        pkg.setId(packageId);
        pkg.setName("requests");

        when(packageRepository.findById(packageId)).thenReturn(Optional.of(pkg));

        PackageDto result = packageService.getPackageById(packageId);

        assertThat(result.getId()).isEqualTo(packageId);
        assertThat(result.getName()).isEqualTo("requests");
        verify(packageRepository, times(1)).findById(packageId);
    }
}
```

### Frontend (Jest)

```typescript
import { fireEvent, render, screen } from '@testing-library/react';
import { PackageCard } from './PackageCard';

describe('PackageCard', () => {
  it('should render package name', () => {
    const mockOnSelect = jest.fn();

    render(
      <PackageCard
        packageId={1}
        name="requests"
        healthScore={92}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText('requests')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const mockOnSelect = jest.fn();

    render(
      <PackageCard
        packageId={1}
        name="requests"
        healthScore={92}
        onSelect={mockOnSelect}
      />,
    );

    fireEvent.click(screen.getByText('Select'));
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });
});
```

### Требования по тестированию

- Покрытие: минимум 80% для новых функций
- Unit тесты: для всех сервисов и утилит
- Integration тесты: для API endpoints
- Test naming: имя теста должно описывать ожидаемый результат

Запуск:

```bash
# Backend
cd backend && ./gradlew test

# Frontend
cd frontend && pnpm test
```

---

## Pull Requests

### Прежде чем создавать PR

1. Обновите вашу ветку:

```bash
git fetch upstream
git rebase upstream/main
```

2. Запустите тесты локально:

```bash
cd backend && ./gradlew test
cd frontend && pnpm test
```

3. Проверьте линтинг:

```bash
cd backend && ./gradlew checkstyleMain
cd frontend && pnpm lint
```

4. Добавьте необходимые тесты.

### Создание PR

1. Пуш ветки в ваш форк:

```bash
git push origin feature/your-feature-name
```

2. Откройте PR на GitHub.

3. Заполните описание PR по шаблону:

```markdown
## Описание
Что было сделано и почему

## Type of change
- [ ] Bug fix (исправление ошибки)
- [ ] New feature (новая функция)
- [ ] Breaking change
- [ ] Documentation update

## Как это было протестировано?
Описание процесса тестирования

## Чек-лист
- [ ] Код следует стилю проекта
- [ ] Добавлены необходимые тесты
- [ ] Обновлена документация
- [ ] Все тесты проходят
- [ ] Не добавлены ненужные файлы

## Скриншоты (если UI изменения)
[Добавить скриншоты]

## Закрывает issue (если есть)
Closes #123
```

### Требования к PR

- [ ] Один функционал на один PR
- [ ] Понятное описание изменений
- [ ] Тесты для новых функций
- [ ] Обновленная документация
- [ ] Без конфликтов с main веткой

### Что происходит после создания PR?

1. CI/CD проверки: автоматизированное тестирование и линтинг.
2. Code review: минимум 1 одобрение от мейнтейнера.
3. Обсуждение: замечания необходимо исправить.
4. Merge: мейнтейнер объединяет ветку в main.

---

## Commit сообщения

Используйте Conventional Commits:

```text
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Примеры

```text
feat(api): add package search endpoint
- Implement search by name and health score
- Add pagination support
- Tests included

Closes #123

fix(frontend): resolve package card rendering bug
The component was not updating when props changed

docs(architecture): update database schema diagram

refactor(service): simplify health score calculation
No functional changes, improved readability

test(backend): add unit tests for PackageService
```

### Type (тип коммита)

<div align="center">

| Type | Описание |
|:---:|:---:|
| `feat` | Новая функция |
| `fix` | Исправление ошибки |
| `docs` | Документация |
| `style` | Форматирование (без изменения логики) |
| `refactor` | Рефакторинг кода |
| `perf` | Оптимизация производительности |
| `test` | Добавление тестов |
| `chore` | Конфигурация и зависимости |

</div>

### Scope (область)

Рекомендуемые scope:

- `api`, `service`, `controller`, `repository` (backend)
- `component`, `page`, `lib`, `hook` (frontend)
- `docker`, `pipeline`, `config` (devops)

---

## Общение с сообществом

### Где задавать вопросы?

- Issues на GitHub: баг-репорты и предложения функций
- Discussions на GitHub: вопросы и идеи
- Pull Requests: обсуждение реализации

### Code of Conduct

- Будьте уважительны к другим контрибьюторам
- Принимайте конструктивную критику
- Сосредотачивайтесь на проблеме, а не на человеке
- Не допускайте дискриминацию и оскорбления

---

## Дополнительные ресурсы

- [Architecture](./ARCHITECTURE.md) - техническая архитектура
- [API Documentation](./API.md) - REST API
- [Database Schema](./DATABASE.md) - структура БД
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [License](../LICENSE)

---

## Вопросы?

Открывайте issue с меткой `question` или создавайте Discussion.

Спасибо за вклад в StackScout.
