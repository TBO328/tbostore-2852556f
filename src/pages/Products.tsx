import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
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
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
                  {language === 'en' ? 'Our ' : 'مجموعة '}
                  <span className="text-gradient-neon glow-text-cyan">
                    {language === 'en' ? 'Products' : 'منتجاتنا'}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  {language === 'en'
                    ? 'Discover our curated collection of premium products designed for the modern lifestyle.'
                    : 'اكتشف مجموعتنا المختارة من المنتجات الفاخرة المصممة لنمط الحياة العصري.'}
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
                {/* Streamer Packages - Show for selected category or All */}
                <AnimatedSection delay={0.2}>
                  <StreamerPackages categoryFilter={activeCategory === 'All' ? null : activeCategory} />
                </AnimatedSection>

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
