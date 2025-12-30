import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { products as localProducts, Product } from '@/data/products';
import type { Tables } from '@/integrations/supabase/types';

type DBProduct = Tables<'products'>;

// Convert DB product to app product format
const convertDBProduct = (dbProduct: DBProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name_en,
  nameAr: dbProduct.name_ar,
  price: Number(dbProduct.price),
  originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
  image: dbProduct.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  category: dbProduct.category,
  categoryAr: dbProduct.category === 'Subscriptions' ? 'اشتراكات' :
              dbProduct.category === 'Designs' ? 'تصاميم' :
              dbProduct.category === 'Engagement' ? 'تفاعل' :
              dbProduct.category === 'Discord' ? 'ديسكورد' : dbProduct.category,
  description: dbProduct.description_en || '',
  descriptionAr: dbProduct.description_ar || '',
  rating: dbProduct.rating ? Number(dbProduct.rating) : 5,
  reviewsCount: dbProduct.reviews_count || 0,
  isNew: false,
  isBestSeller: false,
  inStock: dbProduct.in_stock ?? true
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Use DB products
          const dbProducts = data.map(convertDBProduct);
          setProducts(dbProducts);
        } else {
          // Fallback to local products
          setProducts(localProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to local products on error
        setProducts(localProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
};

export const useFeaturedProducts = (limit: number = 4) => {
  const { products, loading } = useProducts();
  return { 
    products: products.slice(0, limit), 
    loading 
  };
};
