import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, Loader2, Shield, Zap, Headphones, ChevronDown, Gamepad2, CreditCard, Paintbrush, Gift, ChevronsLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import ProductCard from '@/components/ProductCard';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useReviews } from '@/hooks/useReviews';
import { useMultiplePageContent } from '@/hooks/usePageContent';
import tboStoreLogo from '@/assets/tbo-store-logo.png';
import heroBgPattern from '@/assets/hero-bg-pattern.jpg';
import PartnersStrip from '@/components/PartnersStrip';

const Index: React.FC = () => {
  const { t, language } = useLanguage();
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(8);
  const { reviews, loading: reviewsLoading } = useReviews(true);
  const displayReviews = reviews.slice(0, 6);
  const { getText } = useMultiplePageContent(['hero', 'products_section', 'about', 'reviews_section']);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  const categories = [
  { icon: Gamepad2, labelEn: 'Gaming', labelAr: 'ألعاب', color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'border-emerald-500/30' },
  { icon: CreditCard, labelEn: 'Gift Cards', labelAr: 'بطاقات شحن', color: 'from-cyan-500/20 to-blue-500/20', borderColor: 'border-cyan-500/30' },
  { icon: Paintbrush, labelEn: 'Designs', labelAr: 'تصاميم', color: 'from-violet-500/20 to-purple-500/20', borderColor: 'border-violet-500/30' },
  { icon: Gift, labelEn: 'Subscriptions', labelAr: 'اشتراكات', color: 'from-amber-500/20 to-orange-500/20', borderColor: 'border-amber-500/30' }];


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* === HERO: Immersive Full-Screen === */}
        <section className="relative min-h-[100svh] overflow-hidden flex items-center justify-start">
          {/* Background Image with Parallax */}
          <motion.div
            className="absolute inset-0 z-0"
            style={{ opacity: heroOpacity, scale: heroScale }}>
            
            <img
              src={heroBgPattern}
              alt=""
              className="w-full h-full object-cover opacity-40" />
            
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          </motion.div>

          {/* Watermark Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04 }}
            transition={{ duration: 2 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[-10%] z-0 hidden lg:block">
            
            <img src={tboStoreLogo} alt="" className="w-[600px] h-auto" />
          </motion.div>

          {/* Main Content - Asymmetric Layout */}
          <div className="container mx-auto px-4 relative z-10 pt-24 pb-16">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-16 items-center min-h-[70vh]">
              {/* Left: Text Content */}
              <div className={`${language === 'ar' ? 'lg:order-2 text-right' : 'lg:order-1'}`}>
                {/* Accent Line */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className={`h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-8 ${language === 'ar' ? 'ml-auto' : ''}`} />
                

                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
                  
                  <span className="text-foreground block">
                    {getText('hero', 'heroTitle', t('heroTitle')).split('\n')[0]}
                  </span>
                  <span className="text-gradient-neon block mt-2">
                    {getText('hero', 'heroTitle', t('heroTitle')).split('\n')[1] || 'TBO STORE'}
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
                  
                  {getText('hero', 'heroSubtitle', t('heroSubtitle'))}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="flex flex-wrap gap-4 mb-12">
                  
                  <Link to="/products">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 flex items-center gap-3 group">
                      
                      {t('shopNow')}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  <Link to="/portfolio">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-8 py-4 border border-border/60 rounded-xl text-foreground font-semibold text-lg backdrop-blur-sm hover:border-primary/50 hover:bg-primary/5 transition-all">
                      
                      {t('exploreMore')}
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Inline Stats - Horizontal Strip */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="flex items-center gap-6 md:gap-10">
                  
                  {[
                  { value: getText('hero', 'productsCount', '500+'), label: language === 'en' ? 'Products' : 'منتج' },
                  { value: getText('hero', 'customersCount', '10K+'), label: language === 'en' ? 'Customers' : 'عميل' },
                  { value: getText('hero', 'ratingValue', '4.9★'), label: language === 'en' ? 'Rating' : 'تقييم' }].
                  map((stat, i) =>
                  <div key={i} className={`${i > 0 ? 'border-' + (language === 'ar' ? 'r' : 'l') + ' border-border/40 pl-6 md:pl-10' : ''}`}>
                      <div className="font-display text-2xl md:text-3xl font-black text-primary">{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right: Category Quick-Access Cards */}
              <motion.div
                initial={{ opacity: 0, x: language === 'ar' ? -60 : 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`grid grid-cols-2 gap-4 ${language === 'ar' ? 'lg:order-1' : 'lg:order-2'}`}>
                
                {categories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.borderColor} backdrop-blur-sm cursor-pointer group overflow-hidden`}>
                      
                      <Link to="/products" className="block">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-foreground/80 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-display text-sm md:text-base font-bold text-foreground">
                          {language === 'ar' ? cat.labelAr : cat.labelEn}
                        </h3>
                      </Link>
                    </motion.div>);

                })}
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}>
            
            <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>
        </section>

        {/* === TRUST STRIP === */}
        <section className="py-6 border-y border-border/30 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {[
              { icon: Shield, textEn: 'Secure Payment', textAr: 'دفع آمن' },
              { icon: Zap, textEn: 'Instant Delivery', textAr: 'تسليم فوري' },
              { icon: Headphones, textEn: '24/7 Support', textAr: 'دعم متواصل' }].
              map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 text-muted-foreground">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{language === 'ar' ? item.textAr : item.textEn}</span>
                  </div>);

              })}
            </div>
          </div>
        </section>

        {/* === FEATURED PRODUCTS === */}
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {getText('products_section', 'featuredProducts', t('featuredProducts'))}
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    {getText('products_section', 'featuredDescription', language === 'en' ? 'Discover our handpicked selection of premium products.' : 'اكتشف مجموعتنا المختارة من المنتجات الفاخرة.')}
                  </p>
                </div>
                <Link to="/products">
                  <Button variant="neon" size="lg" className="group shrink-0">
                    {language === 'en' ? 'View All' : 'عرض الكل'}
                    <ChevronsLeft className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {productsLoading ?
              <div className="col-span-full flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div> :

              featuredProducts.map((product, index) =>
              <AnimatedSection key={product.id} delay={index * 0.05}>
                    <ProductCard product={product} />
                  </AnimatedSection>
              )
              }
            </div>
          </div>
        </section>

        {/* Partners */}
        <PartnersStrip />

        {/* === REVIEWS - Modern Card Grid === */}
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {getText('reviews_section', 'customerReviews', t('customerReviews'))}
                  </h2>
                  <p className="text-muted-foreground">
                    {getText('reviews_section', 'reviewsDescription', language === 'en' ? 'What our customers say about us.' : 'ماذا يقول عملاؤنا عنا.')}
                  </p>
                </div>
                <Link to="/reviews">
                  <Button variant="neon" size="lg" className="group shrink-0">
                    {language === 'en' ? 'All Reviews' : 'كل التقييمات'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {reviewsLoading ?
              <div className="col-span-full flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div> :
              displayReviews.length > 0 ?
              displayReviews.map((review, index) =>
              <AnimatedSection key={review.id} delay={index * 0.05}>
                    <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, i) =>
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-border'}`} />

                    )}
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-foreground/90 text-sm leading-relaxed mb-4 line-clamp-3">
                        "{language === 'ar' ? review.review_text_ar : review.review_text_en || review.review_text_ar}"
                      </p>
                      
                      {/* Author */}
                      <div className="flex items-center gap-3">
                        {review.customer_avatar ?
                    <img
                      src={review.customer_avatar}
                      alt={review.customer_name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20" /> :


                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {review.customer_name.charAt(0)}
                          </div>
                    }
                        <span className="text-sm font-medium text-foreground">{review.customer_name}</span>
                      </div>
                    </motion.div>
                  </AnimatedSection>
              ) :

              <div className="col-span-full text-center py-16 text-muted-foreground">
                  {language === 'en' ? 'No reviews yet.' : 'لا توجد تقييمات بعد.'}
                </div>
              }
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>);

};

export default Index;