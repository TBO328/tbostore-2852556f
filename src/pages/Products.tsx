import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
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
  
  // Parallax effect state
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animations for parallax
  const parallaxX1 = useSpring(useTransform(mouseX, [0, 1], [-30, 30]), { stiffness: 100, damping: 30 });
  const parallaxY1 = useSpring(useTransform(mouseY, [0, 1], [-30, 30]), { stiffness: 100, damping: 30 });
  const parallaxX2 = useSpring(useTransform(mouseX, [0, 1], [40, -40]), { stiffness: 80, damping: 25 });
  const parallaxY2 = useSpring(useTransform(mouseY, [0, 1], [40, -40]), { stiffness: 80, damping: 25 });
  const parallaxX3 = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), { stiffness: 120, damping: 35 });
  const parallaxY3 = useSpring(useTransform(mouseY, [0, 1], [-20, 20]), { stiffness: 120, damping: 35 });

  // Handle mouse move for parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

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
    <div 
      ref={containerRef}
      className="min-h-screen bg-background"
      onMouseMove={handleMouseMove}
    >
      <Navbar />
      <main className="pt-20">
        {/* Elegant Hero Section */}
        <section className="py-28 md:py-36 relative overflow-hidden">
          {/* Refined Background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.08) 0%, transparent 70%),
                  radial-gradient(ellipse 60% 50% at 80% 100%, hsl(var(--secondary) / 0.06) 0%, transparent 60%)
                `
              }}
            />
            {/* Subtle animated grain texture */}
            <motion.div 
              className="absolute inset-0 opacity-[0.015]"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
            />
          </div>

          {/* Elegant floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Thin line accents */}
            <motion.div
              className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/15 to-transparent"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            
            {/* Floating diamond shapes */}
            <motion.div
              className="absolute top-16 right-[12%] w-3 h-3 rotate-45 border border-primary/30"
              animate={{ y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ x: parallaxX1 }}
            />
            <motion.div
              className="absolute bottom-24 left-[8%] w-2 h-2 rotate-45 bg-secondary/30"
              animate={{ y: [0, 12, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              style={{ x: parallaxX2 }}
            />
            <motion.div
              className="absolute top-1/2 left-[18%] w-4 h-4 rotate-45 border border-primary/15"
              animate={{ y: [0, -10, 0], rotate: [45, 90, 45] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ x: parallaxX3 }}
            />
            
            {/* Soft glow orbs */}
            <motion.div 
              className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-secondary/5 rounded-full blur-[100px]"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              {/* Decorative top element */}
              <motion.div
                className="flex items-center justify-center gap-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/60" />
                <Sparkles className="w-4 h-4 text-primary/60" />
                <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary/70">
                  {language === 'en' ? 'Premium Collection' : 'مجموعة مميزة'}
                </span>
                <Sparkles className="w-4 h-4 text-primary/60" />
                <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/60" />
              </motion.div>

              {/* Title */}
              <motion.h1 
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                <span className="text-foreground">
                  {language === 'en' ? 'Explore Our ' : 'استكشف '}
                </span>
                <span className="relative inline-block">
                  <span className="text-gradient-neon">
                    {language === 'en' ? 'Products' : 'منتجاتنا'}
                  </span>
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                  />
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {language === 'en'
                  ? 'Handpicked digital products designed to elevate your creative journey'
                  : 'منتجات رقمية مختارة بعناية لتعزيز رحلتك الإبداعية'}
              </motion.p>

              {/* Stats bar */}
              <motion.div
                className="flex items-center justify-center gap-8 mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{products.length}+</p>
                  <p className="text-xs text-muted-foreground">{language === 'en' ? 'Products' : 'منتج'}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{allCategories.length - 1}</p>
                  <p className="text-xs text-muted-foreground">{language === 'en' ? 'Categories' : 'فئة'}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">⭐</p>
                  <p className="text-xs text-muted-foreground">{language === 'en' ? 'Top Quality' : 'جودة عالية'}</p>
                </div>
              </motion.div>
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

            {/* Loading State */}
            {loading ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="relative w-20 h-20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary" />
                </motion.div>
                <motion.p 
                  className="mt-6 text-muted-foreground"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {language === 'en' ? 'Loading products...' : 'جاري تحميل المنتجات...'}
                </motion.p>
              </motion.div>
            ) : (
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
