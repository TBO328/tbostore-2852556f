import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import sarSymbol from '@/assets/sar-symbol.png';

export interface PricingOption {
  id: string;
  label_en: string;
  label_ar: string;
  price: number;
}

interface PricingOptionsSelectorProps {
  options: PricingOption[];
  selectedId: string | null;
  onSelect: (option: PricingOption) => void;
}

const PricingOptionsSelector: React.FC<PricingOptionsSelectorProps> = ({
  options,
  selectedId,
  onSelect,
}) => {
  const { language } = useLanguage();
  const { currency, exchangeRate } = useCurrency();
  const { theme } = useTheme();

  const symbolFilter = theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)';

  const formatPrice = (priceInSAR: number) => {
    if (currency === 'SAR') {
      return (
        <span className="flex items-center gap-1">
          {priceInSAR.toFixed(2)}
          <img
            src={sarSymbol}
            alt="SAR"
            className="inline-block h-4 w-4"
            style={{ filter: symbolFilter }}
          />
        </span>
      );
    }
    const priceInUSD = priceInSAR / exchangeRate;
    return <span>${priceInUSD.toFixed(2)}</span>;
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <span className="w-1.5 h-5 bg-secondary rounded-full" />
        {language === 'ar' ? 'اختر الخيار' : 'Choose Option'}
      </h3>
      
      <div className="grid gap-2">
        {options.map((option, index) => {
          const isSelected = selectedId === option.id;
          
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              {/* Selection Indicator */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>
                
                <span
                  className={`font-medium ${
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {language === 'ar' ? option.label_ar : option.label_en}
                </span>
              </div>

              {/* Price */}
              <motion.div
                className={`font-bold text-lg ${
                  isSelected ? 'text-primary' : 'text-foreground'
                }`}
                animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {formatPrice(option.price)}
              </motion.div>

              {/* Selected Glow Effect */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layoutId="selected-option"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PricingOptionsSelector;
