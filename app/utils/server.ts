import { writeFile, mkdir, readdir } from 'fs/promises';
import path from 'path';
import { generateSlug } from './helpers';

async function getNextFileNumber(directory: string, baseFileName: string): Promise<number> {
  try {
    const files = await readdir(directory);
    const regex = new RegExp(`^${baseFileName}(\\d+)\\.[^.]+$`);
    
    const numbers = files
      .map(file => {
        const match = file.match(regex);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => !isNaN(num));
    
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  } catch {
    return 1;
  }
}

export async function saveUploadedFile(file: File, name: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const slug = generateSlug(name);
  const ext = path.extname(file.name).toLowerCase();
  const publicPath = path.join(process.cwd(), 'public', 'images');
  
  // Создаем директорию, если она не существует
  await mkdir(publicPath, { recursive: true });
  
  // Получаем следующий номер файла
  const nextNumber = await getNextFileNumber(publicPath, slug);
  
  const fileName = `${slug}${nextNumber}${ext}`;
  const filePath = path.join(publicPath, fileName);
  await writeFile(filePath, buffer);
  
  return `/images/${fileName}`;
} 