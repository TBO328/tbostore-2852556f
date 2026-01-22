import React from 'react';
import { Coins } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductPointsBadgeProps {
  price: number;
  className?: string;
  size?: 'sm' | 'md';
}

const ProductPointsBadge: React.FC<ProductPointsBadgeProps> = ({ 
  price, 
  className = '',
  size = 'sm'
}) => {
  const { language } = useLanguage();
  
  // Calculate points (1 SAR = 1 point)
  const points = Math.floor(price);

  if (points <= 0) return null;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-sm px-2.5 py-1 gap-1.5';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div 
      className={`inline-flex items-center ${sizeClasses} bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full border border-amber-500/20 ${className}`}
    >
      <Coins className={`${iconSize} text-amber-500`} />
      <span className="text-amber-600 dark:text-amber-400 font-medium">
        {language === 'en' 
          ? `+${points} pts`
          : `+${points} نقطة`
        }
      </span>
    </div>
  );
};

export default ProductPointsBadge;
