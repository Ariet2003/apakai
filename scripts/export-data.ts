import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany();
  const images = await prisma.image.findMany();
  const settings = await prisma.settings.findMany();

  const data = {
    categories,
    products,
    images,
    settings
  };

  await fs.writeFile('export.json', JSON.stringify(data, null, 2));
  console.log('Data exported successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 