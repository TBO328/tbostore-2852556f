import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Snowflake, MousePointer, Sun, Moon, Palette, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CustomizeExperience: React.FC = () => {
  const { language } = useLanguage();
  const { winterMode, setWinterMode, customCursor, setCustomCursor, theme, toggleTheme, particlesMode, setParticlesMode } = useTheme();

  // Handle particles toggle - disable winter mode when particles are enabled
  const handleParticlesChange = (enabled: boolean) => {
    setParticlesMode(enabled);
    if (enabled) {
      setWinterMode(false);
    }
  };

  const customizationOptions = [
    {
      id: 'particles',
      icon: Sparkles,
      titleEn: 'Particles Effect',
      titleAr: 'تأثير الجزيئات',
      descEn: 'Show particles background',
      descAr: 'عرض خلفية الجزيئات',
      checked: particlesMode,
      onChange: handleParticlesChange,
      disabled: false,
    },
    {
      id: 'winter',
      icon: Snowflake,
      titleEn: 'Winter Mode',
      titleAr: 'المود الشتوي',
      descEn: particlesMode 
        ? (language === 'en' ? 'Disable particles first' : 'أوقف الجزيئات أولاً')
        : (language === 'en' ? 'Show falling snowflakes' : 'عرض تأثير الثلج المتساقط'),
      descAr: particlesMode ? 'أوقف الجزيئات أولاً' : 'عرض تأثير الثلج المتساقط',
      checked: winterMode,
      onChange: setWinterMode,
      disabled: particlesMode,
    },
    {
      id: 'cursor',
      icon: MousePointer,
      titleEn: 'Custom Cursor',
      titleAr: 'المؤشر المخصص',
      descEn: 'Use custom styled cursor',
      descAr: 'استخدام المؤشر المخصص',
      checked: customCursor,
      onChange: setCustomCursor,
      disabled: false,
    },
    {
      id: 'theme',
      icon: theme === 'dark' ? Moon : Sun,
      titleEn: 'Dark Mode',
      titleAr: 'الوضع الداكن',
      descEn: 'Switch between light and dark theme',
      descAr: 'التبديل بين الوضع الفاتح والداكن',
      checked: theme === 'dark',
      onChange: toggleTheme,
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Back Link */}
          <Link 
            to="/profile" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? '' : 'rotate-180'}`} />
            <span className="text-sm">
              {language === 'en' ? 'Back to Profile' : 'العودة للملف الشخصي'}
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-5 md:p-8 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Palette className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  {language === 'en' ? 'Customize Experience' : 'تخصيص التجربة'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Personalize your browsing experience' : 'خصص تجربة تصفحك'}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {customizationOptions.map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * customizationOptions.indexOf(option) }}
                  className={`flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border ${option.disabled ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${option.disabled ? 'bg-muted' : 'bg-primary/10'}`}>
                      <option.icon className={`w-5 h-5 ${option.disabled ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm md:text-base">
                        {language === 'en' ? option.titleEn : option.titleAr}
                      </p>
                      <p className={`text-xs md:text-sm truncate ${option.disabled ? 'text-destructive/70' : 'text-muted-foreground'}`}>
                        {language === 'en' ? option.descEn : option.descAr}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={option.checked}
                    onCheckedChange={option.onChange}
                    disabled={option.disabled}
                    className="flex-shrink-0 ml-2"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomizeExperience;