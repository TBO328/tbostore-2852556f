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
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/data/products';

const Favorites: React.FC = () => {
  const { language } = useLanguage();
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                  <Heart className="w-10 h-10 text-primary fill-primary" />
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
                  {language === 'en' ? 'Your ' : 'قائمة '}
                  <span className="text-gradient-neon glow-text-cyan">
                    {language === 'en' ? 'Favorites' : 'المفضلة'}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  {language === 'en'
                    ? 'Products you love, saved for later.'
                    : 'المنتجات التي أعجبتك، محفوظة لوقت لاحق.'}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Loading State */}
            {isLoading || favoritesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <AnimatedSection>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
                    <Heart className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                    {language === 'ar' ? 'لا توجد منتجات مفضلة' : 'No favorites yet'}
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
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
              </AnimatedSection>
            ) : (
              /* Products Grid */
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                layout
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    layout
                  >
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
