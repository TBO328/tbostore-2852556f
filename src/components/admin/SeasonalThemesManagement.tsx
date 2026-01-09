import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Flag, Crown, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSeasonalTheme, SeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const themes = [
  {
    id: 'ramadan' as SeasonalTheme,
    nameEn: 'Ramadan Theme',
    nameAr: 'تحديث رمضان',
    descriptionEn: 'Gold and purple colors with crescent moon decorations',
    descriptionAr: 'ألوان ذهبية وبنفسجية مع زخارف الهلال',
    icon: Moon,
    gradient: 'from-purple-600 to-yellow-500',
    bgColor: 'bg-gradient-to-br from-purple-900/20 to-yellow-900/20',
  },
  {
    id: 'national_day' as SeasonalTheme,
    nameEn: 'National Day Theme',
    nameAr: 'تحديث اليوم الوطني',
    descriptionEn: 'Green and white colors celebrating Saudi National Day',
    descriptionAr: 'ألوان خضراء وبيضاء احتفالاً باليوم الوطني السعودي',
    icon: Flag,
    gradient: 'from-green-600 to-green-400',
    bgColor: 'bg-gradient-to-br from-green-900/20 to-white/10',
  },
  {
    id: 'foundation_day' as SeasonalTheme,
    nameEn: 'Foundation Day Theme',
    nameAr: 'تحديث يوم التأسيس',
    descriptionEn: 'Traditional green and gold colors for Saudi Foundation Day',
    descriptionAr: 'ألوان خضراء وذهبية تقليدية ليوم التأسيس السعودي',
    icon: Crown,
    gradient: 'from-green-700 to-amber-600',
    bgColor: 'bg-gradient-to-br from-green-900/20 to-amber-900/20',
  },
];

const SeasonalThemesManagement: React.FC = () => {
  const { language } = useLanguage();
  const { activeTheme, setActiveTheme } = useSeasonalTheme();
  const { toast } = useToast();

  const handleActivateTheme = (themeId: SeasonalTheme) => {
    setActiveTheme(themeId);
    const theme = themes.find(t => t.id === themeId);
    toast({
      title: language === 'en' ? 'Theme Activated!' : 'تم تفعيل التحديث!',
      description: language === 'en' 
        ? `${theme?.nameEn} has been applied to the store.`
        : `تم تطبيق ${theme?.nameAr} على المتجر.`,
    });
  };

  const handleResetToDefault = () => {
    setActiveTheme('default');
    toast({
      title: language === 'en' ? 'Theme Reset' : 'تم إعادة التعيين',
      description: language === 'en' 
        ? 'Store has been reset to the default theme.'
        : 'تم إرجاع المتجر للشكل الافتراضي.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {language === 'en' ? 'Seasonal Updates' : 'التحديثات الموسمية'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'en' 
              ? 'Activate special themes for holidays and occasions'
              : 'تفعيل تحديثات خاصة للمناسبات والأعياد'}
          </p>
        </div>
        
        {activeTheme !== 'default' && (
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'en' ? 'Reset to Default' : 'إرجاع للافتراضي'}
          </Button>
        )}
      </div>

      {/* Current Theme Status */}
      {activeTheme !== 'default' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">
              {language === 'en' ? 'Active Theme:' : 'التحديث النشط:'}
              <span className="text-primary mx-2">
                {language === 'en' 
                  ? themes.find(t => t.id === activeTheme)?.nameEn
                  : themes.find(t => t.id === activeTheme)?.nameAr}
              </span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Theme Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme, index) => {
          const Icon = theme.icon;
          const isActive = activeTheme === theme.id;
          
          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl border overflow-hidden transition-all duration-300",
                isActive 
                  ? "border-primary shadow-lg shadow-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Header with gradient */}
              <div className={cn("h-24 relative", theme.bgColor)}>
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-80",
                  theme.gradient
                )} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                {isActive && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 bg-card">
                <h3 className="font-bold text-foreground mb-1">
                  {language === 'en' ? theme.nameEn : theme.nameAr}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'en' ? theme.descriptionEn : theme.descriptionAr}
                </p>
                
                <Button
                  onClick={() => handleActivateTheme(theme.id)}
                  disabled={isActive}
                  className="w-full"
                  variant={isActive ? "secondary" : "default"}
                >
                  {isActive 
                    ? (language === 'en' ? 'Currently Active' : 'مفعّل حالياً')
                    : (language === 'en' ? 'Activate Theme' : 'تفعيل التحديث')}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="p-4 bg-muted/30 rounded-xl border border-border">
        <h3 className="font-medium text-foreground mb-2">
          {language === 'en' ? 'How It Works' : 'كيف يعمل؟'}
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {language === 'en' 
            ? 'Click "Activate Theme" to apply the seasonal look to your store instantly.'
            : 'اضغط على "تفعيل التحديث" لتطبيق الشكل الموسمي على متجرك فوراً.'}
          </li>
          <li>• {language === 'en'
            ? 'Only one theme can be active at a time.'
            : 'يمكن تفعيل تحديث واحد فقط في كل مرة.'}
          </li>
          <li>• {language === 'en'
            ? 'Click "Reset to Default" to return to the original store design.'
            : 'اضغط على "إرجاع للافتراضي" للعودة للتصميم الأصلي.'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SeasonalThemesManagement;
