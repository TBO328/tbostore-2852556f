import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import PageTransition from '@/components/PageTransition';
import type { Product } from '@/data/products';

const Favorites: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', favorites);

        if (error) throw error;

        const formattedProducts: Product[] = (data || []).map(p => ({
          id: p.id,
          name: p.name_en,
          nameAr: p.name_ar,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          image: p.image_url || '/placeholder.svg',
          category: p.category,
          categoryAr: p.category,
          description: p.description_en || '',
          descriptionAr: p.description_ar || '',
          rating: Number(p.rating) || 5,
          reviewsCount: p.reviews_count || 0,
          inStock: p.in_stock ?? true,
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching favorite products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteProducts();
    }
  }, [favorites, favoritesLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === 'ar' ? 'المفضلة' : 'Favorites'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'المنتجات التي أعجبتك' 
                : 'Products you liked'}
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading || favoritesLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {language === 'ar' ? 'لا توجد منتجات مفضلة' : 'No favorites yet'}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {language === 'ar'
                  ? 'ابدأ بإضافة المنتجات التي تعجبك بالضغط على أيقونة القلب'
                  : 'Start adding products you like by clicking the heart icon'}
              </p>
              <Link to="/products">
                <Button variant="neon" size="lg" className="gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                </Button>
              </Link>
            </motion.div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Favorites;
