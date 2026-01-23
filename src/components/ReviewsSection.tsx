import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReviews } from '@/hooks/useReviews';

const fallbackReviews = [
  {
    id: '1',
    customer_name: 'سارة جونسون',
    customer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    review_text_en: 'Absolutely love my purchase! The quality exceeded my expectations. Fast shipping and beautiful packaging. Will definitely order again!',
    review_text_ar: 'أحببت مشترياتي كثيراً! الجودة تجاوزت توقعاتي. شحن سريع وتغليف جميل. سأطلب مرة أخرى بالتأكيد!',
    product_name_en: 'Wireless Pro Headphones',
    product_name_ar: 'سماعات لاسلكية برو',
    is_approved: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    customer_name: 'محمد الراشد',
    customer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5,
    review_text_en: 'Best online shopping experience ever! The customer service was incredibly helpful and the product arrived in perfect condition.',
    review_text_ar: 'أفضل تجربة تسوق عبر الإنترنت! خدمة العملاء كانت مفيدة للغاية والمنتج وصل بحالة ممتازة.',
    product_name_en: 'Smart Watch Ultra',
    product_name_ar: 'ساعة ذكية ألترا',
    is_approved: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    customer_name: 'إيميلي تشين',
    customer_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5,
    review_text_en: 'The attention to detail is remarkable. Every product feels premium and the neon aesthetic of the store is just stunning!',
    review_text_ar: 'الاهتمام بالتفاصيل رائع. كل منتج يبدو فاخراً والتصميم النيون للمتجر مذهل!',
    product_name_en: 'Designer Sunglasses',
    product_name_ar: 'نظارات شمسية مصممة',
    is_approved: true,
    created_at: new Date().toISOString(),
  },
];

const ReviewsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { reviews: dbReviews, loading } = useReviews(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });
  const glareX = useTransform(mouseX, [-0.5, 0.5], [100, 0]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [100, 0]);
  
  // Dynamic shadow
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [25, -25]), { stiffness: 300, damping: 30 });
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), { stiffness: 300, damping: 30 });
  
  // Pre-compute transforms at top level (React hooks rule)
  const dynamicShadow = useTransform(
    [shadowX, shadowY],
    ([x, y]) => `${x}px ${y}px 40px -5px hsl(var(--primary) / 0.25), 0 15px 50px -15px hsl(var(--primary) / 0.2)`
  );
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, hsl(var(--primary) / 0.12), transparent 50%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPaused(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsPaused(true);
  };

  const reviews = dbReviews.length > 0 ? dbReviews : fallbackReviews;

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, reviews.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[currentIndex];

  return (
    <section id="reviews" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('customerReviews')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'See what our customers have to say about their shopping experience.'
              : 'شاهد ما يقوله عملاؤنا عن تجربة التسوق الخاصة بهم.'}
          </p>
        </div>

        {/* Single Review Card with 3D Animation */}
        <div 
          className="max-w-3xl mx-auto relative"
          style={{ perspective: '1000px' }}
        >
          {/* Navigation Arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              ref={cardRef}
              key={currentReview?.id || currentIndex}
              initial={{ opacity: 0, x: 50, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -50, rotateY: 15 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
                transformStyle: 'preserve-3d',
                boxShadow: isHovered ? dynamicShadow : '0 4px 30px -5px hsl(var(--primary) / 0.1)',
              }}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative bg-gradient-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-colors duration-500"
            >
              {/* 3D Glare Effect */}
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none rounded-2xl opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isHovered ? 1 : 0,
                  background: glareBackground,
                }}
              />

              {/* Quote Icon with 3D depth */}
              <motion.div 
                className="absolute top-4 right-4 text-primary/20"
                style={{ transform: 'translateZ(30px)' }}
              >
                <Quote className="w-12 h-12" />
              </motion.div>

              {/* Content with 3D depth */}
              <div style={{ transform: 'translateZ(20px)' }}>
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(currentReview?.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-foreground text-lg mb-6 leading-relaxed min-h-[80px]">
                  "{language === 'ar' 
                    ? (currentReview?.review_text_ar || currentReview?.review_text_en)
                    : (currentReview?.review_text_en || currentReview?.review_text_ar)
                  }"
                </p>

                {/* Product Tag */}
                {(currentReview?.product_name_en || currentReview?.product_name_ar) && (
                  <div className="inline-block px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground mb-6">
                    {language === 'ar' 
                      ? (currentReview?.product_name_ar || currentReview?.product_name_en)
                      : (currentReview?.product_name_en || currentReview?.product_name_ar)
                    }
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <motion.img
                    src={currentReview?.customer_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'}
                    alt={currentReview?.customer_name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/50"
                    style={{ transform: 'translateZ(40px)' }}
                    whileHover={{ scale: 1.1 }}
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {currentReview?.customer_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Verified Buyer' : 'مشتري موثق'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements with depth */}
              <motion.div
                className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl pointer-events-none"
                style={{ transform: 'translateZ(-10px)' }}
              />
              <motion.div
                className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-xl pointer-events-none"
                style={{ transform: 'translateZ(-10px)' }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-primary w-6' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
