import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import sarSymbol from '@/assets/sar-symbol.png';

interface StreamerPackage {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  category: string;
  category_ar: string;
}

interface PackageCategory {
  category: string;
  category_ar: string;
  packages: StreamerPackage[];
}

const AllPackagesSection: React.FC = () => {
  const { language } = useLanguage();
  const { currency, exchangeRate } = useCurrency();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [packagesByCategory, setPackagesByCategory] = useState<PackageCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const symbolFilter = theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)';

  // Track previous prices for animation
  const previousPricesRef = useRef<Record<string, number>>({});
  const [animatingPrices, setAnimatingPrices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAllPackages();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('all_packages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streamer_packages'
        },
        () => {
          fetchAllPackages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('streamer_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Group packages by category
        const grouped: Record<string, PackageCategory> = {};
        
        data.forEach(pkg => {
          const categoryKey = pkg.category || 'streamers';
          if (!grouped[categoryKey]) {
            grouped[categoryKey] = {
              category: pkg.category || 'streamers',
              category_ar: pkg.category_ar || 'باقات الستريمرز',
              packages: []
            };
          }
          grouped[categoryKey].packages.push(pkg);
          
          // Track prices for animation
          const prevPrice = previousPricesRef.current[pkg.id];
          if (prevPrice !== undefined && prevPrice !== pkg.price) {
            setAnimatingPrices(prev => ({ ...prev, [pkg.id]: true }));
            setTimeout(() => {
              setAnimatingPrices(prev => ({ ...prev, [pkg.id]: false }));
            }, 600);
          }
          previousPricesRef.current[pkg.id] = pkg.price;
        });

        setPackagesByCategory(Object.values(grouped));
      } else {
        setPackagesByCategory([]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInSAR: number) => {
    if (currency === 'SAR') {
      return (
        <span className="flex items-center justify-center gap-1 font-cairo">
          {priceInSAR.toFixed(2)}
          <img 
            src={sarSymbol} 
            alt="SAR" 
            className="inline-block h-5 w-5" 
            style={{ filter: symbolFilter }} 
          />
        </span>
      );
    }
    const priceInUSD = priceInSAR / exchangeRate;
    return <span className="font-cairo">${priceInUSD.toFixed(2)}</span>;
  };

  const handlePackageClick = (pkgId: string) => {
    navigate(`/streamer-package/${pkgId}`);
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (packagesByCategory.length === 0) {
    return null;
  }

  return (
    <div className="py-16 space-y-20">
      {packagesByCategory.map((categoryGroup, categoryIndex) => (
        <motion.div 
          key={categoryGroup.category}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          className="space-y-8"
        >
          {/* Category Title */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-cairo text-3xl md:text-4xl font-bold text-foreground mb-3">
              {language === 'en' 
                ? (categoryGroup.category === 'streamers' ? 'Streamer Packages' : categoryGroup.category.replace(/_/g, ' '))
                : categoryGroup.category_ar
              }
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="bg-[#1a1a2e] text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 font-cairo">
                LIVE
                <span className="w-2.5 h-2.5 bg-[#00d4aa] rounded-full animate-pulse" />
              </span>
            </div>
          </motion.div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1600px] mx-auto px-4" dir="rtl">
            {categoryGroup.packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  transition: { duration: 0.3 } 
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePackageClick(pkg.id)}
                className="flex flex-col items-center cursor-pointer group"
              >
                {/* Package Image */}
                <motion.div 
                  className="relative w-full"
                  whileHover={{
                    filter: "brightness(1.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  {pkg.image_url ? (
                    <img 
                      src={pkg.image_url} 
                      alt={language === 'en' ? pkg.name_en : pkg.name_ar}
                      className="w-full h-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:drop-shadow-[0_20px_50px_rgba(0,212,170,0.3)]"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center">
                      <span className="text-muted-foreground font-cairo">
                        {language === 'en' ? pkg.name_en : pkg.name_ar}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Price Tag with Animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-4 px-6 py-2 bg-primary/10 border border-primary/30 rounded-full overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${pkg.id}-${pkg.price}-${currency}`}
                      initial={animatingPrices[pkg.id] ? { y: -20, opacity: 0 } : false}
                      animate={{ 
                        y: 0, 
                        opacity: 1,
                        scale: animatingPrices[pkg.id] ? [1, 1.2, 1] : 1,
                        color: animatingPrices[pkg.id] && currency === 'SAR' 
                          ? ['hsl(var(--primary))', 'hsl(45, 100%, 50%)', 'hsl(var(--primary))'] 
                          : 'hsl(var(--primary))'
                      }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-primary font-bold text-lg block"
                    >
                      {pkg.price === 0 
                        ? (language === 'en' ? 'Contact Us' : 'تواصل معنا')
                        : formatPrice(pkg.price)
                      }
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AllPackagesSection;
