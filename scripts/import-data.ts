import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(await fs.readFile('export.json', 'utf-8'));

  // Очищаем существующие данные
  await prisma.image.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.settings.deleteMany();

  // Импортируем категории
  for (const category of data.categories) {
    await prisma.category.create({
      data: category
    });
  }

  // Импортируем продукты
  for (const product of data.products) {
    await prisma.product.create({
      data: {
        ...product,
        images: undefined
      }
    });
  }

  // Импортируем изображения
  for (const image of data.images) {
    await prisma.image.create({
      data: image
    });
  }

  // Импортируем настройки
  for (const setting of data.settings) {
    await prisma.settings.create({
      data: setting
    });
  }

  console.log('Data imported successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 