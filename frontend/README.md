<div align="center">

# StackScout Frontend

Клиентская часть платформы StackScout на Next.js.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## Содержание

- [Назначение](#назначение)
- [Что находится во frontend](#что-находится-во-frontend)
- [Структура](#структура)
- [Команды frontend](#команды-frontend)
- [Конфигурация](#конфигурация)
- [Ссылки](#ссылки)

---

## Назначение

Frontend отвечает за пользовательский интерфейс платформы:

- отображение библиотек, метрик и аналитики;
- взаимодействие с API backend;
- маршрутизацию и клиентские сценарии.

Общие инструкции запуска всего проекта находятся в корневом README.

---

## Что находится во frontend

- страницы App Router;
- UI-компоненты;
- клиент API и хуки;
- тема и глобальные стили.

---

## Структура

```text
frontend/src/
  app/         страницы и layout
  components/  переиспользуемые UI-компоненты
  lib/         api-клиент, auth, hooks
  theme/       тема приложения
```

---

## Команды frontend

```bash
cd frontend
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
```

---

## Конфигурация

Основная переменная окружения:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
```

Ключевые конфиги:

- `frontend/next.config.ts`
- `frontend/tsconfig.json`
- `frontend/eslint.config.mjs`