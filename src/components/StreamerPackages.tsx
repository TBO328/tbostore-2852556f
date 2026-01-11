import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import packageCustom from '@/assets/package-custom.png';
import packageTboPlus from '@/assets/package-tbo-plus.png';
import packageStandard from '@/assets/package-standard.png';

interface StreamerPackage {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
}

const StreamerPackages: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Order: Custom (left), TBO+ (center), Standard (right) - Prices in USD
  const packages: StreamerPackage[] = [
    {
      id: 'package-custom',
      name: 'Custom Package',
      nameAr: 'الباقة المخصصة',
      nameEn: 'Custom Package',
      price: 0,
      image: packageCustom,
    },
    {
      id: 'package-tbo-plus',
      name: 'TBO+ Package',
      nameAr: 'باقة TBO+',
      nameEn: 'TBO+ Package',
      price: 12.00,
      image: packageTboPlus,
    },
    {
      id: 'package-standard',
      name: 'Standard Package',
      nameAr: 'الباقة العادية',
      nameEn: 'Standard Package',
      price: 4.00,
      image: packageStandard,
    },
  ];

  const handlePackageClick = (pkg: StreamerPackage) => {
    navigate(`/streamer-package/${pkg.id}`);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1600px] mx-auto px-4" dir="rtl">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05, 
              transition: { duration: 0.3 } 
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePackageClick(pkg)}
            className="flex flex-col items-center cursor-pointer group"
          >
            {/* Package Image */}
            <motion.div 
              className="relative w-full"
              whileHover={{
                filter: "brightness(1.1)",
                transition: { duration: 0.3 }
              }}
            >
              <img 
                src={pkg.image} 
                alt={language === 'en' ? pkg.nameEn : pkg.nameAr}
                className="w-full h-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:drop-shadow-[0_20px_50px_rgba(0,212,170,0.3)]"
              />
            </motion.div>

            {/* Price Tag */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 px-6 py-2 bg-primary/10 border border-primary/30 rounded-full"
            >
              <span className="text-primary font-bold text-lg">
                {pkg.price === 0 
                  ? (language === 'en' ? 'Contact Us' : 'تواصل معنا')
                  : `$${pkg.price.toFixed(2)}`
                }
              </span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StreamerPackages;
