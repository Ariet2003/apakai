import path from 'path';
import { promises as fs } from 'fs';
import { generateSlug } from './helpers';

export async function saveUploadedFile(file: File, bytes: ArrayBuffer): Promise<string> {
  const buffer = Buffer.from(bytes);
  const slug = generateSlug(file.name.split('.')[0]);
  const ext = path.extname(file.name).toLowerCase();
  const fileName = `${slug}${ext}`;
  const publicPath = path.join(process.cwd(), 'public', 'images');
  const filePath = path.join(publicPath, fileName);
  
  // Создаем директорию, если она не существует
  await fs.mkdir(publicPath, { recursive: true });
  
  await fs.writeFile(filePath, buffer);
  return `/images/${fileName}`;
}

export async function saveImage(file: File, slug: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const ext = path.extname(file.name).toLowerCase();
  const fileName = `${slug}${ext}`;
  const publicPath = path.join(process.cwd(), 'public', 'images');
  
  // Создаем директорию, если она не существует
  await fs.mkdir(publicPath, { recursive: true });
  
  const filePath = path.join(publicPath, fileName);
  await fs.writeFile(filePath, buffer);
  
  return `/images/${fileName}`;
}

export async function deleteImage(imageUrl: string) {
  if (!imageUrl) return;
  
  const fileName = path.basename(imageUrl);
  const filePath = path.join(process.cwd(), 'public', 'images', fileName);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
} 