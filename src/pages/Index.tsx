import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Loader2 } from 'lucide-react';
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
import AllPackagesSection from '@/components/AllPackagesSection';

const Index: React.FC = () => {
  const { t, language } = useLanguage();
  
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(4);
  const { reviews, loading: reviewsLoading } = useReviews(true);
  const displayReviews = reviews.slice(0, 3);
  
  // جلب محتوى الصفحات من قاعدة البيانات مع التحديث التلقائي
  const { getText } = useMultiplePageContent(['hero', 'products_section', 'about', 'reviews_section']);
  
  return <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
          {/* Logo on the left with transparency */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }} 
            animate={{ opacity: 0.06, scale: 1, rotate: 0 }} 
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} 
            className="absolute left-[55%] top-[55%] -translate-x-1/2 -translate-y-1/2 z-0 hidden md:block"
          >
            <img src={tboStoreLogo} alt="TBO Store Logo" className="w-96 md:w-[500px] lg:w-[700px] xl:w-[900px] h-auto" />
          </motion.div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Neon Grid */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--neon-cyan) / 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--neon-cyan) / 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px'
              }} />
            </div>


            {/* Floating Orbs */}
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

          <div className="container mx-auto px-4 relative z-10 pt-20">
            <div className="max-w-4xl mx-auto text-center">
              <AnimatedSection>
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                  animate={{ scale: 1, opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2, duration: 0.6 }} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 backdrop-blur-md rounded-full border border-primary/30 mb-8 shadow-lg shadow-primary/10"
                >
                  <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Sparkles className="w-5 h-5 text-primary" />
                  </motion.div>
                  <span className="text-sm font-medium text-primary">
                    {getText('hero', 'premiumBadge', language === 'en' ? 'Premium Quality Products' : 'منتجات عالية الجودة')}
                  </span>
                </motion.div>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <motion.span 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-foreground block"
                  >
                    {getText('hero', 'heroTitle', t('heroTitle')).split('\n')[0]}
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-gradient-neon glow-text-cyan block mt-2"
                  >
                    {getText('hero', 'heroTitle', t('heroTitle')).split('\n')[1] || 'TBO STORE'}
                  </motion.span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-lg md:text-xl text-muted-foreground mb-4"
                >
                  {getText('hero', 'heroSubtitle', t('heroSubtitle'))}
                </motion.p>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="text-base text-muted-foreground/80 max-w-2xl mx-auto mb-10"
                >
                  {getText('hero', 'heroDescription', t('heroDescription'))}
                </motion.p>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(var(--primary) / 0.5)" }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/products">
                      <Button variant="neon-filled" size="lg" className="group">
                        {t('shopNow')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/about">
                      <Button variant="neon" size="lg">
                        {t('exploreMore')}
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </AnimatedSection>

              {/* Stats */}
              <AnimatedSection delay={0.5}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="grid grid-cols-3 gap-4 md:gap-8 mt-16 pt-8 border-t border-border/50"
                >
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }} 
                    className="text-center p-3 rounded-xl bg-primary/5 backdrop-blur-sm border border-primary/10"
                  >
                    <div className="font-display text-3xl md:text-4xl font-bold text-primary glow-text-cyan">
                      {getText('hero', 'productsCount', '500+')}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {language === 'en' ? 'Products' : 'منتج'}
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }} 
                    className="text-center p-3 rounded-xl bg-secondary/5 backdrop-blur-sm border border-secondary/10"
                  >
                    <div className="font-display text-3xl md:text-4xl font-bold text-secondary glow-text-magenta">
                      {getText('hero', 'customersCount', '10K+')}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {language === 'en' ? 'Customers' : 'عميل'}
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }} 
                    className="text-center p-3 rounded-xl bg-accent/5 backdrop-blur-sm border border-accent/10"
                  >
                    <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                      {getText('hero', 'ratingValue', '4.9★')}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {language === 'en' ? 'Rating' : 'تقييم'}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 2, duration: 1.5, repeat: Infinity }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </div>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* All Packages Section */}
        <AllPackagesSection />

        {/* Featured Products Preview */}
        <section className="py-20 md:py-32 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                  {getText('products_section', 'featuredProducts', t('featuredProducts'))}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {getText('products_section', 'featuredDescription', language === 'en' ? 'Discover our handpicked selection of premium products.' : 'اكتشف مجموعتنا المختارة من المنتجات الفاخرة.')}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {productsLoading ? (
                <div className="col-span-4 flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                featuredProducts.map((product, index) => (
                  <AnimatedSection key={product.id} delay={index * 0.1}>
                    <ProductCard product={product} />
                  </AnimatedSection>
                ))
              )}
            </div>

            <div className="text-center">
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
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

        {/* About Preview */}
        <section className="py-20 md:py-32 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-neon-cyan/50 to-transparent" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-neon-magenta/50 to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <AnimatedSection>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                  {getText('about', 'aboutTitle', t('aboutTitle'))}
                </h2>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {getText('about', 'aboutDescription', t('aboutDescription'))}
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <motion.div whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <Link to="/about">
                    <Button variant="neon" size="lg" className="group">
                      {getText('about', 'learnMore', language === 'en' ? 'Learn More' : 'اعرف المزيد')}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Partners Strip */}
        <PartnersStrip />

        {/* Reviews Preview */}
        <section className="py-20 md:py-32 bg-background relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                  {getText('reviews_section', 'customerReviews', t('customerReviews'))}
                </h2>
                <p className="text-muted-foreground">
                  {getText('reviews_section', 'reviewsDescription', language === 'en' ? 'What our customers say about us.' : 'ماذا يقول عملاؤنا عنا.')}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {reviewsLoading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : displayReviews.length > 0 ? (
                displayReviews.map((review, index) => (
                  <AnimatedSection key={review.id} delay={index * 0.1}>
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-card rounded-2xl p-6 border border-border">
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
                            <span className="text-primary font-bold">
                              {review.customer_name.charAt(0)}
                            </span>
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
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
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
    </div>;
};
export default Index;