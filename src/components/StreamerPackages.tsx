import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStreamerPackages } from '@/hooks/useStreamerPackages';
import { useCategories } from '@/hooks/useCategories';
import sarSymbol from '@/assets/sar-symbol.png';

interface StreamerPackagesProps {
  categoryFilter?: string | null;
}

// 3D Card Component for Streamer Packages
const StreamerPackageCard: React.FC<{
  pkg: any;
  index: number;
  language: string;
  formatPrice: (price: number) => React.ReactNode;
  animatingPrices: Record<string, boolean>;
  currency: string;
  onClick: () => void;
}> = ({ pkg, index, language, formatPrice, animatingPrices, currency, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animations
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });

  // Glare effect position
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });

  // Dynamic shadow
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [25, -25]), { stiffness: 300, damping: 30 });
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), { stiffness: 300, damping: 30 });

  // Pre-compute transforms at top level
  const dynamicDropShadow = useTransform(
    [shadowX, shadowY],
    ([x, y]) => `drop-shadow(${x}px ${y}px 30px hsl(var(--primary) / 0.4))`
  );
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, hsl(var(--primary) / 0.2), transparent 50%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer group"
      style={{ perspective: '1000px' }}
    >
      {/* Package Image with 3D Effect - No box, effect on image only */}
      <motion.div 
        className="relative w-full"
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          filter: isHovered ? dynamicDropShadow : 'drop-shadow(0 10px 20px hsl(var(--primary) / 0.1))',
        }}
        whileHover={{ y: -10, z: 50 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glare Effect on image */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none rounded-2xl opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.6 : 0,
            background: glareBackground,
          }}
        />

        {pkg.image_url ? (
          <img 
            src={pkg.image_url} 
            alt={language === 'en' ? pkg.name_en : pkg.name_ar}
            className="w-full h-auto object-contain drop-shadow-2xl transition-all duration-300"
            style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0)' }}
          />
        ) : (
          <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center">
            <span className="text-muted-foreground font-display">
              {language === 'en' ? pkg.name_en : pkg.name_ar}
            </span>
          </div>
        )}
      </motion.div>

      {/* Price Tag with Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 px-6 py-2 bg-primary/10 border border-primary/30 rounded-full overflow-hidden"
        style={{ transform: isHovered ? 'translateZ(40px)' : 'translateZ(0)' }}
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
  );
};

const StreamerPackages: React.FC<StreamerPackagesProps> = ({ categoryFilter = null }) => {
  const { language } = useLanguage();
  const { currency, exchangeRate } = useCurrency();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { packages, loading } = useStreamerPackages();
  const { categories } = useCategories();

  const symbolFilter = theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)';

  // Track previous prices for animation
  const previousPricesRef = useRef<Record<string, number>>({});
  const [animatingPrices, setAnimatingPrices] = useState<Record<string, boolean>>({});

  // Filter packages by category - match 'streamers' category with 'Designs' filter
  const filteredPackages = categoryFilter 
    ? packages.filter(pkg => {
        // If filter is 'Designs', show packages with 'streamers' category
        if (categoryFilter === 'Designs') {
          return pkg.category === 'streamers' || pkg.category === 'Designs';
        }
        return pkg.category === categoryFilter;
      })
    : packages;

  // Group packages by category
  const groupedPackages = filteredPackages.reduce((acc, pkg) => {
    const cat = pkg.category || 'Designs';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pkg);
    return acc;
  }, {} as Record<string, typeof filteredPackages>);

  useEffect(() => {
    packages.forEach(pkg => {
      const prevPrice = previousPricesRef.current[pkg.id];
      if (prevPrice !== undefined && prevPrice !== pkg.price) {
        setAnimatingPrices(prev => ({ ...prev, [pkg.id]: true }));
        setTimeout(() => {
          setAnimatingPrices(prev => ({ ...prev, [pkg.id]: false }));
        }, 600);
      }
      previousPricesRef.current[pkg.id] = pkg.price;
    });
  }, [packages]);

  const formatPrice = (priceInSAR: number) => {
    if (currency === 'SAR') {
      return (
        <span className="flex items-center justify-center gap-1 font-display">
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
    return <span className="font-display">${priceInUSD.toFixed(2)}</span>;
  };

  const handlePackageClick = (pkgId: string) => {
    navigate(`/streamer-package/${pkgId}`);
  };

  const getCategoryLabel = (catValue: string) => {
    const cat = categories.find(c => c.value === catValue);
    if (cat) {
      return language === 'ar' ? cat.label_ar : cat.label_en;
    }
    return catValue;
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredPackages.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      {Object.entries(groupedPackages).map(([category, pkgs]) => (
        <div key={category} className="mb-12">
          {/* Section Title */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {getCategoryLabel(category)}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="bg-[#1a1a2e] text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 font-display">
                LIVE
                <span className="w-2.5 h-2.5 bg-[#00d4aa] rounded-full animate-pulse" />
              </span>
            </div>
          </motion.div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1600px] mx-auto px-4" dir="rtl">
            {pkgs.map((pkg, index) => (
              <StreamerPackageCard
                key={pkg.id}
                pkg={pkg}
                index={index}
                language={language}
                formatPrice={formatPrice}
                animatingPrices={animatingPrices}
                currency={currency}
                onClick={() => handlePackageClick(pkg.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StreamerPackages;