import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Diamond, User, Shield, ShoppingCart } from 'lucide-react';
import { useUserRank } from '@/hooks/useUserRank';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  crown: Crown,
  star: Star,
  diamond: Diamond,
  user: User,
  shield: Shield,
};

interface UserRankBadgeProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const UserRankBadge: React.FC<UserRankBadgeProps> = ({ showLabel = false, size = 'md' }) => {
  const { rank, loading } = useUserRank();
  const { language } = useLanguage();

  if (loading || !rank) return null;

  const IconComponent = iconMap[rank.icon] || User;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className={`${sizeClasses[size]} rounded-xl flex items-center justify-center relative`}
              style={{
                backgroundColor: `${rank.badge_color}15`,
                border: `2px solid ${rank.badge_color}`,
                boxShadow: `0 0 15px ${rank.badge_color}40`,
              }}
            >
              <IconComponent 
                className={iconSizes[size]} 
                style={{ color: rank.badge_color }} 
              />
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-xl opacity-30 blur-sm"
                style={{ backgroundColor: rank.badge_color }}
              />
            </div>
            {showLabel && (
              <div className="flex flex-col">
                <span 
                  className="text-sm font-semibold"
                  style={{ color: rank.badge_color }}
                >
                  {language === 'ar' ? rank.name_ar : rank.name_en}
                </span>
                {rank.discount_percent > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {rank.discount_percent}% {language === 'ar' ? 'خصم' : 'discount'}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-center">
            <p className="font-semibold" style={{ color: rank.badge_color }}>
              {language === 'ar' ? rank.name_ar : rank.name_en}
            </p>
            {rank.discount_percent > 0 && (
              <p className="text-xs">
                {rank.discount_percent}% {language === 'ar' ? 'خصم دائم' : 'permanent discount'}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserRankBadge;
