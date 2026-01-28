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
        {/* Hero Section with Enhanced Animations */}
        <section className="py-20 md:py-28 bg-gradient-hero relative overflow-hidden">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-20">
            <motion.div 
              className="absolute inset-0"
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--neon-cyan) / 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--neon-cyan) / 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />
          </div>

          {/* Parallax Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-1/4 left-1/4 w-80 h-80 bg-neon-cyan/15 rounded-full blur-3xl"
              style={{ x: parallaxX1, y: parallaxY1 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-neon-magenta/15 rounded-full blur-3xl"
              style={{ x: parallaxX2, y: parallaxY2 }}
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              style={{ x: parallaxX3, y: parallaxY3 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-4xl mx-auto">
                {/* Animated Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 backdrop-blur-md rounded-full border border-primary/30 mb-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-sm font-medium text-primary">
                    {language === 'en' ? 'Explore & Discover' : 'استكشف واكتشف'}
                  </span>
                </motion.div>

                {/* Main Title with Stagger Animation */}
                <motion.h1 
                  className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <motion.span 
                    className="block"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    {language === 'en' ? 'Our Amazing' : 'مجموعة'}
                  </motion.span>
                  <motion.span 
                    className="text-gradient-neon glow-text-cyan block mt-2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    {language === 'en' ? 'Products' : 'منتجاتنا المميزة'}
                  </motion.span>
                </motion.h1>

                {/* Subtitle with Typewriter Effect */}
                <motion.p 
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {language === 'en'
                    ? 'Discover our handpicked collection of premium digital products designed for creators and streamers.'
                    : 'اكتشف مجموعتنا المختارة من المنتجات الرقمية المميزة المصممة للمبدعين والمذيعين.'}
                </motion.p>
              </div>
            </AnimatedSection>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Products Section with Parallax */}
        <section className="py-16 bg-background relative overflow-hidden">
          {/* Parallax Background Orbs */}
          <motion.div 
            className="absolute top-1/2 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"
            style={{ x: parallaxX2, y: parallaxY1 }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl pointer-events-none"
            style={{ x: parallaxX1, y: parallaxY2 }}
          />
          <motion.div 
            className="absolute top-1/4 right-1/4 w-48 h-48 bg-primary/3 rounded-full blur-2xl pointer-events-none"
            style={{ x: parallaxX3, y: parallaxY3 }}
          />

          <div className="container mx-auto px-4 relative z-10">
            {/* Category Filter */}
            <AnimatedSection delay={0.1}>
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {!categoriesLoading && allCategories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-2.5 rounded-full font-arabic font-medium text-sm transition-all duration-300 ${
                      activeCategory === category
                        ? 'bg-primary text-primary-foreground shadow-neon-cyan'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {getCategoryLabel(category)}
                  </motion.button>
                ))}
              </div>
            </AnimatedSection>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Streamer Packages - Show only for specific categories, NOT for All */}
                {activeCategory !== 'All' && (
                  <AnimatedSection delay={0.2}>
                    <StreamerPackages categoryFilter={activeCategory} />
                  </AnimatedSection>
                )}

                {/* Products Grid */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  layout
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      layout
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  {language === 'en' ? 'No products found in this category.' : 'لا توجد منتجات في هذه الفئة.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
