import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coins, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const LoyaltyPointsBadge: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { points, loading, calculateValueFromPoints } = useLoyaltyPoints();

  // Don't show if user is not logged in
  if (!user) return null;

  const pointsValue = calculateValueFromPoints(points);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/loyalty-points">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full border border-amber-500/30 cursor-pointer hover:border-amber-500/50 transition-all"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Coins className="w-4 h-4 text-amber-500" />
              </motion.div>
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
              ) : (
                <span className="text-sm font-semibold text-amber-500">
                  {points.toLocaleString()}
                </span>
              )}
            </motion.div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-border">
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {language === 'en' ? 'Loyalty Points' : 'نقاط الولاء'}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? `Worth ${pointsValue.toFixed(1)} SAR`
                : `تساوي ${pointsValue.toFixed(1)} ريال`
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LoyaltyPointsBadge;
