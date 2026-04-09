import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Ticket, Plus, Pencil, Trash2, Loader2, Menu, Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOwnerCheck } from '@/hooks/useOwnerCheck';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mapErrorToUserMessage } from '@/lib/errors';
import ReviewsManagement from '@/components/admin/ReviewsManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import PartnersManagement from '@/components/admin/PartnersManagement';
import PagesManagement from '@/components/admin/PagesManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import AdminSidebarNew from '@/components/admin/AdminSidebarNew';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import IconsManagement from '@/components/admin/IconsManagement';
import AIAssistant from '@/components/admin/AIAssistant';
import SeasonalThemesManagement from '@/components/admin/SeasonalThemesManagement';
import PackagesManagement from '@/components/admin/PackagesManagement';
import LoyaltyManagement from '@/components/admin/LoyaltyManagement';
import PaymentsManagement from '@/components/admin/PaymentsManagement';
import FingerprintLock from '@/components/admin/FingerprintLock';
import PricingOptionsEditor, { PricingOption } from '@/components/admin/PricingOptionsEditor';
import CustomQuestionsBuilder, { CustomQuestion } from '@/components/admin/CustomQuestionsBuilder';
import CategoriesManagement from '@/components/admin/CategoriesManagement';
import RanksManagement from '@/components/admin/RanksManagement';
import ExpensesManagement from '@/components/admin/ExpensesManagement';
import ChatsManagement from '@/components/admin/ChatsManagement';
import PortfolioManagement from '@/components/admin/PortfolioManagement';
import ReferralsManagement from '@/components/admin/ReferralsManagement';
import AffiliateManagement from '@/components/admin/AffiliateManagement';
import sarSymbol from '@/assets/sar-symbol.png';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Coupon = Tables<'coupons'>;

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{
    id: string;
    name: string;
    nameAr: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  payment_method: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

interface PaymentSettings {
  stc_pay_number: string;
  bank_name: string;
  bank_account_name: string;
  bank_iban: string;
}

const Admin: React.FC = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { isOwner, loading: ownerLoading } = useOwnerCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const { formatPrice, currency } = useCurrency();
  const { theme } = useTheme();
  
  // Fingerprint lock state
  const [isUnlocked, setIsUnlocked] = useState(false);

  const symbolFilter = theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)';

  const formatPriceWithSymbol = (price: number) => {
    if (currency === 'SAR') {
      return (
        <span className="flex items-center gap-1">
          {price.toFixed(2)}
          <img src={sarSymbol} alt="SAR" className="inline-block h-4 w-4" style={{ filter: symbolFilter }} />
        </span>
      );
    }
    return <span>{formatPrice(price)}</span>;
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stc_pay_number: '',
    bank_name: '',
    bank_account_name: '',
    bank_iban: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Product form state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    price: '',
    original_price: '',
    category: '',
    image_url: '',
    in_stock: true,
    has_design_options: false,
    requires_email: false,
    subscription_duration: '',
    activation_instructions_en: '',
    activation_instructions_ar: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Pricing options state
  const [hasPricingOptions, setHasPricingOptions] = useState(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  
  // Multiple images support
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [uploadingAdditionalImage, setUploadingAdditionalImage] = useState(false);
  
  // Custom questions state
  const [hasCustomQuestions, setHasCustomQuestions] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Available categories - loaded from database
  const [availableCategories, setAvailableCategories] = useState<{value: string; labelEn: string; labelAr: string}[]>([]);
  
  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ value: '', labelEn: '', labelAr: '' });

  // Coupon form state
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_percent: '',
    expires_at: '',
    is_active: true
  });

  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        const timer = setTimeout(() => {
          setAdminCheckComplete(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (adminCheckComplete && !isAdmin) {
      toast({
        title: language === 'en' ? 'Access Denied' : 'تم الرفض',
        description: language === 'en' ? 'You do not have admin privileges.' : 'ليس لديك صلاحيات المسؤول.',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [adminCheckComplete, isAdmin, navigate, toast, language]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, couponsRes, ordersRes, settingsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('payment_settings').select('*'),
        supabase.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true })
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (couponsRes.data) setCoupons(couponsRes.data);
      if (ordersRes.data) {
        const typedOrders: Order[] = ordersRes.data.map(order => ({
          ...order,
          items: order.items as Order['items']
        }));
        setOrders(typedOrders);
      }
      if (settingsRes.data) {
        const settings: PaymentSettings = {
          stc_pay_number: '',
          bank_name: '',
          bank_account_name: '',
          bank_iban: ''
        };
        settingsRes.data.forEach((item: { setting_key: string; setting_value: string }) => {
          if (item.setting_key in settings) {
            settings[item.setting_key as keyof PaymentSettings] = item.setting_value;
          }
        });
        setPaymentSettings(settings);
      }
      // Load categories from database
      if (categoriesRes.data && categoriesRes.data.length > 0) {
        const dbCats = categoriesRes.data.map(c => ({
          value: c.value,
          labelEn: c.label_en,
          labelAr: c.label_ar
        }));
        setAvailableCategories(dbCats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to storage
  const uploadProductImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional image upload
  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAdditionalImage(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      if (uploadedUrl) {
        setAdditionalImages(prev => [...prev, uploadedUrl]);
        toast({ title: language === 'en' ? 'Image added!' : 'تمت إضافة الصورة!' });
      }
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error uploading image' : 'خطأ في رفع الصورة',
        variant: 'destructive'
      });
    } finally {
      setUploadingAdditionalImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Product handlers
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImage(true);

    try {
      let imageUrl = productForm.image_url;

      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Combine main image with additional images
      const allImages: string[] = [];
      if (imageUrl) allImages.push(imageUrl);
      allImages.push(...additionalImages.filter(img => img && img !== imageUrl));

      // Prepare pricing options for database
      const pricingOptionsData = hasPricingOptions && pricingOptions.length > 0
        ? pricingOptions.map(opt => ({
            id: opt.id,
            label_en: opt.label_en,
            label_ar: opt.label_ar,
            price: opt.price
          }))
        : null;

      const productData = {
        name_en: productForm.name_en,
        name_ar: productForm.name_ar,
        description_en: productForm.description_en || null,
        description_ar: productForm.description_ar || null,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        category: productForm.category,
        image_url: imageUrl || null,
        images: allImages,
        in_stock: productForm.in_stock,
        has_design_options: productForm.has_design_options,
        has_pricing_options: hasPricingOptions && pricingOptions.length > 0,
        pricing_options: pricingOptionsData,
        requires_email: productForm.requires_email,
        subscription_duration: productForm.subscription_duration || null,
        activation_instructions_en: productForm.activation_instructions_en || null,
        activation_instructions_ar: productForm.activation_instructions_ar || null,
        custom_questions: hasCustomQuestions && customQuestions.length > 0 ? JSON.parse(JSON.stringify(customQuestions)) : null,
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Product updated!' : 'تم تحديث المنتج!' });
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Product created!' : 'تم إنشاء المنتج!' });
      }
      setProductDialogOpen(false);
      resetProductForm();
      fetchData();
    } catch (error: unknown) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      price: '',
      original_price: '',
      category: '',
      image_url: '',
      in_stock: true,
      has_design_options: false,
      requires_email: false,
      subscription_duration: '',
      activation_instructions_en: '',
      activation_instructions_ar: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setHasPricingOptions(false);
    setPricingOptions([]);
    setHasCustomQuestions(false);
    setCustomQuestions([]);
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name_en: product.name_en,
      name_ar: product.name_ar,
      description_en: product.description_en || '',
      description_ar: product.description_ar || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category: product.category,
      image_url: product.image_url || '',
      in_stock: product.in_stock ?? true,
      has_design_options: (product as unknown as { has_design_options?: boolean }).has_design_options ?? false,
      requires_email: product.requires_email ?? false,
      subscription_duration: product.subscription_duration || '',
      activation_instructions_en: (product as unknown as { activation_instructions_en?: string }).activation_instructions_en || '',
      activation_instructions_ar: (product as unknown as { activation_instructions_ar?: string }).activation_instructions_ar || '',
    });
    setImagePreview(product.image_url || null);
    setImageFile(null);
    // Load additional images from database
    const productImages = (product as unknown as { images?: string[] }).images || [];
    setAdditionalImages(productImages.filter(img => img !== product.image_url));
    
    // Load pricing options
    const extendedProduct = product as unknown as { 
      has_pricing_options?: boolean; 
      pricing_options?: PricingOption[] | null 
    };
    setHasPricingOptions(extendedProduct.has_pricing_options ?? false);
    setPricingOptions(extendedProduct.pricing_options || []);
    
    // Load custom questions
    const extProduct = product as unknown as { custom_questions?: CustomQuestion[] | null };
    const cq = extProduct.custom_questions || [];
    setHasCustomQuestions(cq.length > 0);
    setCustomQuestions(cq);
    
    setProductDialogOpen(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this product?' : 'حذف هذا المنتج؟')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive'
      });
    } else {
      toast({ title: language === 'en' ? 'Product deleted' : 'تم حذف المنتج' });
      fetchData();
    }
  };

  // Coupon handlers
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const couponData = {
      code: couponForm.code.toUpperCase(),
      discount_percent: parseInt(couponForm.discount_percent),
      expires_at: couponForm.expires_at || null,
      is_active: couponForm.is_active
    };
    try {
      if (editingCoupon) {
        const { error } = await supabase.from('coupons').update(couponData).eq('id', editingCoupon.id);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Coupon updated!' : 'تم تحديث الكوبون!' });
      } else {
        const { error } = await supabase.from('coupons').insert(couponData);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Coupon created!' : 'تم إنشاء الكوبون!' });
      }
      setCouponDialogOpen(false);
      resetCouponForm();
      fetchData();
    } catch (error: unknown) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive'
      });
    }
  };

  const resetCouponForm = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discount_percent: '',
      expires_at: '',
      is_active: true
    });
  };

  const editCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discount_percent: coupon.discount_percent.toString(),
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
      is_active: coupon.is_active ?? true
    });
    setCouponDialogOpen(true);
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this coupon?' : 'حذف هذا الكوبون؟')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive'
      });
    } else {
      toast({ title: language === 'en' ? 'Coupon deleted' : 'تم حذف الكوبون' });
      fetchData();
    }
  };

  // Payment settings handler
  const savePaymentSettings = async () => {
    setSavingSettings(true);
    try {
      const updates = Object.entries(paymentSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));
      for (const update of updates) {
        const { error } = await supabase.from('payment_settings').update({
          setting_value: update.setting_value
        }).eq('setting_key', update.setting_key);
        if (error) throw error;
      }
      toast({ title: t('settingsSaved') });
    } catch (error: unknown) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  if (authLoading || loading || !adminCheckComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const isRTL = language === 'ar';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard 
            stats={{
              totalOrders: orders.length,
              pendingOrders,
              deliveredOrders,
              totalRevenue,
              totalProducts: products.length
            }}
          />
        );
      
      case 'ai-assistant':
        return <AIAssistant />;
      
      case 'orders':
        return <OrdersManagement orders={orders} onRefresh={fetchData} />;
      
      case 'payments':
        return <PaymentsManagement />;
      
      case 'categories':
        return <CategoriesManagement />;
      
      case 'expenses':
        return <ExpensesManagement language={language} totalRevenue={totalRevenue} />;
      
      case 'chats':
        return <ChatsManagement language={language} />;
      
      case 'portfolio':
        return <PortfolioManagement />;
      
      case 'referrals':
        return <ReferralsManagement />;
      
      case 'products':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {language === 'en' ? 'Manage Products' : 'إدارة المنتجات'}
              </h2>
              <div className="flex items-center gap-2">
                {/* Add Category Button */}
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Add Category' : 'إضافة فئة'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {language === 'en' ? 'Add New Category' : 'إضافة فئة جديدة'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{language === 'en' ? 'Category ID (English, no spaces)' : 'معرف الفئة (إنجليزي، بدون مسافات)'}</Label>
                        <Input 
                          value={newCategory.value} 
                          onChange={e => setNewCategory({ ...newCategory, value: e.target.value.replace(/\s/g, '') })} 
                          placeholder="e.g., Electronics"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'en' ? 'Category Name (EN)' : 'اسم الفئة (إنجليزي)'}</Label>
                        <Input 
                          value={newCategory.labelEn} 
                          onChange={e => setNewCategory({ ...newCategory, labelEn: e.target.value })} 
                          placeholder="Electronics"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'en' ? 'Category Name (AR)' : 'اسم الفئة (عربي)'}</Label>
                        <Input 
                          value={newCategory.labelAr} 
                          onChange={e => setNewCategory({ ...newCategory, labelAr: e.target.value })} 
                          placeholder="إلكترونيات"
                          dir="rtl"
                        />
                      </div>
                      <Button 
                        className="w-full"
                        onClick={async () => {
                          if (newCategory.value && newCategory.labelEn && newCategory.labelAr) {
                            try {
                              // Save to database
                              const { error } = await supabase.from('categories').insert({
                                value: newCategory.value,
                                label_en: newCategory.labelEn,
                                label_ar: newCategory.labelAr,
                                display_order: availableCategories.length + 1,
                                is_active: true
                              });
                              if (error) throw error;
                              
                              // Update local state
                              const updatedCategories = [...availableCategories, newCategory];
                              setAvailableCategories(updatedCategories);
                              setNewCategory({ value: '', labelEn: '', labelAr: '' });
                              setCategoryDialogOpen(false);
                              toast({ title: language === 'en' ? 'Category added!' : 'تمت إضافة الفئة!' });
                            } catch (error) {
                              console.error('Error adding category:', error);
                              toast({ 
                                title: language === 'en' ? 'Error adding category' : 'خطأ في إضافة الفئة',
                                variant: 'destructive'
                              });
                            }
                          }
                        }}
                        disabled={!newCategory.value || !newCategory.labelEn || !newCategory.labelAr}
                      >
                        {language === 'en' ? 'Add Category' : 'إضافة الفئة'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Add Product Button */}
                <Dialog open={productDialogOpen} onOpenChange={open => {
                  setProductDialogOpen(open);
                  if (!open) resetProductForm();
                }}>
                  <DialogTrigger asChild>
                    <Button variant="neon-filled">
                      <Plus className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Add Product' : 'إضافة منتج'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? (language === 'en' ? 'Edit Product' : 'تعديل المنتج') : (language === 'en' ? 'Add Product' : 'إضافة منتج')}
                      </DialogTitle>
                    </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name (EN)</Label>
                        <Input value={productForm.name_en} onChange={e => setProductForm({ ...productForm, name_en: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Name (AR)</Label>
                        <Input value={productForm.name_ar} onChange={e => setProductForm({ ...productForm, name_ar: e.target.value })} required dir="rtl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description (EN)</Label>
                        <Textarea value={productForm.description_en} onChange={e => setProductForm({ ...productForm, description_en: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (AR)</Label>
                        <Textarea value={productForm.description_ar} onChange={e => setProductForm({ ...productForm, description_ar: e.target.value })} dir="rtl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Original Price</Label>
                        <Input type="number" step="0.01" value={productForm.original_price} onChange={e => setProductForm({ ...productForm, original_price: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'en' ? 'Category' : 'الفئة'}</Label>
                        <Select value={productForm.category} onValueChange={value => setProductForm({ ...productForm, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'en' ? 'Select category' : 'اختر الفئة'} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {language === 'en' ? cat.labelEn : cat.labelAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>{language === 'en' ? 'Product Image' : 'صورة المنتج'}</Label>
                      {imagePreview ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                              setProductForm({ ...productForm, image_url: '' });
                            }}
                          >
                            {language === 'en' ? 'Remove' : 'إزالة'}
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            {language === 'en' ? 'Click to upload image' : 'انقر لرفع صورة'}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>

                    {/* Additional Images Section */}
                    <div className="space-y-3">
                      <Label>{language === 'en' ? 'Additional Images' : 'صور إضافية'}</Label>
                      
                      {/* Display existing additional images */}
                      {additionalImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {additionalImages.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                              <img src={img} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeAdditionalImage(index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload button for additional images */}
                      <label className={`flex items-center justify-center gap-2 w-full h-16 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors ${uploadingAdditionalImage ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingAdditionalImage ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : (
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {uploadingAdditionalImage 
                            ? (language === 'en' ? 'Uploading...' : 'جاري الرفع...')
                            : (language === 'en' ? 'Add more images' : 'إضافة صور أخرى')}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleAdditionalImageUpload}
                          disabled={uploadingAdditionalImage}
                        />
                      </label>
                      
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' 
                          ? `${additionalImages.length} additional image(s) • Max recommended: 5`
                          : `${additionalImages.length} صورة إضافية • الحد الأقصى المقترح: 5`}
                      </p>
                    </div>

                    {/* Pricing Options Editor */}
                    <PricingOptionsEditor
                      enabled={hasPricingOptions}
                      onEnabledChange={setHasPricingOptions}
                      options={pricingOptions}
                      onOptionsChange={setPricingOptions}
                    />

                    {/* Requires Email Toggle */}
                    <div className="space-y-3 p-4 rounded-xl border border-border bg-card/50">
                      <div className="flex items-center gap-2">
                        <Switch checked={productForm.requires_email} onCheckedChange={checked => setProductForm({ ...productForm, requires_email: checked })} />
                        <Label>{language === 'en' ? 'Requires Activation Email' : 'يتطلب بريد إلكتروني للتفعيل'}</Label>
                      </div>
                      
                      {productForm.requires_email && (
                        <div className="space-y-3 pt-2">
                          <div className="space-y-2">
                            <Label>{language === 'en' ? 'Subscription Duration' : 'مدة الاشتراك'}</Label>
                            <Input 
                              value={productForm.subscription_duration} 
                              onChange={e => setProductForm({ ...productForm, subscription_duration: e.target.value })} 
                              placeholder={language === 'en' ? 'e.g. 1 Month, 1 Year' : 'مثال: شهر واحد، سنة'}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>{language === 'en' ? 'Activation Instructions (EN)' : 'طريقة التفعيل (EN)'}</Label>
                              <Textarea 
                                value={productForm.activation_instructions_en} 
                                onChange={e => setProductForm({ ...productForm, activation_instructions_en: e.target.value })} 
                                placeholder={language === 'en' ? 'How to activate the subscription...' : 'كيفية تفعيل الاشتراك...'}
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{language === 'en' ? 'طريقة التفعيل (عربي)' : 'طريقة التفعيل (عربي)'}</Label>
                              <Textarea 
                                value={productForm.activation_instructions_ar} 
                                onChange={e => setProductForm({ ...productForm, activation_instructions_ar: e.target.value })} 
                                placeholder={language === 'en' ? 'طريقة تفعيل الاشتراك...' : 'طريقة تفعيل الاشتراك...'}
                                dir="rtl"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Design Options Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch checked={productForm.has_design_options} onCheckedChange={checked => setProductForm({ ...productForm, has_design_options: checked })} />
                      <Label>{language === 'en' ? 'Show Design Options Form' : 'إظهار نموذج خيارات التصميم'}</Label>
                    </div>

                    {/* Custom Questions Builder */}
                    <CustomQuestionsBuilder
                      enabled={hasCustomQuestions}
                      onEnabledChange={setHasCustomQuestions}
                      questions={customQuestions}
                      onQuestionsChange={setCustomQuestions}
                    />

                    <div className="flex items-center gap-2">
                      <Switch checked={productForm.in_stock} onCheckedChange={checked => setProductForm({ ...productForm, in_stock: checked })} />
                      <Label>{language === 'en' ? 'In Stock' : 'متوفر'}</Label>
                    </div>
                    <Button type="submit" variant="neon-filled" className="w-full" disabled={uploadingImage}>
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'en' ? 'Uploading...' : 'جاري الرفع...'}
                        </>
                      ) : (
                        editingProduct ? (language === 'en' ? 'Update' : 'تحديث') : (language === 'en' ? 'Create' : 'إنشاء')
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name_en} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <span className="text-destructive font-medium">{language === 'en' ? 'Out of Stock' : 'غير متوفر'}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground truncate">{language === 'ar' ? product.name_ar : product.name_en}</h3>
                    <p className="text-sm text-muted-foreground truncate">{product.category}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-primary font-bold">{formatPriceWithSymbol(Number(product.price))}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => editProduct(product)} className="hover:bg-primary/10 hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{language === 'en' ? 'No products yet' : 'لا توجد منتجات بعد'}</p>
              </div>
            )}
          </div>
        );

      case 'reviews':
        return <ReviewsManagement language={language} toast={toast} />;

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'packages':
        return <PackagesManagement />;

      case 'user-management':
        return <UserManagement language={language} toast={toast} currentUserId={user?.id} />;

      case 'partners':
        return <PartnersManagement />;

      case 'pages':
        return <PagesManagement />;

      case 'icons':
        return <IconsManagement />;

      case 'seasonal-themes':
        return <SeasonalThemesManagement />;
      
      case 'loyalty':
        return <LoyaltyManagement />;
      
      case 'ranks':
        return <RanksManagement />;

      case 'affiliates':
        return <AffiliateManagement />;

      case 'coupons':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {language === 'en' ? 'Manage Coupons' : 'إدارة الكوبونات'}
              </h2>
              <Dialog open={couponDialogOpen} onOpenChange={open => {
                setCouponDialogOpen(open);
                if (!open) resetCouponForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="neon-filled">
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Add Coupon' : 'إضافة كوبون'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCoupon ? (language === 'en' ? 'Edit Coupon' : 'تعديل الكوبون') : (language === 'en' ? 'Add Coupon' : 'إضافة كوبون')}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCouponSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value })} required className="uppercase" />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount %</Label>
                      <Input type="number" min="1" max="100" value={couponForm.discount_percent} onChange={e => setCouponForm({ ...couponForm, discount_percent: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Expires At (optional)</Label>
                      <Input type="date" value={couponForm.expires_at} onChange={e => setCouponForm({ ...couponForm, expires_at: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={couponForm.is_active} onCheckedChange={checked => setCouponForm({ ...couponForm, is_active: checked })} />
                      <Label>Active</Label>
                    </div>
                    <Button type="submit" variant="neon-filled" className="w-full">
                      {editingCoupon ? (language === 'en' ? 'Update' : 'تحديث') : (language === 'en' ? 'Create' : 'إنشاء')}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {coupons.map(coupon => (
                <motion.div key={coupon.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground font-mono text-lg">{coupon.code}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coupon.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {coupon.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="text-secondary font-semibold">{coupon.discount_percent}% {language === 'ar' ? 'خصم' : 'off'}</span>
                        {coupon.expires_at && (
                          <span>• {language === 'ar' ? 'ينتهي:' : 'Expires:'} {new Date(coupon.expires_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => editCoupon(coupon)} className="hover:bg-primary/10 hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCoupon(coupon.id)} className="hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {coupons.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{language === 'en' ? 'No coupons yet' : 'لا توجد كوبونات بعد'}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {t('paymentSettings')}
            </h2>

            <div className="space-y-6">
              {/* STC Pay Settings */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-primary">📱</span> STC Pay
                </h3>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'STC Pay Number' : 'رقم STC Pay'}</Label>
                  <Input 
                    value={paymentSettings.stc_pay_number} 
                    onChange={e => setPaymentSettings({ ...paymentSettings, stc_pay_number: e.target.value })} 
                    placeholder="05xxxxxxxx" 
                  />
                </div>
              </div>

              {/* Bank Transfer Settings */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-primary">🏦</span> {t('bankTransfer')}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('bankName')}</Label>
                    <Input 
                      value={paymentSettings.bank_name} 
                      onChange={e => setPaymentSettings({ ...paymentSettings, bank_name: e.target.value })} 
                      placeholder={language === 'ar' ? 'مثال: الراجحي' : 'e.g., Al Rajhi Bank'} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('accountName')}</Label>
                    <Input 
                      value={paymentSettings.bank_account_name} 
                      onChange={e => setPaymentSettings({ ...paymentSettings, bank_account_name: e.target.value })} 
                      placeholder={language === 'ar' ? 'اسم صاحب الحساب' : 'Account holder name'} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('iban')}</Label>
                    <Input 
                      value={paymentSettings.bank_iban} 
                      onChange={e => setPaymentSettings({ ...paymentSettings, bank_iban: e.target.value })} 
                      placeholder="SA..." 
                    />
                  </div>
                </div>
              </div>

              <Button variant="neon-filled" onClick={savePaymentSettings} disabled={savingSettings} className="w-full">
                {savingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'en' ? 'Saving...' : 'جاري الحفظ...'}
                  </>
                ) : t('saveSettings')}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show fingerprint lock if not unlocked
  if (!isUnlocked) {
    return <FingerprintLock onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile Header with Back Button */}
      {isMobile && !sidebarOpen && (
        <div className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-30 p-3`}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="bg-card/90 backdrop-blur-sm shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <AdminSidebarNew 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isOpen={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        isOwner={isOwner}
      />

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${isMobile ? '' : (isRTL ? 'mr-[260px]' : 'ml-[260px]')}`}>
        <div className={`p-4 md:p-8 ${isMobile ? 'pt-16' : ''}`}>
          {/* Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, type: "spring" as const, stiffness: 100 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
