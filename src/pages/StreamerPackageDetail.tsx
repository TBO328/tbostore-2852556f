import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
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
  description: string;
  descriptionAr: string;
}

const packages: Record<string, StreamerPackage> = {
  'package-custom': {
    id: 'package-custom',
    name: 'Custom Package',
    nameAr: 'الباقة المخصصة',
    nameEn: 'Custom Package',
    price: 0,
    image: packageCustom,
    description: 'A fully customized streaming package tailored to your exact specifications and brand identity.',
    descriptionAr: 'باقة بث مخصصة بالكامل حسب متطلباتك ومواصفاتك وهوية علامتك التجارية.',
  },
  'package-tbo-plus': {
    id: 'package-tbo-plus',
    name: 'TBO+ Package',
    nameAr: 'باقة TBO+',
    nameEn: 'TBO+ Package',
    price: 12.00,
    image: packageTboPlus,
    description: 'Premium streaming package with advanced overlays, alerts, and professional designs.',
    descriptionAr: 'باقة بث احترافية مع تصاميم متقدمة وتنبيهات واوفرلايز احترافية.',
  },
  'package-standard': {
    id: 'package-standard',
    name: 'Standard Package',
    nameAr: 'الباقة العادية',
    nameEn: 'Standard Package',
    price: 4.00,
    image: packageStandard,
    description: 'Essential streaming package with clean overlays and basic alerts for new streamers.',
    descriptionAr: 'باقة بث أساسية مع تصاميم نظيفة وتنبيهات أساسية للمبتدئين.',
  },
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
  const { addToCart, triggerFlyAnimation, cartIconRef } = useCart();
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [isAdded, setIsAdded] = useState(false);
  const [hasLogo, setHasLogo] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [customHex, setCustomHex] = useState<string>('');
  const [showCustomHex, setShowCustomHex] = useState(false);
  const [installLocation, setInstallLocation] = useState<string>('');
  const [contactMethod, setContactMethod] = useState<string>('');

  const pkg = id ? packages[id] : null;

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
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
        pkg.image
      );
    }

    addToCart({
      id: pkg.id,
      name: pkg.nameEn,
      nameAr: pkg.nameAr,
      price: pkg.price,
      image: pkg.image,
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
                  src={pkg.image}
                  alt={language === 'ar' ? pkg.nameAr : pkg.nameEn}
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
                  {language === 'ar' ? pkg.nameAr : pkg.nameEn}
                </h1>

                {/* Price */}
                <div className="text-2xl font-bold text-primary">
                  {pkg.price === 0 
                    ? (language === 'ar' ? 'السعر حسب الطلب' : 'Price on request')
                    : `$${pkg.price.toFixed(2)}`
                  }
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'ar' ? pkg.descriptionAr : pkg.description}
                </p>

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
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-muted-foreground font-mono">HEX:</span>
                            <Input
                              type="text"
                              placeholder="#000000"
                              value={customHex}
                              onChange={(e) => setCustomHex(e.target.value)}
                              className="w-32 font-mono"
                              maxLength={7}
                            />
                            {customHex && (
                              <div 
                                className="w-8 h-8 rounded border border-border"
                                style={{ backgroundColor: customHex }}
                              />
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
