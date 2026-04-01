import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ArrowLeft, Plus, Minus, Check, Loader2, Star, Shield, Truck, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import ProductCard from '@/components/ProductCard';
import PriceDisplay from '@/components/PriceDisplay';
import ProductImageGallery from '@/components/ProductImageGallery';
import DesignOptionsForm, { DesignOptions } from '@/components/DesignOptionsForm';
import DynamicQuestionsForm from '@/components/DynamicQuestionsForm';
import PricingOptionsSelector, { PricingOption } from '@/components/PricingOptionsSelector';
import ProductPointsBadge from '@/components/ProductPointsBadge';
import { toast } from 'sonner';
import ProductReviews from '@/components/ProductReviews';
import { supabase } from '@/integrations/supabase/client';
import { products as localProducts, Product } from '@/data/products';

interface ExtendedProduct extends Product {
  has_pricing_options?: boolean;
  pricing_options?: PricingOption[] | null;
  requires_email?: boolean;
  subscription_duration?: string | null;
  activation_instructions_en?: string | null;
  activation_instructions_ar?: string | null;
  has_design_options?: boolean;
  custom_questions?: Array<{ id: string; question_ar: string; question_en: string; type: string; required: boolean; options?: { label_ar: string; label_en: string }[] }> | null;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const { addToCart, triggerFlyAnimation, cartIconRef } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [designOptions, setDesignOptions] = useState<DesignOptions | null>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, unknown>>({});
  const [activationEmail, setActivationEmail] = useState('');
  const imageRef = useRef<HTMLDivElement>(null);
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pricing options state
  const [selectedPricingOption, setSelectedPricingOption] = useState<PricingOption | null>(null);
  const [liveRating, setLiveRating] = useState<number | null>(null);
  const [liveReviewsCount, setLiveReviewsCount] = useState<number | null>(null);

  const handleRatingUpdate = useCallback((avgRating: number, count: number) => {
    setLiveRating(avgRating);
    setLiveReviewsCount(count);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      // First try to find in local products (for numeric IDs)
      const localProduct = localProducts.find(p => p.id === Number(id));
      if (localProduct) {
        setProduct(localProduct);
        setProductImages([localProduct.image]);
        setRelatedProducts(localProducts.filter(p => p.id !== Number(id) && p.category === localProduct.category).slice(0, 4));
        setLoading(false);
        return;
      }

      // If not found locally, fetch from Supabase (for UUID IDs)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setProduct(null);
        setLoading(false);
        return;
      }

      // Handle images array
      const images: string[] = [];
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        images.push(...data.images.filter((img: string) => img));
      }
      if (images.length === 0 && data.image_url) {
        images.push(data.image_url);
      }
      if (images.length === 0) {
        images.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400');
      }
      setProductImages(images);

      const dbProduct: ExtendedProduct = {
        id: data.id,
        name: data.name_en,
        nameAr: data.name_ar,
        price: Number(data.price),
        originalPrice: data.original_price ? Number(data.original_price) : undefined,
        image: images[0],
        category: data.category,
        categoryAr: data.category,
        description: data.description_en || '',
        descriptionAr: data.description_ar || '',
        rating: Number(data.rating) || 5,
        reviewsCount: data.reviews_count || 0,
        inStock: data.in_stock !== false,
        requires_email: data.requires_email ?? false,
        subscription_duration: data.subscription_duration || null,
        activation_instructions_en: (data as unknown as { activation_instructions_en?: string }).activation_instructions_en || null,
        activation_instructions_ar: (data as unknown as { activation_instructions_ar?: string }).activation_instructions_ar || null,
        has_pricing_options: data.has_pricing_options ?? false,
        has_design_options: (data as unknown as { has_design_options?: boolean }).has_design_options ?? false,
        pricing_options: Array.isArray(data.pricing_options) 
          ? (data.pricing_options as unknown as PricingOption[]).map(opt => ({
              id: opt.id || String(Math.random()),
              label_en: opt.label_en || '',
              label_ar: opt.label_ar || '',
              price: parseFloat(String(opt.price)) || 0 // Force parse to ensure numeric value
            }))
          : null,
      };

      setProduct(dbProduct);
      
      // Auto-select first pricing option if available
      if (dbProduct.has_pricing_options && dbProduct.pricing_options && dbProduct.pricing_options.length > 0) {
        setSelectedPricingOption(dbProduct.pricing_options[0]);
      } else {
        setSelectedPricingOption(null);
      }

      // Fetch related products from database
      const { data: relatedData } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4);

      if (relatedData) {
        const related = relatedData.map(item => ({
          id: item.id,
          name: item.name_en,
          nameAr: item.name_ar,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          image: item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          category: item.category,
          categoryAr: item.category,
          description: item.description_en || '',
          descriptionAr: item.description_ar || '',
          rating: Number(item.rating) || 5,
          reviewsCount: item.reviews_count || 0,
          inStock: item.in_stock !== false,
        }));
        setRelatedProducts(related);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
          </h1>
          <Link to="/products">
            <Button variant="neon">{t('products')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get the current price based on selected pricing option
  const currentPrice = selectedPricingOption 
    ? parseFloat(String(selectedPricingOption.price)) || 0 
    : product.price;

  const handleAddToCart = () => {
    // Validate activation email if required
    if (product.requires_email && !activationEmail.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني للتفعيل' : 'Please enter the activation email');
      return;
    }

    if (imageRef.current && cartIconRef.current) {
      const imageRect = imageRef.current.getBoundingClientRect();
      triggerFlyAnimation(
        { x: imageRect.left + imageRect.width / 2, y: imageRect.top + imageRect.height / 2 },
        product.image
      );
    }

    // Include selected pricing option in cart item name
    const optionLabel = selectedPricingOption 
      ? ` (${language === 'ar' ? selectedPricingOption.label_ar : selectedPricingOption.label_en})`
      : '';

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: selectedPricingOption ? `${product.id}-${selectedPricingOption.id}` : product.id,
        name: product.name + optionLabel,
        nameAr: product.nameAr + optionLabel,
        price: currentPrice,
        image: product.image,
        ...(product.requires_email && activationEmail.trim() ? { 
          activationEmail: activationEmail.trim(),
          requiresEmail: true 
        } : {}),
      });
    }
    
    setIsAdded(true);
    toast.success(t('addedToCart'));
    setTimeout(() => setIsAdded(false), 2000);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const features = [
    {
      icon: Truck,
      title: language === 'ar' ? 'توصيل فوري' : 'Instant Delivery',
      description: language === 'ar' ? 'استلم منتجك مباشرة' : 'Get your product instantly',
    },
    {
      icon: Shield,
      title: language === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee',
      description: language === 'ar' ? 'منتجات أصلية 100%' : '100% authentic products',
    },
    {
      icon: RefreshCw,
      title: language === 'ar' ? 'دعم متواصل' : '24/7 Support',
      description: language === 'ar' ? 'نحن هنا لمساعدتك' : 'We\'re here to help',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{t('products')}</span>
            </Link>
          </motion.div>

          {/* Product Details */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Image Gallery */}
            <AnimatedSection>
              <div ref={imageRef}>
                <ProductImageGallery
                  images={productImages}
                  productName={language === 'ar' ? product.nameAr : product.name}
                  discount={discount}
                  isNew={product.isNew}
                  isBestSeller={product.isBestSeller}
                />
              </div>
            </AnimatedSection>

            {/* Product Info */}
            <AnimatedSection delay={0.2}>
              <div className="space-y-8">
                {/* Category */}
                <motion.span 
                  className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {language === 'ar' ? product.categoryAr : product.category}
                </motion.span>

                {/* Name */}
                <motion.h1 
                  className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {language === 'ar' ? product.nameAr : product.name}
                </motion.h1>

                {/* Rating */}
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(liveRating ?? product.rating ?? 5)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    ({(liveRating ?? product.rating ?? 5).toFixed(1)}) • {liveReviewsCount ?? product.reviewsCount ?? 0} {language === 'ar' ? 'تقييم' : 'reviews'}
                  </span>
                </motion.div>

                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <PriceDisplay 
                    price={currentPrice} 
                    originalPrice={!selectedPricingOption ? product.originalPrice : undefined} 
                    size="xl" 
                    className="glow-text-cyan"
                  />
                  {selectedPricingOption && (
                    <span className="text-sm text-muted-foreground block">
                      {language === 'ar' ? selectedPricingOption.label_ar : selectedPricingOption.label_en}
                    </span>
                  )}
                  {/* Loyalty Points Badge - updates based on selected price */}
                  <ProductPointsBadge price={currentPrice} size="md" />
                </motion.div>

                {/* Pricing Options Selector */}
                {product.has_pricing_options && product.pricing_options && product.pricing_options.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <PricingOptionsSelector
                      options={product.pricing_options}
                      selectedId={selectedPricingOption?.id || null}
                      onSelect={setSelectedPricingOption}
                    />
                  </motion.div>
                )}
                {/* Stock Status */}
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-500 font-medium">{t('inStock')}</span>
                </motion.div>

                {/* Activation Email Input - for products requiring email */}
                {product.requires_email && (
                  <motion.div
                    className="p-5 rounded-2xl bg-gradient-card border border-primary/30 space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                  >
                    <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      {language === 'ar' ? 'البريد الإلكتروني للتفعيل' : 'Activation Email'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'أدخل البريد الإلكتروني المراد تفعيل الخدمة عليه'
                        : 'Enter the email address to activate the service on'}
                    </p>
                    <Input
                      type="email"
                      value={activationEmail}
                      onChange={(e) => setActivationEmail(e.target.value)}
                      placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
                      className="w-full"
                      dir="ltr"
                    />
                    {product.subscription_duration && (
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' 
                          ? `مدة الاشتراك: ${product.subscription_duration}`
                          : `Subscription duration: ${product.subscription_duration}`}
                      </p>
                    )}
                    {/* Activation Instructions */}
                    {(product.activation_instructions_ar || product.activation_instructions_en) && (
                      <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-primary" />
                          {language === 'ar' ? 'طريقة التفعيل' : 'Activation Instructions'}
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {language === 'ar' 
                            ? (product.activation_instructions_ar || product.activation_instructions_en) 
                            : (product.activation_instructions_en || product.activation_instructions_ar)}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Description Card */}
                <motion.div 
                  className="p-6 rounded-2xl bg-gradient-card border border-border space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full" />
                    {t('productDescription')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {language === 'ar' ? product.descriptionAr : product.description}
                  </p>
                </motion.div>

                {/* Design Options Form - When enabled for product */}
                {product.has_design_options && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <DesignOptionsForm onOptionsChange={setDesignOptions} />
                  </motion.div>
                )}

                {/* Quantity & Add to Cart */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <span className="text-foreground font-medium">{t('quantity')}</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg text-foreground">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        variant="neon"
                        size="lg"
                        onClick={handleAddToCart}
                        className="w-full text-lg py-7 rounded-xl"
                        disabled={isAdded}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            {t('addedToCart')}
                          </>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            {t('addToCart')}
                            <span className="mx-2">•</span>
                            <PriceDisplay price={currentPrice * quantity} size="md" showOriginal={false} />
                          </span>
                        )}
                      </Button>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsLiked(!isLiked)}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                        isLiked 
                          ? 'bg-secondary text-secondary-foreground border-secondary shadow-neon-magenta' 
                          : 'bg-muted text-muted-foreground border-border hover:border-secondary hover:text-secondary'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Features */}
                <motion.div 
                  className="grid grid-cols-3 gap-4 pt-6 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  {features.map((feature, index) => (
                    <div key={index} className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-xs font-medium text-foreground">{feature.title}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </AnimatedSection>
          </div>

          {/* Product Reviews */}
          {typeof product.id === 'string' && product.id.includes('-') && (
            <section className="mt-24">
              <AnimatedSection>
                <ProductReviews productId={product.id as string} onRatingUpdate={handleRatingUpdate} />
              </AnimatedSection>
            </section>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-24">
              <AnimatedSection>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-secondary rounded-full" />
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {t('relatedProducts')}
                  </h2>
                </div>
              </AnimatedSection>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <AnimatedSection key={relatedProduct.id} delay={index * 0.1}>
                    <ProductCard product={relatedProduct} />
                  </AnimatedSection>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
