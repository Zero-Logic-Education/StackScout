<div align="center">

# StackScout Frontend

**Клиентская часть платформы StackScout на Next.js**

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)

</div>

---

## Содержание

- [Назначение](#назначение)
- [Структура модулей](#структура-модулей)
- [Команды frontend](#команды-frontend)
- [Конфигурация](#конфигурация)

---

## Назначение

Frontend отвечает за пользовательский интерфейс платформы:

- отображение библиотек, метрик и аналитики;
- взаимодействие с REST API backend;
- маршрутизацию и клиентские сценарии.

---

## Структура модулей

<div align="center">

| **Директория** | **Назначение** |
|:---|:---|
| `src/app/` | Страницы и layout (Next.js App Router) |
| `src/app/dashboard/` | Дашборд пользователя |
| `src/app/library/` | Просмотр карточек библиотек и деталей |
| `src/app/explore/` | Каталог и фильтрация |
| `src/app/admin/` | Административная панель |
| `src/components/` | Переиспользуемые UI-компоненты |
| `src/components/charts/` | Графики и диаграммы |
| `src/components/layout/` | Шапка, сайдбар, обёртки |
| `src/components/skeletons/` | Скелетоны загрузки |
| `src/lib/` | API-клиент, auth, хуки |
| `src/theme/` | Тема приложения (MUI) |

</div>

---

## Команды frontend

```bash
# Перейти в директорию frontend
cd frontend

# Установка зависимостей
pnpm install

# Запуск dev-сервера (http://localhost:3000)
pnpm dev

# Сборка для production
pnpm build

# Запуск production-сборки
pnpm start

# Линтинг
pnpm lint
```

---

## Конфигурация

<div align="center">

| **Файл** | **Назначение** |
|:---|:---|
| `next.config.ts` | Конфигурация Next.js |
| `tsconfig.json` | Настройки TypeScript |
| `eslint.config.mjs` | Правила линтинга |
| `postcss.config.mjs` | Конфигурация PostCSS / Tailwind |
| `middleware.ts` | Маршрутизация и защитные проверки доступа |

</div>