export interface Product {
  id: number | string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryAr: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  description: string;
  descriptionAr: string;
  rating?: number;
  reviewsCount?: number;
  inStock?: boolean;
}

// Products are now fetched exclusively from the database
export const products: Product[] = [];

export const categories = ['All'];
export const categoriesAr = ['الكل'];
