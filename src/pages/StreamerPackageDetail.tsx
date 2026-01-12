import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Check, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { toast } from 'sonner';
import sarSymbol from '@/assets/sar-symbol.png';

import packageCustom from '@/assets/package-custom.png';
import packageTboPlus from '@/assets/package-tbo-plus.png';
import packageStandard from '@/assets/package-standard.png';

interface StreamerPackage {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string | null;
}

const defaultImages: Record<string, string> = {
  'Custom Package': packageCustom,
  'الباقة المخصصة': packageCustom,
  'TBO+ Package': packageTboPlus,
  'باقة TBO+': packageTboPlus,
  'Standard Package': packageStandard,
  'الباقة العادية': packageStandard,
};

const defaultColors = [
  { name: 'Red', nameAr: 'أحمر', hex: '#FF0000' },
  { name: 'Blue', nameAr: 'أزرق', hex: '#0066FF' },
  { name: 'Green', nameAr: 'أخضر', hex: '#00CC66' },
  { name: 'Purple', nameAr: 'بنفسجي', hex: '#9933FF' },
  { name: 'Orange', nameAr: 'برتقالي', hex: '#FF6600' },
  { name: 'Pink', nameAr: 'وردي', hex: '#FF66B2' },
  { name: 'Cyan', nameAr: 'سماوي', hex: '#00CCCC' },
  { name: 'Yellow', nameAr: 'أصفر', hex: '#FFCC00' },
];

const StreamerPackageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { currency, exchangeRate } = useCurrency();
  const { theme } = useTheme();
  const { addToCart, triggerFlyAnimation, cartIconRef } = useCart();
  const imageRef = useRef<HTMLImageElement>(null);

  const symbolFilter = theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)';
  
  const [pkg, setPkg] = useState<StreamerPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [hasLogo, setHasLogo] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [customHex, setCustomHex] = useState<string>('');
  const [hexError, setHexError] = useState<string>('');
  const [showCustomHex, setShowCustomHex] = useState(false);
  const [installLocation, setInstallLocation] = useState<string>('');
  const [contactMethod, setContactMethod] = useState<string>('');

  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('streamer_packages')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setPkg({
            ...data,
            image_url: data.image_url || defaultImages[data.name_en] || defaultImages[data.name_ar] || null
          });
        }
      } catch (error) {
        console.error('Error fetching package:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  const formatPrice = (priceInSAR: number) => {
    if (currency === 'SAR') {
      return (
        <span className="flex items-center gap-1 font-display">
          {priceInSAR.toFixed(2)}
          <img src={sarSymbol} alt="SAR" className="inline-block h-6 w-6" style={{ filter: symbolFilter }} />
        </span>
      );
    }
    const priceInUSD = priceInSAR / exchangeRate;
    return <span className="font-display">${priceInUSD.toFixed(2)}</span>;
  };

  const isValidHex = (hex: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  };

  const handleHexChange = (value: string) => {
    let formattedValue = value;
    if (value && !value.startsWith('#')) {
      formattedValue = '#' + value;
    }
    setCustomHex(formattedValue);
    if (formattedValue && formattedValue !== '#') {
      if (!isValidHex(formattedValue)) {
        setHexError(language === 'ar' ? 'صيغة HEX غير صحيحة (مثال: #FF0000)' : 'Invalid HEX format (e.g., #FF0000)');
      } else {
        setHexError('');
      }
    } else {
      setHexError('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4 font-display">
            {language === 'ar' ? 'الباقة غير موجودة' : 'Package not found'}
          </h1>
          <Link to="/products">
            <Button variant="neon">{language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleColorSelect = (color: string) => {
    if (color === 'custom') {
      setShowCustomHex(true);
      setSelectedColor('custom');
    } else {
      setShowCustomHex(false);
      setSelectedColor(color);
      setCustomHex('');
    }
  };

  const handleAddToCart = () => {
    if (!hasLogo) {
      toast.error(language === 'ar' ? 'يرجى اختيار هل لديك شعار' : 'Please select if you have a logo');
      return;
    }
    if (hasLogo === 'yes' && !logoFile) {
      toast.error(language === 'ar' ? 'يرجى رفع الشعار' : 'Please upload your logo');
      return;
    }
    if (!selectedColor && !customHex) {
      toast.error(language === 'ar' ? 'يرجى اختيار اللون' : 'Please select a color');
      return;
    }
    if (selectedColor === 'custom' && customHex && !isValidHex(customHex)) {
      toast.error(language === 'ar' ? 'صيغة HEX غير صحيحة' : 'Invalid HEX color format');
      return;
    }
    if (!installLocation) {
      toast.error(language === 'ar' ? 'يرجى اختيار موقع التركيب' : 'Please select installation location');
      return;
    }
    if (!contactMethod) {
      toast.error(language === 'ar' ? 'يرجى إدخال وسيلة التواصل' : 'Please enter contact method');
      return;
    }

    if (pkg.price === 0) {
      toast.info(language === 'ar' ? 'سنتواصل معك لتحديد السعر' : 'We will contact you for pricing');
    }

    if (imageRef.current && cartIconRef.current) {
      const imageRect = imageRef.current.getBoundingClientRect();
      triggerFlyAnimation(
        { x: imageRect.left + imageRect.width / 2, y: imageRect.top + imageRect.height / 2 },
        pkg.image_url || ''
      );
    }

    addToCart({
      id: pkg.id,
      name: pkg.name_en,
      nameAr: pkg.name_ar,
      price: pkg.price,
      image: pkg.image_url || '',
    });

    setIsAdded(true);
    toast.success(language === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to cart!');
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}</span>
          </Link>

          {/* Package Details */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Package Image */}
            <AnimatedSection>
              <div className="relative rounded-2xl overflow-hidden bg-gradient-card border border-border">
                <motion.img
                  ref={imageRef}
                  src={pkg.image_url || ''}
                  alt={language === 'ar' ? pkg.name_ar : pkg.name_en}
                  className="w-full h-auto object-contain"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </AnimatedSection>

            {/* Package Info & Options Form */}
            <AnimatedSection delay={0.2}>
              <div className="space-y-6">
                {/* Name */}
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {language === 'ar' ? pkg.name_ar : pkg.name_en}
                </h1>

                {/* Price */}
                <div className="text-2xl font-bold text-primary">
                  {pkg.price === 0 
                    ? (language === 'ar' ? 'السعر حسب الطلب' : 'Price on request')
                    : formatPrice(pkg.price)
                  }
                </div>

                {/* Options Form */}
                <div className="space-y-6 bg-muted/30 rounded-xl p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground">
                    {language === 'ar' ? 'خيارات التصميم' : 'Design Options'}
                  </h3>

                  {/* 1. Has Logo */}
                  <div className="space-y-3">
                    <Label className="text-foreground font-medium">
                      {language === 'ar' ? 'هل لديك شعار؟' : 'Do you have a logo?'}
                    </Label>
                    <RadioGroup value={hasLogo} onValueChange={setHasLogo} className="flex gap-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="yes" id="logo-yes" />
                        <Label htmlFor="logo-yes" className="cursor-pointer">
                          {language === 'ar' ? 'نعم' : 'Yes'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="no" id="logo-no" />
                        <Label htmlFor="logo-no" className="cursor-pointer">
                          {language === 'ar' ? 'لا' : 'No'}
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Logo Upload - Shows when "Yes" is selected */}
                    <AnimatePresence>
                      {hasLogo === 'yes' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <Label className="text-muted-foreground text-sm">
                            {language === 'ar' ? 'ارفق شعارك' : 'Upload your logo'}
                          </Label>
                          
                          {logoPreview ? (
                            <div className="relative inline-block">
                              <img 
                                src={logoPreview} 
                                alt="Logo preview" 
                                className="w-24 h-24 object-contain rounded-lg border border-border bg-background"
                              />
                              <button
                                onClick={removeLogo}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-background/50">
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">
                                {language === 'ar' ? 'اضغط لرفع الشعار' : 'Click to upload logo'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 2. Color Selection */}
                  <div className="space-y-3">
                    <Label className="text-foreground font-medium">
                      {language === 'ar' ? 'اللون' : 'Color'}
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {defaultColors.map((color) => (
                        <button
                          key={color.hex}
                          onClick={() => handleColorSelect(color.hex)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedColor === color.hex 
                              ? 'border-primary scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background' 
                              : 'border-border hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={language === 'ar' ? color.nameAr : color.name}
                        />
                      ))}
                      <button
                        onClick={() => handleColorSelect('custom')}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-xs font-bold ${
                          selectedColor === 'custom' 
                            ? 'border-primary scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background' 
                            : 'border-border hover:scale-105'
                        }`}
                        style={{ 
                          background: customHex || 'linear-gradient(135deg, #ff0000, #00ff00, #0000ff)',
                        }}
                        title={language === 'ar' ? 'لون مخصص' : 'Custom color'}
                      >
                        {!customHex && <span className="text-white drop-shadow-md">+</span>}
                      </button>
                    </div>

                    {/* Custom HEX Input */}
                    <AnimatePresence>
                      {showCustomHex && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-mono">HEX:</span>
                              <Input
                                type="text"
                                placeholder="#000000"
                                value={customHex}
                                onChange={(e) => handleHexChange(e.target.value)}
                                className={`w-32 font-mono ${hexError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                maxLength={7}
                              />
                              {customHex && isValidHex(customHex) && (
                                <div 
                                  className="w-8 h-8 rounded border border-border"
                                  style={{ backgroundColor: customHex }}
                                />
                              )}
                            </div>
                            {hexError && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-destructive"
                              >
                                {hexError}
                              </motion.p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Installation Location */}
                  <div className="space-y-3">
                    <Label className="text-foreground font-medium">
                      {language === 'ar' ? 'موقع التركيب' : 'Installation Location'}
                    </Label>
                    <RadioGroup value={installLocation} onValueChange={setInstallLocation} className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="obs" id="install-obs" />
                        <Label htmlFor="install-obs" className="cursor-pointer font-medium">
                          OBS
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="streamlabs" id="install-streamlabs" />
                        <Label htmlFor="install-streamlabs" className="cursor-pointer font-medium">
                          Streamlabs
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* 4. Contact Method */}
                  <div className="space-y-3">
                    <Label className="text-foreground font-medium">
                      {language === 'ar' ? 'وسيلة التواصل' : 'Contact Method'}
                    </Label>
                    <Input
                      type="text"
                      placeholder={language === 'ar' ? 'مثال: Discord: ja2b' : 'Example: Discord: ja2b'}
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Add to Cart Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="neon"
                    size="lg"
                    onClick={handleAddToCart}
                    className="w-full text-lg py-6"
                    disabled={isAdded}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        {language === 'ar' ? 'تمت الإضافة!' : 'Added!'}
                      </>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        {pkg.price === 0 
                          ? (language === 'ar' ? 'أرسل الطلب' : 'Submit Request')
                          : (language === 'ar' ? `أضف للسلة - $${pkg.price.toFixed(2)}` : `Add to Cart - $${pkg.price.toFixed(2)}`)
                        }
                      </span>
                    )}
                  </Button>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StreamerPackageDetail;
