#!/bin/bash

# Остановка и удаление существующих контейнеров
docker-compose down

# Удаление неиспользуемых образов и контейнеров
docker system prune -f

# Создание необходимых директорий
mkdir -p certbot/www
mkdir -p certbot/conf
mkdir -p public/images

# Копирование .env.production в .env
cp .env.production .env

# Запуск инициализации SSL-сертификатов
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh

# Запуск контейнеров
docker-compose up -d

# Применение миграций к базе данных
sleep 10 # Ждем, пока база данных полностью запустится
docker-compose exec -T web npx prisma migrate deploy

# Генерация Prisma Client
docker-compose exec -T web npx prisma generate

echo "Deployment completed successfully!" 