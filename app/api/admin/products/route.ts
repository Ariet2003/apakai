import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { saveImage } from '@/app/server/files';

const prisma = new PrismaClient();

// GET /api/admin/products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || undefined;
    const availability = searchParams.get('availability');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');

    // Создаем условия для фильтрации
    let where: any = {};
    
    // Поиск по названию или описанию
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Фильтр по категории
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Фильтр по наличию
    if (availability !== 'all') {
      where.isAvailable = availability === 'available';
    }

    // Настраиваем сортировку
    const orderBy: any = sortBy === 'category' 
      ? { category: { name: sortOrder } }
      : { [sortBy]: sortOrder };

    const skip = (page - 1) * perPage;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          category: true,
          images: true
        }
      })
    ]);

    const totalPages = Math.ceil(total / perPage);

    return NextResponse.json({
      products,
      total,
      page,
      perPage,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении списка товаров' },
      { status: 500 }
    );
  }
}

interface ProductImage {
  url: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  slug?: string;
  images: ProductImage[];
}

// POST /api/admin/products
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Получаем данные товара
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const isAvailable = formData.get('isAvailable') === 'true';
    const removeDefaultImage = formData.get('removeDefaultImage') === 'true';
    
    // Получаем файлы изображений
    const imageFiles = formData.getAll('images');
    
    // Создаем товар
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        categoryId,
        isAvailable,
      },
    });
    
    // Загружаем изображения, если они есть
    const validImageFiles = imageFiles.filter(file => 
      file instanceof Blob && file.size > 0
    );

    if (validImageFiles.length > 0) {
      // Загружаем изображения последовательно
      const uploadPromises = validImageFiles.map(async (file) => {
        try {
          // Сохраняем файл и получаем URL
          const imageUrl = await saveImage(file as Blob, slug);
          
          // Создаем запись об изображении в базе данных
          return await prisma.image.create({
            data: {
              url: imageUrl,
              productId: product.id,
            },
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          return null;
        }
      });

      // Ждем завершения всех загрузок
      await Promise.all(uploadPromises);
    } else if (!removeDefaultImage) {
      // Если изображения не были загружены и не указано удалить дефолтное изображение
      await prisma.image.create({
        data: {
          url: '/images/product-default.png',
          productId: product.id,
        },
      });
    }
    
    // Получаем обновленный товар со всеми связанными данными
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true
      }
    });
    
    // Возвращаем ответ с заголовками для отключения кэширования
    return new NextResponse(JSON.stringify(updatedProduct), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products?ids=id1,id2,id3
export async function DELETE(request: NextRequest) {
  try {
    // Пробуем получить ID из параметров запроса
    const { searchParams } = new URL(request.url);
    let ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    // Если ID не указаны в параметрах запроса, пробуем получить их из тела запроса
    if (ids.length === 0) {
      try {
        const body = await request.json();
        if (body.ids && Array.isArray(body.ids)) {
          ids = body.ids;
        } else if (body.id) {
          ids = [body.id];
        }
      } catch (e) {
        // Если не удалось распарсить JSON, продолжаем с пустым массивом ids
        console.error('Error parsing request body:', e);
      }
    }

    // Если ID все еще не указаны, возвращаем ошибку
    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Не указаны ID товаров для удаления' },
        { status: 400 }
      );
    }

    // Сначала удаляем все связанные изображения
    await prisma.image.deleteMany({
      where: {
        productId: {
          in: ids
        }
      }
    });

    // Затем удаляем все указанные товары
    await prisma.product.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Успешно удалено товаров: ${ids.length}` 
    });
  } catch (error) {
    console.error('Error deleting products:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении товаров' },
      { status: 500 }
    );
  }
} 