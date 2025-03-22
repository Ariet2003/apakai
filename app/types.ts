export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  images: {
    id: number;
    url: string;
  }[];
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products?: Product[];
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  url: string;
  productId: string;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

export type Language = 'ru' | 'ky';

export type TranslationKey = keyof typeof import('./i18n/translations').translations.ru; 