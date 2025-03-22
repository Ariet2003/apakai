import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const [totalProducts, totalCategories] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
    ]);

    const stats = {
      totalProducts,
      totalCategories,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении статистики' },
      { status: 500 }
    );
  }
} 