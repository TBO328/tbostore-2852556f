import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import ReviewForm from '@/components/ReviewForm';
import { useReviews } from '@/hooks/useReviews';

const Reviews: React.FC = () => {
  const { language } = useLanguage();
  const { reviews, loading } = useReviews(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-hero relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
                  {language === 'en' ? 'Customer ' : 'تقييمات '}
                  <span className="text-gradient-neon glow-text-cyan">
                    {language === 'en' ? 'Reviews' : 'العملاء'}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  {language === 'en'
                    ? 'See what our customers have to say about their shopping experience.'
                    : 'شاهد ما يقوله عملاؤنا عن تجربة التسوق الخاصة بهم.'}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-card/50 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-8 text-center">
              <AnimatedSection delay={0.1}>
                <div className="font-display text-4xl md:text-5xl font-bold text-primary glow-text-cyan">4.9</div>
                <div className="flex justify-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Average Rating' : 'متوسط التقييم'}
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="font-display text-4xl md:text-5xl font-bold text-secondary glow-text-magenta">10K+</div>
                <div className="text-sm text-muted-foreground mt-3">
                  {language === 'en' ? 'Happy Customers' : 'عميل سعيد'}
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.3}>
                <div className="font-display text-4xl md:text-5xl font-bold text-accent">98%</div>
                <div className="text-sm text-muted-foreground mt-3">
                  {language === 'en' ? 'Would Recommend' : 'يوصون بنا'}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Add Review Section */}
        <section className="py-16 md:py-24 bg-gradient-hero relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto">
              <AnimatedSection>
                <ReviewForm />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-magenta/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {language === 'en' ? 'What Our Customers Say' : 'ماذا يقول عملاؤنا'}
                </h2>
              </div>
            </AnimatedSection>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review, index) => (
                  <AnimatedSection key={review.id} delay={index * 0.1}>
                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group relative bg-gradient-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-500 neon-glow h-full"
                    >
                      {/* Quote Icon */}
                      <div className="absolute top-4 right-4 text-primary/20">
                        <Quote className="w-12 h-12" />
                      </div>

                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-foreground mb-6 leading-relaxed">
                        "{language === 'ar' ? review.review_text_ar : (review.review_text_en || review.review_text_ar)}"
                      </p>

                      {/* Product Tag */}
                      {(review.product_name_ar || review.product_name_en) && (
                        <div className="inline-block px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground mb-6">
                          {language === 'ar' ? review.product_name_ar : (review.product_name_en || review.product_name_ar)}
                        </div>
                      )}

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        {review.customer_avatar ? (
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={review.customer_avatar}
                            alt={review.customer_name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/50">
                            <span className="text-primary font-bold text-lg">
                              {review.customer_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-foreground">
                            {review.customer_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === 'en' ? 'Verified Buyer' : 'مشتري موثق'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {language === 'en' 
                    ? 'No reviews yet. Be the first to share your experience!' 
                    : 'لا توجد تقييمات بعد. كن أول من يشارك تجربته!'}
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

export default Reviews;
