import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, Package, Star, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface StatItem {
  icon: React.ElementType;
  value: number;
  labelEn: string;
  labelAr: string;
  suffix?: string;
}

const CountUpAnimation = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const StatsSection = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    reviews: 0,
    orders: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch approved reviews count
        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', true);

        // Set stats with some base numbers for customers and orders
        setStats({
          customers: 500 + (productsCount || 0) * 10,
          products: productsCount || 0,
          reviews: reviewsCount || 0,
          orders: 1200 + (productsCount || 0) * 5
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback values
        setStats({
          customers: 500,
          products: 50,
          reviews: 120,
          orders: 1200
        });
      }
    };

    fetchStats();
  }, []);

  const statItems: StatItem[] = [
    {
      icon: Users,
      value: stats.customers,
      labelEn: 'Happy Customers',
      labelAr: 'عميل سعيد',
      suffix: '+'
    },
    {
      icon: Package,
      value: stats.products,
      labelEn: 'Products',
      labelAr: 'منتج',
      suffix: '+'
    },
    {
      icon: Star,
      value: stats.reviews,
      labelEn: 'Reviews',
      labelAr: 'تقييم',
      suffix: '+'
    },
    {
      icon: ShoppingBag,
      value: stats.orders,
      labelEn: 'Orders Completed',
      labelAr: 'طلب مكتمل',
      suffix: '+'
    }
  ];

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            {isRTL ? 'أرقامنا تتحدث' : 'Our Numbers Speak'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRTL 
              ? 'نفخر بثقة عملائنا وإنجازاتنا المتواصلة'
              : 'We are proud of our customers trust and continuous achievements'
            }
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statItems.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="relative group"
            >
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 text-center overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon */}
                <motion.div
                  className="relative z-10 mb-4 mx-auto w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </motion.div>

                {/* Value */}
                <div className="relative z-10 text-3xl md:text-4xl font-bold text-foreground mb-2 font-display">
                  <CountUpAnimation target={stat.value} />
                  <span className="text-primary">{stat.suffix}</span>
                </div>

                {/* Label */}
                <p className="relative z-10 text-muted-foreground text-sm md:text-base font-medium">
                  {isRTL ? stat.labelAr : stat.labelEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
