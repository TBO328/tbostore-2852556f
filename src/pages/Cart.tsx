import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, MessageCircle, Building2, Copy, Check, Loader2, Tag, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { orderSchema } from '@/lib/validation';
import { mapErrorToUserMessage, getValidationErrorMessage } from '@/lib/errors';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import stcPayLogo from '@/assets/stc-pay-logo.png';

const WHATSAPP_NUMBER = '905510070277';

interface PaymentSettings {
  stc_pay_number: string;
  bank_name: string;
  bank_account_name: string;
  bank_iban: string;
}

const Cart: React.FC = () => {
  const { language, t } = useLanguage();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'stc_pay' | 'bank_transfer'>('stripe');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    const { data } = await supabase.from('payment_settings').select('*');
    if (data) {
      const settings: PaymentSettings = {
        stc_pay_number: '',
        bank_name: '',
        bank_account_name: '',
        bank_iban: '',
      };
      data.forEach((item: { setting_key: string; setting_value: string }) => {
        if (item.setting_key in settings) {
          settings[item.setting_key as keyof PaymentSettings] = item.setting_value;
        }
      });
      setPaymentSettings(settings);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError(null);
    
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        coupon_code: couponCode.trim().toUpperCase()
      });
      
      if (error) throw error;
      
      if (data && data.length > 0 && data[0].is_valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: data[0].discount_percent
        });
        setCouponCode('');
        toast({
          title: language === 'en' ? 'Coupon Applied!' : 'تم تطبيق الكوبون!',
          description: language === 'en' 
            ? `${data[0].discount_percent}% discount applied` 
            : `تم تطبيق خصم ${data[0].discount_percent}%`,
        });
      } else {
        setCouponError(language === 'en' ? 'Invalid or expired coupon' : 'كوبون غير صالح أو منتهي');
      }
    } catch (error) {
      setCouponError(language === 'en' ? 'Error validating coupon' : 'خطأ في التحقق من الكوبون');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    return (getTotalPrice() * appliedCoupon.discount) / 100;
  };

  const getFinalTotal = () => {
    return getTotalPrice() - getDiscountAmount();
  };

  const handleStripeCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast({
        title: t('pleaseEnterInfo'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(item => ({
            name: language === 'en' ? item.name : item.nameAr,
            nameAr: item.nameAr,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          couponCode: appliedCoupon?.code || null,
          couponDiscount: appliedCoupon?.discount || 0,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cart`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: unknown) {
      console.error('Stripe checkout error:', error);
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'ar' ? 'خطأ في الدفع' : 'Payment Error',
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (paymentMethod === 'stripe') {
      return handleStripeCheckout();
    }

    // Prepare order data for validation
    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      items: orderItems,
      payment_method: paymentMethod as 'stripe' | 'stc_pay' | 'bank_transfer',
      total_amount: getFinalTotal(),
    };

    // Validate input
    try {
      orderSchema.parse(orderData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const firstError = validationError.errors[0];
        toast({
          title: language === 'en' ? 'Validation Error' : 'خطأ في التحقق',
          description: firstError?.message || getValidationErrorMessage(language),
          variant: 'destructive',
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate order number
      const { data: orderNumberData } = await supabase.rpc('generate_order_number');
      const orderNumber = orderNumberData || `TBO-${Date.now()}`;

      // Insert order with validated data
      const { error } = await supabase.from('orders').insert({
        order_number: orderNumber,
        customer_name: orderData.customer_name.trim(),
        customer_phone: orderData.customer_phone.trim(),
        customer_address: orderData.customer_address.trim(),
        items: orderData.items,
        payment_method: orderData.payment_method,
        total_amount: orderData.total_amount,
        status: 'pending',
        notes: appliedCoupon ? `Coupon: ${appliedCoupon.code} (-${appliedCoupon.discount}%)` : null,
      });

      if (error) throw error;

      // Send WhatsApp message
      sendWhatsAppMessage(orderNumber);

      // Show success
      setOrderSuccess(orderNumber);
      clearCart();

      toast({
        title: t('orderSuccess'),
        description: `${t('orderNumber')}: ${orderNumber}`,
      });
    } catch (error: unknown) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWhatsAppMessage = (orderNumber: string) => {
    const itemsList = items.map(item => 
      `• ${language === 'ar' ? item.nameAr : item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');
    
    const paymentMethodText = paymentMethod === 'stc_pay' ? 'STC Pay' : (language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer');
    
    const message = language === 'ar' 
      ? `🛒 طلب جديد\n\n📋 رقم الطلب: ${orderNumber}\n\n👤 الاسم: ${customerName}\n📱 الجوال: ${customerPhone}\n📍 العنوان: ${customerAddress}\n\n🛍️ المنتجات:\n${itemsList}\n\n💳 طريقة الدفع: ${paymentMethodText}\n💰 الإجمالي: ${formatPrice(getTotalPrice())}`
      : `🛒 New Order\n\n📋 Order #: ${orderNumber}\n\n👤 Name: ${customerName}\n📱 Phone: ${customerPhone}\n📍 Address: ${customerAddress}\n\n🛍️ Items:\n${itemsList}\n\n💳 Payment: ${paymentMethodText}\n💰 Total: ${formatPrice(getTotalPrice())}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
                >
                  <Check className="w-12 h-12 text-green-500" />
                </motion.div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {t('orderSuccess')}
                </h1>
                <p className="text-xl text-primary font-bold mb-2">
                  {t('orderNumber')}: {orderSuccess}
                </p>
                <p className="text-muted-foreground mb-8 max-w-md">
                  {t('orderSuccessDesc')}
                </p>
                <Link to="/">
                  <Button variant="neon" size="lg">
                    {t('backToHome')}
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <AnimatedSection>
            <div className="flex items-center justify-between mb-8">
              <div>
                <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('continueShopping')}</span>
                </Link>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                  {t('shoppingCart')}
                </h1>
              </div>
            </div>
          </AnimatedSection>

          {items.length === 0 ? (
            /* Empty Cart */
            <AnimatedSection>
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6"
                >
                  <ShoppingCart className="w-16 h-16 text-muted-foreground" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {t('cartEmpty')}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t('cartEmptyDesc')}
                </p>
                <Link to="/products">
                  <Button variant="neon" size="lg">
                    {t('continueShopping')}
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Items List */}
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-card rounded-xl border border-border p-4 flex gap-4"
                    >
                      {/* Product Image */}
                      <Link to={`/product/${item.id}`} className="shrink-0">
                        <motion.img
                          src={item.image}
                          alt={language === 'ar' ? item.nameAr : item.name}
                          className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                          whileHover={{ scale: 1.05 }}
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link to={`/product/${item.id}`}>
                            <h3 className="font-display font-semibold text-foreground hover:text-primary transition-colors">
                              {language === 'ar' ? item.nameAr : item.name}
                            </h3>
                          </Link>
                          <p className="text-primary font-bold mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Item Total & Remove */}
                          <div className="flex items-center gap-4">
                            <span className="font-display font-bold text-foreground">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Customer Info Form */}
                <AnimatedSection delay={0.2}>
                  <div className="bg-gradient-card rounded-xl border border-border p-6">
                    <h2 className="font-display text-xl font-bold text-foreground mb-6">
                      {t('customerInfo')}
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('fullName')} *</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('phoneNumber')} *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder={language === 'ar' ? '05xxxxxxxx' : '05xxxxxxxx'}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">{t('address')} *</Label>
                        <Textarea
                          id="address"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل عنوانك بالتفصيل' : 'Enter your full address'}
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Payment Method */}
                <AnimatedSection delay={0.3}>
                  <div className="bg-gradient-card rounded-xl border border-border p-6">
                    <h2 className="font-display text-xl font-bold text-foreground mb-6">
                      {t('paymentMethod')}
                    </h2>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'stripe' | 'stc_pay' | 'bank_transfer')}>
                      <div className="space-y-4">
                        {/* Stripe Card Payment Option */}
                        <div className={`p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="stripe" id="stripe" />
                            <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                              <CreditCard className="w-5 h-5 text-primary" />
                              <span className="font-semibold">{language === 'ar' ? 'بطاقة ائتمان / مدى' : 'Credit Card / Mada'}</span>
                            </Label>
                          </div>
                          {paymentMethod === 'stripe' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-4 bg-muted rounded-lg"
                            >
                              <p className="text-sm text-muted-foreground">
                                {language === 'ar' 
                                  ? 'سيتم توجيهك إلى صفحة الدفع الآمنة'
                                  : 'You will be redirected to a secure payment page'}
                              </p>
                            </motion.div>
                          )}
                        </div>

                        {/* STC Pay Option */}
                        <div className={`p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'stc_pay' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="stc_pay" id="stc_pay" />
                            <Label htmlFor="stc_pay" className="flex items-center gap-2 cursor-pointer flex-1">
                              <img src={stcPayLogo} alt="STC Pay" className="w-6 h-6 object-contain" />
                              <span className="font-semibold">{t('stcPay')}</span>
                            </Label>
                          </div>
                          {paymentMethod === 'stc_pay' && paymentSettings?.stc_pay_number && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-4 bg-muted rounded-lg"
                            >
                              <p className="text-sm text-muted-foreground mb-2">{t('transferTo')}:</p>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-lg font-bold text-foreground">{paymentSettings.stc_pay_number}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(paymentSettings.stc_pay_number, 'stc')}
                                >
                                  {copiedField === 'stc' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Bank Transfer Option */}
                        <div className={`p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                            <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                              <Building2 className="w-5 h-5 text-primary" />
                              <span className="font-semibold">{t('bankTransfer')}</span>
                            </Label>
                          </div>
                          {paymentMethod === 'bank_transfer' && paymentSettings?.bank_iban && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-4 bg-muted rounded-lg space-y-3"
                            >
                              <div>
                                <p className="text-sm text-muted-foreground">{t('bankName')}:</p>
                                <p className="font-semibold text-foreground">{paymentSettings.bank_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{t('accountName')}:</p>
                                <p className="font-semibold text-foreground">{paymentSettings.bank_account_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{t('iban')}:</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-foreground">{paymentSettings.bank_iban}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(paymentSettings.bank_iban, 'iban')}
                                  >
                                    {copiedField === 'iban' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </AnimatedSection>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <AnimatedSection delay={0.2}>
                  <div className="bg-gradient-card rounded-xl border border-border p-6 sticky top-24">
                    <h2 className="font-display text-xl font-bold text-foreground mb-6">
                      {t('totalPrice')}
                    </h2>

                    {/* Items Summary */}
                    <div className="space-y-3 mb-6">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {language === 'ar' ? item.nameAr : item.name} x{item.quantity}
                          </span>
                          <span className="text-foreground font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Section */}
                    <div className="mb-4">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-500">
                              {appliedCoupon.code} (-{appliedCoupon.discount}%)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={removeCoupon}
                            className="w-6 h-6 text-green-500 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError(null);
                              }}
                              placeholder={language === 'en' ? 'Enter coupon code' : 'أدخل كود الكوبون'}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              onClick={applyCoupon}
                              disabled={couponLoading || !couponCode.trim()}
                              className="shrink-0"
                            >
                              {couponLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Tag className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-xs text-destructive">{couponError}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border my-4" />

                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">
                        {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                      </span>
                      <span className="text-foreground">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>

                    {/* Discount */}
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-green-500">
                          {language === 'ar' ? 'الخصم' : 'Discount'} ({appliedCoupon.discount}%)
                        </span>
                        <span className="text-green-500">
                          -{formatPrice(getDiscountAmount())}
                        </span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center mb-6 pt-2 border-t border-border">
                      <span className="text-lg font-semibold text-foreground">
                        {language === 'ar' ? 'إجمالي السعر' : 'Total Price'}
                      </span>
                      <span className="font-display text-2xl font-bold text-primary glow-text-cyan">
                        {formatPrice(getFinalTotal())}
                      </span>
                    </div>

                    {/* Confirm Order Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="neon"
                        size="lg"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="w-full text-lg py-6 mb-3"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t('orderPlacing')}
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-5 h-5 mr-2" />
                            {t('confirmOrder')}
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <p className="text-xs text-muted-foreground text-center">
                      {language === 'ar' 
                        ? 'سيتم حفظ طلبك وتوجيهك إلى واتساب'
                        : 'Your order will be saved and you will be redirected to WhatsApp'}
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;