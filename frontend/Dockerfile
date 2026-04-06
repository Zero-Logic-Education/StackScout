# Стадия сборки
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml ./

# Устанавливаем ВСЕ зависимости (нужны для билда)
RUN pnpm install --frozen-lockfile

# Копируем исходный код
COPY . .

# Создаем public если не существует (Next.js требует эту папку)
RUN mkdir -p public

# Аргумент для API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Собираем приложение
RUN pnpm build

# Стадия production
FROM node:20-alpine

WORKDIR /app

# Устанавливаем wget для health checks
RUN apk add --no-cache wget

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем результаты сборки и необходимые файлы
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/next.config.ts ./

# Устанавливаем зависимости. 
# ВАЖНО: Мы НЕ используем --prod здесь, так как для работы next.config.ts 
# в рантайме Next.js требует наличия typescript (который обычно в devDeps).
RUN pnpm install --frozen-lockfile

# Создаем непривилегированного пользователя
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
USER nextjs

# Expose порт
EXPOSE 3000

# Стартуем приложение
CMD ["pnpm", "start"]
