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

  const customizationOptions = [
    {
      id: 'particles',
      icon: Sparkles,
      titleEn: 'Particles Effect',
      titleAr: 'تأثير الجزيئات',
      descEn: 'Show animated particles background',
      descAr: 'عرض خلفية الجزيئات المتحركة',
      checked: particlesMode,
      onChange: setParticlesMode,
    },
    {
      id: 'winter',
      icon: Snowflake,
      titleEn: 'Winter Mode',
      titleAr: 'المود الشتوي',
      descEn: 'Show falling snowflakes effect',
      descAr: 'عرض تأثير الثلج المتساقط',
      checked: winterMode,
      onChange: setWinterMode,
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
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <option.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm md:text-base">
                        {language === 'en' ? option.titleEn : option.titleAr}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {language === 'en' ? option.descEn : option.descAr}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={option.checked}
                    onCheckedChange={option.onChange}
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