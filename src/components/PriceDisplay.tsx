import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sarSymbol from '@/assets/sar-symbol.png';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOriginal?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  price, 
  originalPrice, 
  size = 'md', 
  className = '',
  showOriginal = true 
}) => {
  const { currency, exchangeRate } = useCurrency();
  const { theme } = useTheme();
  const [displayedPrice, setDisplayedPrice] = useState(price);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPriceRef = useRef(price);

  const sizeClasses = {
    sm: { text: 'text-sm', symbol: 'h-3 w-3' },
    md: { text: 'text-lg', symbol: 'h-4 w-4' },
    lg: { text: 'text-xl', symbol: 'h-5 w-5' },
    xl: { text: 'text-3xl', symbol: 'h-6 w-6' },
  };

  // Animate price when it changes
  useEffect(() => {
    if (prevPriceRef.current !== price) {
      setIsAnimating(true);
      
      const startPrice = prevPriceRef.current;
      const endPrice = price;
      const duration = 500;
      const startTime = Date.now();

      const animatePrice = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuad = (t: number) => t * (2 - t);
        const easedProgress = easeOutQuad(progress);
        
        const currentPrice = startPrice + (endPrice - startPrice) * easedProgress;
        setDisplayedPrice(currentPrice);

        if (progress < 1) {
          requestAnimationFrame(animatePrice);
        } else {
          setDisplayedPrice(endPrice);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animatePrice);
      prevPriceRef.current = price;
    }
  }, [price]);

  const finalDisplayPrice = currency === 'SAR' ? displayedPrice : displayedPrice / exchangeRate;
  const displayOriginalPrice = originalPrice ? (currency === 'SAR' ? originalPrice : originalPrice / exchangeRate) : null;

  // Invert color for light mode (dark symbol) or dark mode (light symbol)
  const symbolFilter = theme === 'light' 
    ? 'brightness(0)' // Make it black for light mode
    : 'brightness(0) invert(1)'; // Make it white for dark mode

  if (currency === 'USD') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.span 
          className={`font-arabic font-bold text-primary ${sizeClasses[size].text}`}
          animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          ${finalDisplayPrice.toFixed(2)}
        </motion.span>
        {showOriginal && displayOriginalPrice && (
          <span className={`text-muted-foreground line-through ${size === 'xl' ? 'text-lg' : 'text-sm'}`}>
            ${displayOriginalPrice.toFixed(2)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.span 
        className={`font-arabic font-bold text-primary flex items-center gap-1 ${sizeClasses[size].text}`}
        animate={isAnimating ? { scale: [1, 1.15, 1], color: ['hsl(var(--primary))', 'hsl(142 76% 46%)', 'hsl(var(--primary))'] } : {}}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={Math.round(finalDisplayPrice)}
            initial={isAnimating ? { y: -10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {finalDisplayPrice.toFixed(2)}
          </motion.span>
        </AnimatePresence>
        <img 
          src={sarSymbol} 
          alt="ر.س" 
          className={`inline-block ${sizeClasses[size].symbol}`}
          style={{ filter: symbolFilter }}
        />
      </motion.span>
      {showOriginal && displayOriginalPrice && (
        <span className={`text-muted-foreground line-through flex items-center gap-1 ${size === 'xl' ? 'text-lg' : 'text-sm'}`}>
          {displayOriginalPrice.toFixed(2)}
          <img 
            src={sarSymbol} 
            alt="ر.س" 
            className={`inline-block ${size === 'xl' ? 'h-4 w-4' : 'h-3 w-3'} opacity-60`}
            style={{ filter: symbolFilter }}
          />
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
