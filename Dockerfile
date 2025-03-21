# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем приложение
RUN npm run build

# Этап production
FROM node:18-alpine AS runner

WORKDIR /app

# Копируем необходимые файлы из этапа сборки
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Устанавливаем только production зависимости
COPY package*.json ./
RUN npm ci --only=production

# Устанавливаем переменные окружения
ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"] 