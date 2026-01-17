import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, Package, Star, Download } from 'lucide-react';
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
    downloads: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', true);

        setStats({
          customers: 500 + (productsCount || 0) * 10,
          products: productsCount || 0,
          reviews: reviewsCount || 0,
          downloads: 1200 + (productsCount || 0) * 5
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          customers: 500,
          products: 50,
          reviews: 120,
          downloads: 1200
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
      labelEn: 'Digital Products',
      labelAr: 'منتج رقمي',
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
      icon: Download,
      value: stats.downloads,
      labelEn: 'Downloads',
      labelAr: 'تحميل',
      suffix: '+'
    }
  ];

  return (
    <section className="relative py-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {statItems.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
              className="relative group"
            >
              <div className="relative bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-4 md:p-5 text-center overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <motion.div
                  className="relative z-10 mb-2 mx-auto w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </motion.div>

                <div className="relative z-10 text-2xl md:text-3xl font-bold text-foreground mb-1 font-display">
                  <CountUpAnimation target={stat.value} />
                  <span className="text-primary text-lg">{stat.suffix}</span>
                </div>

                <p className="relative z-10 text-muted-foreground text-xs md:text-sm font-medium">
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
