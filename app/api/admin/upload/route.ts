import { NextResponse } from 'next/server';
import { saveImage } from '@/app/utils/images';
import { generateSlug } from '@/app/utils/helpers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name') as string;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Файл не найден или неверный формат' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Название обязательно' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);
    const imageUrl = await saveImage(file, slug);
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
} 