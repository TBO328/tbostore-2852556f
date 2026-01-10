import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import tboLogo from '@/assets/tbo-logo.png';

interface PackageFeature {
  text: string;
}

interface StreamerPackage {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  badge?: string;
  features?: PackageFeature[];
  description?: string;
  isPrimary?: boolean;
  isCustom?: boolean;
}

const StreamerPackages: React.FC = () => {
  const { language } = useLanguage();

  const packages: StreamerPackage[] = [
    {
      id: 'custom',
      title: 'الباقة',
      subtitle: 'المخصصة',
      isCustom: true,
      description: 'ميزة الباقة المخصصة لك تصميم عرض يناسب احتياجاتك تماماً، من خلال اختيار المحتويات اللي تهمك فقط. هذا الخيار الذكي يقلل من التكاليف الزائدة ويوفر لك قيمة أعلى مقابل سعر أقل. الباقة مصممة إلى ميزانيتك وتمنحك حرية اختيار الأدوات اللي تحتاجها بجودة عالية وتكلفة مدروسة',
    },
    {
      id: 'tbo-plus',
      title: 'باقة',
      subtitle: 'TBO +',
      price: '44.99 $',
      badge: 'الأكثر طلباً',
      isPrimary: true,
      features: [
        { text: 'بداية بث متحركة' },
        { text: 'نهاية بث متحركة' },
        { text: 'جست تشاتينق متحرك' },
        { text: 'بادجات السبسكرايب' },
        { text: 'بنر تويتش او كيك' },
        { text: 'شعار احترف او رمزي متحرك' },
        { text: 'صورة اوفلاين ستريم' },
        { text: 'انتقاليات بين المشاهد متحركة' },
      ],
    },
    {
      id: 'standard',
      title: 'الباقة',
      subtitle: 'العادية',
      price: '14.99 $',
      badge: 'إقتصادية',
      features: [
        { text: 'شعار احترف او رمزي ثابت' },
        { text: 'بنر تويتش او كيك' },
        { text: 'بادجات السبسكرايب' },
        { text: 'انتقاليات بين المشاهد متحركة' },
        { text: 'جست تشاتينق ثابت' },
        { text: 'صورة اوفلاين ستريم' },
      ],
    },
  ];

  return (
    <div className="py-12">
      {/* Section Title */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {language === 'en' ? 'Streamer Packages' : 'باقات الستريمرز'}
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            LIVE
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </span>
        </div>
      </motion.div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto" dir="rtl">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative rounded-2xl p-6 ${
              pkg.isCustom 
                ? 'bg-gradient-to-b from-[#2d8a8a] to-[#1a5f5f] text-white' 
                : 'bg-card/90 backdrop-blur-sm border border-border/50'
            }`}
          >
            {/* Badge */}
            {pkg.badge && (
              <div className="absolute top-4 left-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  pkg.isPrimary 
                    ? 'bg-[#2d8a8a] text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {pkg.badge}
                </span>
              </div>
            )}

            {/* Price */}
            {pkg.price && (
              <div className="absolute top-4 right-4">
                <span className="text-lg font-bold text-primary">{pkg.price}</span>
              </div>
            )}

            {/* Title */}
            <div className="text-center mt-8 mb-6">
              <p className="text-sm opacity-80">{pkg.title}</p>
              <h3 className={`text-2xl md:text-3xl font-bold ${
                pkg.isCustom 
                  ? 'text-cyan-300' 
                  : pkg.isPrimary 
                    ? 'text-primary' 
                    : 'text-foreground'
              }`}>
                {pkg.subtitle}
              </h3>
            </div>

            {/* Content */}
            {pkg.isCustom ? (
              <div className="text-center">
                <p className="text-sm leading-relaxed opacity-90 mb-6">
                  {pkg.description}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium mb-3 text-center">الباقة تشمل :</p>
                <ul className="space-y-2">
                  {pkg.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Logo at bottom */}
            <div className="flex justify-center mt-6">
              <img 
                src={tboLogo} 
                alt="TBO" 
                className={`h-8 object-contain ${pkg.isCustom ? 'brightness-0 invert' : ''}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StreamerPackages;