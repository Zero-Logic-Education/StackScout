# Настройка и запуск тестов

## ⚠️ ВАЖНО

Тестовые файлы переименованы в `.example.ts` до установки необходимых зависимостей:
- `useLibrarySubscription.test.example.ts`
- `useLibraryUpdates.test.example.ts`  
- `useUserSubscriptions.test.example.ts`

После установки зависимостей переименуйте их обратно в `.test.ts`

## Установка зависимостей для тестирования

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/react-hooks @testing-library/jest-dom jest jest-environment-jsdom @types/jest
```

## Конфигурация Jest

Создать файл `jest.config.js` в корне frontend:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Путь к Next.js приложению
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

## Файл настройки Jest

Создать файл `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
```

## Добавить скрипты в package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Запуск тестов

- Запустить все тесты: `npm test`
- Запустить в watch режиме: `npm run test:watch`
- Запустить с покрытием кода: `npm run test:coverage`

## Структура тестов

Тесты покрывают следующие хуки:

1. **useLibrarySubscription** - подписка/отписка на библиотеки
   - Инициализация
   - Подписка на библиотеку
   - Отписка от библиотеки
   - Получение статуса подписки
   - Переключение уведомлений
   - Обработка ошибок

2. **useLibraryUpdates** - получение обновлений библиотек
   - Загрузка обновлений для пользователя
   - Загрузка последних обновлений
   - Автоматическая загрузка при монтировании
   - История обновлений библиотеки
   - Последнее обновление

3. **useUserSubscriptions** - управление подписками пользователя
   - Загрузка всех подписок
   - Проверка подписки на библиотеку
   - Автоматическая загрузка
   - Обработка ошибок
   - Сортировка и пагинация

## Покрытие тестами

Тесты покрывают:
- ✅ Успешные сценарии
- ✅ Обработка ошибок
- ✅ Состояния загрузки
- ✅ Автоматическая загрузка данных
- ✅ Пагинация и сортировка

## Следующие шаги

1. Установить зависимости
2. Настроить Jest конфигурацию
3. Запустить тесты: `npm test`
4. Добавить интеграционные тесты для компонентов
5. Настроить CI/CD для автоматического запуска тестов
