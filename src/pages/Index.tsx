import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Loader2, Shield, Zap, Headphones } from 'lucide-react';
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
            <div className="max-w-5xl mx-auto text-center">
              {/* Glowing Ring Animation */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-secondary/20"
                animate={{ 
                  scale: [1.1, 1, 1.1],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [360, 180, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />

              {/* Main Title */}
              <AnimatedSection delay={0.1}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                >
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
                    <motion.span 
                      className="text-foreground block mb-4"
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

              {/* Subtitle with Gradient Text */}
              <AnimatedSection delay={0.3}>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
                >
                  {getText('hero', 'heroSubtitle', t('heroSubtitle'))}
                </motion.p>
              </AnimatedSection>

              {/* CTA Buttons - Redesigned */}
              <AnimatedSection delay={0.4}>
                <motion.div 
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Link to="/products">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative px-10 py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl text-primary-foreground font-bold text-lg overflow-hidden shadow-2xl shadow-primary/30"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {t('shopNow')}
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
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
                  <Link to="/about">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 border-2 border-primary/50 rounded-2xl text-foreground font-bold text-lg backdrop-blur-sm hover:border-primary hover:bg-primary/10 transition-all duration-300"
                    >
                      {t('exploreMore')}
                    </motion.button>
                  </Link>
                </motion.div>
              </AnimatedSection>

              {/* Floating Stats Cards */}
              <AnimatedSection delay={0.5}>
                <div className="flex flex-wrap justify-center gap-6">
                  {[
                    { value: getText('hero', 'productsCount', '500+'), label: language === 'en' ? 'Products' : 'منتج', color: 'primary', delay: 0 },
                    { value: getText('hero', 'customersCount', '10K+'), label: language === 'en' ? 'Customers' : 'عميل', color: 'secondary', delay: 0.1 },
                    { value: getText('hero', 'ratingValue', '4.9★'), label: language === 'en' ? 'Rating' : 'تقييم', color: 'accent', delay: 0.2 },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 40, rotateX: -30 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 1.3 + stat.delay, duration: 0.5, type: "spring" }}
                      whileHover={{ 
                        y: -10, 
                        scale: 1.05,
                        rotateY: 5,
                        boxShadow: `0 20px 40px -10px hsl(var(--${stat.color}) / 0.4)`
                      }}
                      className={`relative px-8 py-5 rounded-2xl bg-gradient-to-br from-${stat.color}/10 to-${stat.color}/5 border border-${stat.color}/20 backdrop-blur-md cursor-pointer group`}
                      style={{ perspective: '1000px' }}
                    >
                      <div className={`font-display text-3xl md:text-4xl font-black text-${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                      {/* Glow Effect */}
                      <motion.div
                        className={`absolute inset-0 rounded-2xl bg-${stat.color}/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>


          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Features Strip - Premium Design */}
        <section className="py-16 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { 
                  icon: Shield, 
                  titleEn: 'Secure Payment', 
                  titleAr: 'دفع آمن',
                  descEn: 'Your transactions are protected',
                  descAr: 'معاملاتك محمية بالكامل',
                  color: 'primary',
                  delay: 0
                },
                { 
                  icon: Zap, 
                  titleEn: 'Instant Delivery', 
                  titleAr: 'تسليم فوري',
                  descEn: 'Get your digital products instantly',
                  descAr: 'احصل على منتجاتك الرقمية فوراً',
                  color: 'secondary',
                  delay: 0.1
                },
                { 
                  icon: Headphones, 
                  titleEn: '24/7 Support', 
                  titleAr: 'دعم متواصل',
                  descEn: 'We are here to help you',
                  descAr: 'نحن هنا لمساعدتك',
                  color: 'accent',
                  delay: 0.2
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <AnimatedSection key={index} delay={feature.delay}>
                    <motion.div
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.3, ease: "easeOut" }
                      }}
                      className="relative group"
                    >
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 bg-${feature.color}/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-2xl p-8 border border-border/50 group-hover:border-primary/30 transition-all duration-500">
                        {/* Icon container with animation */}
                        <motion.div 
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br from-${feature.color}/20 to-${feature.color}/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500`}
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className={`w-8 h-8 text-${feature.color}`} />
                        </motion.div>
                        
                        {/* Title */}
                        <h3 className="font-display text-xl font-bold text-foreground text-center mb-2">
                          {language === 'en' ? feature.titleEn : feature.titleAr}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-muted-foreground text-center text-sm">
                          {language === 'en' ? feature.descEn : feature.descAr}
                        </p>
                        
                        {/* Bottom accent line */}
                        <motion.div 
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-${feature.color} to-transparent rounded-full`}
                          initial={{ width: 0, opacity: 0 }}
                          whileInView={{ width: '60%', opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: feature.delay + 0.3 }}
                        />
                      </div>
                    </motion.div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

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