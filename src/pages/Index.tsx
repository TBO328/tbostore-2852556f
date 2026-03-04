import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, Loader2, Shield, Zap, Headphones, ChevronDown, Gamepad2, CreditCard, Tv, Gift } from 'lucide-react';
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
import PartnersStrip from '@/components/PartnersStrip';

const Index: React.FC = () => {
  const { t, language } = useLanguage();
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(8);
  const { reviews, loading: reviewsLoading } = useReviews(true);
  const displayReviews = reviews.slice(0, 3);
  const { getText } = useMultiplePageContent(['hero', 'products_section', 'about', 'reviews_section']);

  const categories = [
    { icon: Gamepad2, labelEn: 'Gaming', labelAr: 'ألعاب', color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'border-emerald-500/30' },
    { icon: CreditCard, labelEn: 'Gift Cards', labelAr: 'بطاقات شحن', color: 'from-cyan-500/20 to-blue-500/20', borderColor: 'border-cyan-500/30' },
    { icon: Tv, labelEn: 'Streaming', labelAr: 'بث مباشر', color: 'from-violet-500/20 to-purple-500/20', borderColor: 'border-violet-500/30' },
    { icon: Gift, labelEn: 'Subscriptions', labelAr: 'اشتراكات', color: 'from-amber-500/20 to-orange-500/20', borderColor: 'border-amber-500/30' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* === HERO === */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
          {/* Logo watermark */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }} 
            animate={{ opacity: 0.06, scale: 1, rotate: 0 }} 
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} 
            className="absolute left-[55%] top-[55%] -translate-x-1/2 -translate-y-1/2 z-0 hidden md:block"
          >
            <img src={tboStoreLogo} alt="" className="w-96 md:w-[500px] lg:w-[700px] xl:w-[900px] h-auto" />
          </motion.div>

          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-15">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--neon-cyan) / 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--neon-cyan) / 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px'
              }} />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, 30, 0] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
              className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-cyan/20 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2], x: [0, -30, 0] }} 
              transition={{ duration: 6, repeat: Infinity, delay: 1, ease: "easeInOut" }} 
              className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-magenta/20 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }} 
              transition={{ duration: 5, repeat: Infinity, delay: 2 }} 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-3xl" 
            />
          </div>

          {/* Glowing Rings */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/20"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-secondary/20"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2], rotate: [360, 180, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          <div className="container mx-auto px-4 relative z-10 pt-24 pb-16">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-center">
              {/* Left: Category Cards */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-2 gap-3 sm:gap-4 order-2 lg:order-1"
              >
                {categories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className={`relative p-5 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.borderColor} backdrop-blur-sm cursor-pointer group overflow-hidden`}
                    >
                      <Link to="/products" className="block">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-foreground/80 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-display text-sm md:text-base font-bold text-foreground">
                          {language === 'ar' ? cat.labelAr : cat.labelEn}
                        </h3>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Right: Text Content */}
              <div className="text-center lg:text-right order-1 lg:order-2">
                <AnimatedSection delay={0.1}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                  >
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 px-2">
                      <motion.span 
                        className="text-foreground block mb-2 md:mb-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        {getText('hero', 'heroTitle', t('heroTitle')).split('\n')[0]}
                      </motion.span>
                      <motion.span 
                        className="text-gradient-neon glow-text-cyan block"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        {getText('hero', 'heroTitle', t('heroTitle')).split('\n')[1] || 'TBO STORE'}
                      </motion.span>
                    </h1>
                  </motion.div>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto lg:mr-0 leading-relaxed px-2"
                  >
                    {getText('hero', 'heroSubtitle', t('heroSubtitle'))}
                  </motion.p>
                </AnimatedSection>

                {/* CTA Buttons */}
                <AnimatedSection delay={0.4}>
                  <motion.div 
                    className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-3 sm:gap-4 mb-10 md:mb-16 px-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <Link to="/products">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl text-primary-foreground font-bold text-base sm:text-lg overflow-hidden shadow-2xl shadow-primary/30 w-full sm:w-auto text-center"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {t('shopNow')}
                          <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <ArrowRight className="w-5 h-5" />
                          </motion.span>
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-secondary to-primary"
                          initial={{ x: "100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.button>
                    </Link>
                    <Link to="/portfolio">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-primary/50 rounded-2xl text-foreground font-bold text-base sm:text-lg backdrop-blur-sm hover:border-primary hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto text-center"
                      >
                        {t('exploreMore')}
                      </motion.button>
                    </Link>
                  </motion.div>
                </AnimatedSection>

                {/* Stats */}
                <AnimatedSection delay={0.5}>
                  <div className="flex flex-wrap justify-center lg:justify-end gap-6 sm:gap-8 px-2">
                    {[
                      { value: getText('hero', 'productsCount', '500+'), label: language === 'en' ? 'Products' : 'منتج', color: 'primary' },
                      { value: getText('hero', 'customersCount', '10K+'), label: language === 'en' ? 'Customers' : 'عميل', color: 'secondary' },
                      { value: getText('hero', 'ratingValue', '4.9★'), label: language === 'en' ? 'Rating' : 'تقييم', color: 'accent' },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 + index * 0.1, duration: 0.5, type: "spring" }}
                        whileHover={{ y: -6, scale: 1.05 }}
                        className={`px-5 sm:px-8 py-3 sm:py-4 rounded-2xl bg-${stat.color}/10 border border-${stat.color}/20 backdrop-blur-md cursor-pointer`}
                      >
                        <div className={`font-display text-xl sm:text-3xl font-black text-${stat.color}`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Trust Strip */}
        <section className="py-6 border-y border-border/30 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {[
                { icon: Shield, textEn: 'Secure Payment', textAr: 'دفع آمن' },
                { icon: Zap, textEn: 'Instant Delivery', textAr: 'تسليم فوري' },
                { icon: Headphones, textEn: '24/7 Support', textAr: 'دعم متواصل' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 text-muted-foreground">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{language === 'ar' ? item.textAr : item.textEn}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-32 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
                  {getText('products_section', 'featuredProducts', t('featuredProducts'))}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                  {getText('products_section', 'featuredDescription', language === 'en' ? 'Discover our handpicked selection of premium products.' : 'اكتشف مجموعتنا المختارة من المنتجات الفاخرة.')}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 md:mb-12">
              {productsLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                featuredProducts.slice(0, 4).map((product, index) => (
                  <AnimatedSection key={product.id} delay={index * 0.1}>
                    <ProductCard product={product} />
                  </AnimatedSection>
                ))
              )}
            </div>

            <div className="text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/products">
                  <Button variant="neon" size="lg" className="group">
                    {getText('products_section', 'viewAllProducts', language === 'en' ? 'View All Products' : 'عرض جميع المنتجات')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Partners */}
        <PartnersStrip />

        {/* Reviews - Original Style */}
        <section className="py-12 md:py-32 bg-background relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
                  {getText('reviews_section', 'customerReviews', t('customerReviews'))}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground px-2">
                  {getText('reviews_section', 'reviewsDescription', language === 'en' ? 'What our customers say about us.' : 'ماذا يقول عملاؤنا عنا.')}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
              {reviewsLoading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : displayReviews.length > 0 ? (
                displayReviews.map((review, index) => (
                  <AnimatedSection key={review.id} delay={index * 0.1}>
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-card rounded-2xl p-4 sm:p-6 border border-border">
                      <div className="flex gap-1 mb-4">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                        ))}
                      </div>
                      <p className="text-foreground mb-6">
                        "{language === 'ar' ? review.review_text_ar : (review.review_text_en || review.review_text_ar)}"
                      </p>
                      <div className="flex items-center gap-3">
                        {review.customer_avatar ? (
                          <img 
                            src={review.customer_avatar} 
                            alt={review.customer_name} 
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/50" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/50">
                            <span className="text-primary font-bold">{review.customer_name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="font-semibold text-foreground">{review.customer_name}</div>
                      </div>
                    </motion.div>
                  </AnimatedSection>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  {getText('reviews_section', `empty_${language}`, language === 'en' ? 'No reviews yet. Be the first to share your experience!' : 'لا توجد تقييمات بعد. كن أول من يشارك تجربته!')}
                </div>
              )}
            </div>

            <div className="text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/reviews">
                  <Button variant="neon" size="lg" className="group">
                    {getText('reviews_section', `button_${language}`, language === 'en' ? 'Read All Reviews' : 'اقرأ جميع التقييمات')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
