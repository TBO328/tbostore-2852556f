import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ChevronDown, ChevronUp, Gift, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import useLoyaltyPoints from '@/hooks/useLoyaltyPoints';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface PointsRedemptionSectionProps {
  cartTotal: number;
  onPointsRedemption: (pointsToRedeem: number, discountAmount: number) => void;
  redeemedPoints: number;
}

const PointsRedemptionSection: React.FC<PointsRedemptionSectionProps> = ({
  cartTotal,
  onPointsRedemption,
  redeemedPoints
}) => {
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { points, calculateValueFromPoints, loading } = useLoyaltyPoints();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [usePoints, setUsePoints] = useState(redeemedPoints > 0);
  const [selectedPoints, setSelectedPoints] = useState(redeemedPoints);

  // Calculate max points that can be used (can't exceed cart total)
  // 10 points = 1 SAR
  const maxPointsValue = cartTotal; // Can redeem up to the full cart value
  const maxRedeemablePoints = Math.min(points, Math.floor(maxPointsValue * 10));
  
  const currentDiscountValue = calculateValueFromPoints(selectedPoints);

  const handleTogglePoints = (checked: boolean) => {
    setUsePoints(checked);
    if (!checked) {
      setSelectedPoints(0);
      onPointsRedemption(0, 0);
    } else if (selectedPoints === 0 && maxRedeemablePoints > 0) {
      // Auto-select all available points
      setSelectedPoints(maxRedeemablePoints);
      onPointsRedemption(maxRedeemablePoints, calculateValueFromPoints(maxRedeemablePoints));
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newPoints = value[0];
    setSelectedPoints(newPoints);
    onPointsRedemption(newPoints, calculateValueFromPoints(newPoints));
  };

  // Not logged in
  if (!user) {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {language === 'ar' ? 'سجل دخولك لاستخدام نقاطك' : 'Login to use your loyalty points'}
            </p>
            <Link to="/auth" className="text-xs text-primary hover:underline">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login now'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-muted/50 rounded-xl p-4 animate-pulse">
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  // No points available
  if (points === 0) {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {language === 'ar' ? 'ليس لديك نقاط حتى الآن' : 'No points available yet'}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'اكسب نقطة لكل ريال تنفقه' : 'Earn 1 point for every SAR spent'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-amber-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-start">
            <p className="text-sm font-medium text-foreground">
              {language === 'ar' ? 'استخدم نقاطك' : 'Use Your Points'}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' 
                ? `لديك ${points} نقطة (${formatPrice(calculateValueFromPoints(points))})`
                : `You have ${points} points (${formatPrice(calculateValueFromPoints(points))})`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {redeemedPoints > 0 && (
            <span className="text-sm font-bold text-green-500">
              -{formatPrice(calculateValueFromPoints(redeemedPoints))}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-amber-500/20 pt-4">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between">
                <Label htmlFor="use-points" className="text-sm font-medium">
                  {language === 'ar' ? 'استخدام النقاط' : 'Apply points discount'}
                </Label>
                <Switch
                  id="use-points"
                  checked={usePoints}
                  onCheckedChange={handleTogglePoints}
                />
              </div>

              {usePoints && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Points Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === 'ar' ? 'النقاط المستخدمة' : 'Points to redeem'}
                      </span>
                      <span className="font-bold text-amber-500">{selectedPoints}</span>
                    </div>
                    <Slider
                      value={[selectedPoints]}
                      onValueChange={handleSliderChange}
                      max={maxRedeemablePoints}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>{maxRedeemablePoints}</span>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {[25, 50, 75, 100].map((percent) => {
                      const pointsForPercent = Math.floor((maxRedeemablePoints * percent) / 100);
                      if (pointsForPercent === 0) return null;
                      return (
                        <Button
                          key={percent}
                          variant={selectedPoints === pointsForPercent ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedPoints(pointsForPercent);
                            onPointsRedemption(pointsForPercent, calculateValueFromPoints(pointsForPercent));
                          }}
                          className="text-xs"
                        >
                          {percent}%
                        </Button>
                      );
                    })}
                  </div>

                  {/* Discount Preview */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">
                        {language === 'ar' 
                          ? `خصم: ${formatPrice(currentDiscountValue)}`
                          : `Discount: ${formatPrice(currentDiscountValue)}`}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {language === 'ar'
                        ? 'كل 10 نقاط = 1 ريال خصم'
                        : 'Every 10 points = 1 SAR discount'}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PointsRedemptionSection;
