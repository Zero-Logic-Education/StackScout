<div align="center">

# Contributing to StackScout

Руководство по вкладу в проект без дублирования основной документации.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#pull-requests)

</div>

---

## Содержание

- [Что вносить](#что-вносить)
- [Процесс работы](#процесс-работы)
- [Требования к изменениям](#требования-к-изменениям)
- [Тестирование изменений](#тестирование-изменений)
- [Pull Requests](#pull-requests)
- [Commit сообщения](#commit-сообщения)
- [Коммуникация](#коммуникация)
- [Полезные ссылки](#полезные-ссылки)

---

## Что вносить

StackScout приветствует вклад в следующих направлениях:

- Backend: API, производительность, исправления ошибок
- Frontend: UX/UI, новые сценарии, устойчивость интерфейса
- DevOps: контейнеризация, CI/CD, наблюдаемость
- Testing: unit, integration, e2e
- Documentation: улучшение и актуализация документации
- Translation: локализация материалов

Для старта выбирайте задачи с метками:

- good first issue
- help wanted
- documentation

---

## Процесс работы

### 1. Подготовьте форк и upstream

```bash
git clone https://github.com/YOUR_USERNAME/StackScout.git
cd StackScout
git remote add upstream https://github.com/Zero-Logic-Education/StackScout.git
```

### 2. Создайте отдельную ветку

```bash
git fetch upstream
git checkout -b feature/short-description upstream/main
```

Допустимые префиксы веток:

- feature/*
- fix/*
- docs/*
- refactor/*
- test/*

### 3. Держите ветку актуальной

```bash
git fetch upstream
git rebase upstream/main
```

---

## Требования к изменениям

- Один Pull Request должен решать одну задачу.
- Изменения должны быть локальными и понятными по объему.
- Новая функциональность должна сопровождаться тестами.
- Если поведение изменено, документация должна быть обновлена.
- Нельзя добавлять секреты, токены, пароли и приватные ключи.

### Код-стиль (кратко)

- Java: понятные имена, единый стиль аннотаций, публичные API с документацией.
- TypeScript/React: строгая типизация, без неявных any, предсказуемые пропсы и контракты.
- Комментарии объясняют причину решения, а не пересказывают код.

---

## Тестирование изменений

Перед PR убедитесь, что:

- тесты проходят локально;
- линтеры и проверки стиля проходят;
- изменение покрыто тестами на уровне, достаточном для регрессий.

Подробные команды запуска окружения, сборки, тестов и линтинга находятся в корневом README.

---

## Pull Requests

### Чек-лист перед открытием PR

- [ ] Ветка синхронизирована с upstream/main
- [ ] Лишние/временные файлы не добавлены
- [ ] Добавлены или обновлены тесты
- [ ] Обновлена документация при изменении поведения
- [ ] Изменения проходят локальные проверки

### Шаблон описания PR

```markdown
## Описание
Что было сделано и почему

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Как проверялось
Кратко опишите сценарии проверки

## Чек-лист
- [ ] Код соответствует стилю проекта
- [ ] Добавлены нужные тесты
- [ ] Обновлена документация
- [ ] Все проверки проходят

## Related issue
Closes #123
```

### После открытия PR

1. Автопроверки CI должны быть зелеными.
2. Требуется минимум одно ревью и одобрение.
3. Замечания ревью должны быть закрыты до merge.

---

## Commit сообщения

Используйте формат Conventional Commits:

```text
<type>(<scope>): <subject>
```

Рекомендуемые type:

- feat
- fix
- docs
- refactor
- test
- chore
- perf
- style

Рекомендуемые scope:

- backend: api, service, controller, repository
- frontend: component, page, lib, hook
- devops: docker, pipeline, config

---

## Коммуникация

- Используйте Issues для багов и feature-запросов.
- Используйте Discussions для вопросов и идей.
- В обсуждениях придерживайтесь уважительного и конструктивного тона.

---

## Полезные ссылки

- [Root README](../README.md)
- [Architecture](./ARCHITECTURE.md)
- [API](./API.md)
- [Database](./DATABASE.md)
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
