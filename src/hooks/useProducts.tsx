import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';
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
  const previousPricesRef = useRef<Record<string, number>>({});
  const [priceAnimations, setPriceAnimations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const dbProducts = data.map(convertDBProduct);
          
          // Check for price changes
          dbProducts.forEach(product => {
            const prevPrice = previousPricesRef.current[product.id];
            if (prevPrice !== undefined && prevPrice !== product.price) {
              setPriceAnimations(prev => ({ ...prev, [product.id]: true }));
              setTimeout(() => {
                setPriceAnimations(prev => ({ ...prev, [product.id]: false }));
              }, 600);
            }
            previousPricesRef.current[product.id] = product.price;
          });
          
          setProducts(dbProducts);
        } else {
          // No fallback to local products - only show database products
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // No fallback to local products
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isPriceAnimating = (productId: string): boolean => {
    return priceAnimations[productId] || false;
  };

  return { products, loading, isPriceAnimating };
};

export const useFeaturedProducts = (limit: number = 4) => {
  const { products, loading, isPriceAnimating } = useProducts();
  return { 
    products: products.slice(0, limit), 
    loading,
    isPriceAnimating
  };
};
