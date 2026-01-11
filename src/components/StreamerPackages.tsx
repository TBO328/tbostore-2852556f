import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const { addToCart, triggerFlyAnimation } = useCart();

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

  const handleAddToCart = (pkg: StreamerPackage, event: React.MouseEvent<HTMLButtonElement>) => {
    if (pkg.price === 0) {
      toast.info(language === 'en' ? 'Contact us for custom package pricing' : 'تواصل معنا لتسعير الباقة المخصصة');
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    triggerFlyAnimation({ x: rect.left + rect.width / 2, y: rect.top }, pkg.image);

    addToCart({
      id: pkg.id,
      name: pkg.nameEn,
      nameAr: pkg.nameAr,
      price: pkg.price,
      image: pkg.image,
    });

    toast.success(language === 'en' ? 'Added to cart!' : 'تمت الإضافة للسلة!');
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
            className="flex flex-col items-center cursor-pointer"
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
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Add to Cart Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={(e) => handleAddToCart(pkg, e)}
                className="mt-6 bg-[#2d8a8a] hover:bg-[#247070] text-white px-8 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                {pkg.price === 0 
                  ? (language === 'en' ? 'Contact Us' : 'تواصل معنا')
                  : (language === 'en' ? `Add to Cart - $${pkg.price.toFixed(2)}` : `أضف للسلة - $${pkg.price.toFixed(2)}`)
                }
              </Button>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StreamerPackages;
