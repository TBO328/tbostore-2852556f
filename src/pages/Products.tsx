import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShoppingBag, Filter } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import StreamerPackages from '@/components/StreamerPackages';
import { useCategories } from '@/hooks/useCategories';

type DBProduct = Tables<'products'>;

interface DisplayProduct {
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
}

const Products: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const { language } = useLanguage();
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories: dbCategories, loading: categoriesLoading } = useCategories();
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else if (dbProducts && dbProducts.length > 0) {
        // Map database products to display format
        const mappedProducts: DisplayProduct[] = dbProducts.map((p: DBProduct) => ({
          id: p.id,
          name: p.name_en,
          nameAr: p.name_ar,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          image: p.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&q=80',
          category: p.category,
          categoryAr: getCategoryAr(p.category),
          isNew: isNewProduct(p.created_at),
          isBestSeller: false,
          description: p.description_en || '',
          descriptionAr: p.description_ar || '',
          rating: Number(p.rating) || 0,
          reviewsCount: p.reviews_count || 0,
        }));
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryAr = (category: string): string => {
    // Check dynamic categories first
    const dynamicCat = dbCategories.find(c => c.value === category);
    if (dynamicCat) return dynamicCat.label_ar;
    
    const categoryMap: { [key: string]: string } = {
      'Subscriptions': 'اشتراكات',
      'Designs': 'تصاميم',
      'Engagement': 'تفاعل',
      'Discord': 'ديسكورد',
    };
    return categoryMap[category] || category;
  };

  const isNewProduct = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 7; // Consider new if created within last 7 days
  };

  // Build categories array dynamically from database
  const allCategories = ['All', ...dbCategories.map(c => c.value)];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const getCategoryLabel = (cat: string) => {
    if (cat === 'All') {
      return language === 'en' ? 'All' : 'الكل';
    }
    const dynamicCat = dbCategories.find(c => c.value === cat);
    if (dynamicCat) {
      return language === 'en' ? dynamicCat.label_en : dynamicCat.label_ar;
    }
    return cat;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <motion.h1 
                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-foreground">
                  {language === 'en' ? 'Our ' : ''}
                </span>
                <span className="text-gradient-neon">
                  {language === 'en' ? 'Products' : 'منتجاتنا'}
                </span>
              </motion.h1>
              <motion.p 
                className="text-muted-foreground text-lg max-w-xl mx-auto"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {language === 'en'
                  ? 'Discover our premium digital products'
                  : 'اكتشف منتجاتنا الرقمية المميزة'}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 bg-background relative overflow-hidden">
          {/* Subtle Background - Reduced blur */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl"
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-3xl"
              animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Category Filter - Redesigned */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-wrap justify-center gap-4">
                {!categoriesLoading && allCategories.map((category, index) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative px-8 py-3.5 rounded-2xl font-bold text-base transition-all duration-300 overflow-hidden group ${
                      activeCategory === category
                        ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-xl shadow-primary/30'
                        : 'bg-card/50 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30'
                    }`}
                  >
                    {/* Hover Glow Effect */}
                    {activeCategory !== category && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    )}
                    <span className="relative z-10">{getCategoryLabel(category)}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {!loading && (
              <>
                {/* Streamer Packages - Show only for specific categories, NOT for All */}
                {activeCategory !== 'All' && (
                  <AnimatedSection delay={0.2}>
                    <StreamerPackages categoryFilter={activeCategory} />
                  </AnimatedSection>
                )}

                {/* Products Grid - Enhanced */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ 
                          delay: index * 0.05, 
                          duration: 0.4,
                          type: "spring",
                          stiffness: 200
                        }}
                        layout
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </>
            )}

            {/* Empty State - Enhanced */}
            {!loading && filteredProducts.length === 0 && (
              <motion.div 
                className="text-center py-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </motion.div>
                <p className="text-xl text-muted-foreground mb-2">
                  {language === 'en' ? 'No products found' : 'لا توجد منتجات'}
                </p>
                <p className="text-sm text-muted-foreground/70">
                  {language === 'en' ? 'Try selecting a different category' : 'جرب اختيار فئة أخرى'}
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
