import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          {language === 'en' ? 'Streamer Packages' : 'باقات الستريمرز'}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <span className="bg-[#1a1a2e] text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
            LIVE
            <span className="w-2.5 h-2.5 bg-[#00d4aa] rounded-full animate-pulse" />
          </span>
        </div>
      </motion.div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto px-4" dir="rtl">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative rounded-xl overflow-hidden ${
              pkg.isCustom 
                ? 'bg-gradient-to-b from-[#3d9a9a] to-[#2a7a7a]' 
                : 'bg-[#e8e8e8]'
            }`}
            style={{
              minHeight: pkg.isCustom ? '380px' : '420px'
            }}
          >
            <div className="p-5 h-full flex flex-col">
              {/* Badge & Price Row */}
              <div className="flex justify-between items-start mb-2">
                {pkg.badge && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    pkg.isPrimary 
                      ? 'bg-[#3d9a9a] text-white' 
                      : 'bg-[#d0d0d0] text-[#555]'
                  }`}>
                    {pkg.badge}
                  </span>
                )}
                {!pkg.badge && <div />}
                {pkg.price && (
                  <span className="text-base font-bold text-[#2d8a8a]">{pkg.price}</span>
                )}
              </div>

              {/* Title Section */}
              <div className="text-center mt-2 mb-4">
                <p className={`text-sm mb-0.5 ${pkg.isCustom ? 'text-white/90' : 'text-[#555]'}`}>
                  {pkg.title}
                </p>
                <h3 className={`text-3xl font-bold ${
                  pkg.isCustom 
                    ? 'text-[#7dd3d3] italic' 
                    : pkg.isPrimary 
                      ? 'text-[#2d8a8a]' 
                      : 'text-[#2d8a8a]'
                }`} style={{ fontFamily: pkg.isCustom ? 'serif' : 'inherit' }}>
                  {pkg.subtitle}
                </h3>
              </div>

              {/* Content */}
              <div className="flex-1">
                {pkg.isCustom ? (
                  <p className="text-sm leading-relaxed text-white/90 text-center px-2">
                    {pkg.description}
                  </p>
                ) : (
                  <div>
                    <p className="text-sm font-medium mb-3 text-center text-[#333]">الباقة تشمل :</p>
                    <ul className="space-y-2">
                      {pkg.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[#444]">
                          <div className="w-5 h-5 rounded-full bg-[#2d8a8a] flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Logo at bottom */}
              <div className="flex justify-center mt-4 pt-2">
                <div className={`text-2xl font-bold ${pkg.isCustom ? 'text-white' : 'text-[#2d8a8a]'}`}>
                  <svg width="30" height="35" viewBox="0 0 30 35" fill="none">
                    <path 
                      d="M15 0L30 8V12H0V8L15 0ZM3 15H12V35H3V15ZM18 15H27V35H18V15Z" 
                      fill={pkg.isCustom ? 'white' : '#2d8a8a'}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StreamerPackages;