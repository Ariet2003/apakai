import { NextResponse } from 'next/server';
import { saveUploadedFile } from '@/app/utils/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Название обязательно' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const imageUrl = await saveUploadedFile(file, bytes);
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
} 