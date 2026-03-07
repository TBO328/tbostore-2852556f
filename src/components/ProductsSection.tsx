import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { Loader2 } from 'lucide-react';

const ProductsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { products, loading } = useFeaturedProducts(8);

  return (
    <section id="products" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('featuredProducts')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'Explore our curated collection of premium products designed for the modern lifestyle.'
              : 'استكشف مجموعتنا المختارة من المنتجات الفاخرة المصممة لنمط الحياة العصري.'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            {language === 'en' ? 'No products available yet.' : 'لا توجد منتجات متاحة حالياً.'}
          </div>
        )}

        {/* View All Link */}
        {!loading && products.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              {language === 'en' ? 'View All Products' : 'عرض جميع المنتجات'}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
