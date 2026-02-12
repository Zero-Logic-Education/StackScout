# Стадия сборки
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходный код
COPY . .

# Аргумент для API URL (чтобы запечь в билд)
ARG NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Собираем приложение
RUN pnpm build

# Стадия production
FROM node:20-alpine

WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем конфиг и публичные файлы
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Копируем собранное приложение
COPY --from=builder /app/.next ./.next

# Устанавливаем только production зависимости
RUN pnpm install --frozen-lockfile --prod

# Expose порт
EXPOSE 3000

# Стартуем приложение
CMD ["pnpm", "start"]
