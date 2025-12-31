import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Ticket, Plus, Pencil, Trash2, Loader2, LogOut, ShoppingBag, Settings, ChevronDown, Home, TrendingUp, Users, DollarSign, Tag, Upload, Image, Star, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdminReviews } from '@/hooks/useReviews';
import ReviewsManagement from '@/components/admin/ReviewsManagement';
import { UsersManagement } from '@/components/admin/UsersManagement';
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
  const {
    user,
    isAdmin,
    loading: authLoading,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    language,
    t
  } = useLanguage();
  const {
    formatPrice,
    currency
  } = useCurrency();
  const { theme } = useTheme();
  
  // SAR symbol filter based on theme
  const symbolFilter = theme === 'light' 
    ? 'brightness(0)' 
    : 'brightness(0) invert(1)';
  
  // Custom format price with SAR symbol component
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
    in_stock: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Available categories
  const availableCategories = [
    { value: 'Subscriptions', labelEn: 'Subscriptions', labelAr: 'اشتراكات' },
    { value: 'Designs', labelEn: 'Designs', labelAr: 'تصاميم' },
    { value: 'Engagement', labelEn: 'Engagement', labelAr: 'تفاعل' },
    { value: 'Discord', labelEn: 'Discord', labelAr: 'ديسكورد' },
  ];

  // Coupon form state
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_percent: '',
    expires_at: '',
    is_active: true
  });

  // Order details dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        // Give time for admin role check to complete
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
      const [productsRes, couponsRes, ordersRes, settingsRes] = await Promise.all([supabase.from('products').select('*').order('created_at', {
        ascending: false
      }), supabase.from('coupons').select('*').order('created_at', {
        ascending: false
      }), supabase.from('orders').select('*').order('created_at', {
        ascending: false
      }), supabase.from('payment_settings').select('*')]);
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
        settingsRes.data.forEach((item: {
          setting_key: string;
          setting_value: string;
        }) => {
          if (item.setting_key in settings) {
            settings[item.setting_key as keyof PaymentSettings] = item.setting_value;
          }
        });
        setPaymentSettings(settings);
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

  // Product handlers
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImage(true);

    try {
      let imageUrl = productForm.image_url;

      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      const productData = {
        name_en: productForm.name_en,
        name_ar: productForm.name_ar,
        description_en: productForm.description_en || null,
        description_ar: productForm.description_ar || null,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        category: productForm.category,
        image_url: imageUrl || null,
        in_stock: productForm.in_stock
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        toast({
          title: language === 'en' ? 'Product updated!' : 'تم تحديث المنتج!'
        });
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast({
          title: language === 'en' ? 'Product created!' : 'تم إنشاء المنتج!'
        });
      }
      setProductDialogOpen(false);
      resetProductForm();
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: errorMessage,
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
      in_stock: true
    });
    setImageFile(null);
    setImagePreview(null);
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
      in_stock: product.in_stock ?? true
    });
    setImagePreview(product.image_url || null);
    setImageFile(null);
    setProductDialogOpen(true);
  };
  const deleteProduct = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this product?' : 'حذف هذا المنتج؟')) return;
    const {
      error
    } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'en' ? 'Product deleted' : 'تم حذف المنتج'
      });
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
        const {
          error
        } = await supabase.from('coupons').update(couponData).eq('id', editingCoupon.id);
        if (error) throw error;
        toast({
          title: language === 'en' ? 'Coupon updated!' : 'تم تحديث الكوبون!'
        });
      } else {
        const {
          error
        } = await supabase.from('coupons').insert(couponData);
        if (error) throw error;
        toast({
          title: language === 'en' ? 'Coupon created!' : 'تم إنشاء الكوبون!'
        });
      }
      setCouponDialogOpen(false);
      resetCouponForm();
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: errorMessage,
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
    const {
      error
    } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'en' ? 'Coupon deleted' : 'تم حذف الكوبون'
      });
      fetchData();
    }
  };

  // Order handlers
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const {
      error
    } = await supabase.from('orders').update({
      status: newStatus
    }).eq('id', orderId);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'en' ? 'Status updated!' : 'تم تحديث الحالة!'
      });
      fetchData();
    }
  };
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
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
        const {
          error
        } = await supabase.from('payment_settings').update({
          setting_value: update.setting_value
        }).eq('setting_key', update.setting_key);
        if (error) throw error;
      }
      toast({
        title: t('settingsSaved')
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSavingSettings(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400';
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const getStatusText = (status: string) => {
    const statusMap: Record<string, {
      en: string;
      ar: string;
    }> = {
      pending: {
        en: 'Pending',
        ar: 'في الانتظار'
      },
      confirmed: {
        en: 'Confirmed',
        ar: 'مؤكد'
      },
      shipped: {
        en: 'Shipped',
        ar: 'تم الشحن'
      },
      delivered: {
        en: 'Delivered',
        ar: 'تم التسليم'
      },
      cancelled: {
        en: 'Cancelled',
        ar: 'ملغي'
      }
    };
    return statusMap[status]?.[language] || status;
  };
  if (authLoading || loading || !adminCheckComplete) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  if (!isAdmin) return null;

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {language === 'en' ? 'Admin Dashboard' : 'لوحة التحكم'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Manage your store' : 'إدارة متجرك'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'Sign Out' : 'خروج'}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0
        }} className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                {language === 'en' ? 'Total' : 'الكل'}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            <p className="text-xs text-muted-foreground">{language === 'en' ? 'Orders' : 'طلب'}</p>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-2xl p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-yellow-500 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                {language === 'en' ? 'Pending' : 'معلق'}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
            <p className="text-xs text-muted-foreground">{language === 'en' ? 'Awaiting' : 'بانتظار'}</p>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl p-4 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-green-500" />
              <span className="text-xs text-green-500 bg-green-500/20 px-2 py-0.5 rounded-full">
                {language === 'en' ? 'Done' : 'مكتمل'}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{deliveredOrders}</p>
            <p className="text-xs text-muted-foreground">{language === 'en' ? 'Delivered' : 'تم التسليم'}</p>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-4 border border-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-secondary" />
              <span className="text-xs text-secondary bg-secondary/20 px-2 py-0.5 rounded-full">
                {language === 'en' ? 'Revenue' : 'الإيرادات'}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatPriceWithSymbol(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">{language === 'en' ? 'Total Sales' : 'إجمالي المبيعات'}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-6 mb-8 bg-card/50 backdrop-blur-sm border border-border p-1 rounded-xl">
            <TabsTrigger value="orders" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t('orders')}</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'Products' : 'المنتجات'}</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'Reviews' : 'التقييمات'}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'Users' : 'المستخدمين'}</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'Coupons' : 'الكوبونات'}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'Settings' : 'الإعدادات'}</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {t('manageOrders')}
              </h2>
              <span className="text-sm text-muted-foreground">
                {orders.length} {language === 'en' ? 'orders' : 'طلب'}
              </span>
            </div>

            <div className="grid gap-4">
              {orders.map(order => <motion.div key={order.id} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold text-foreground text-lg">{order.order_number}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">
                          <span className="text-foreground font-medium">{order.customer_name}</span>
                        </p>
                        <p className="text-muted-foreground">{order.customer_phone}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-primary font-bold">{formatPriceWithSymbol(order.total_amount)}</span>
                        <span className="text-sm text-muted-foreground">• {order.items.length} {language === 'en' ? 'items' : 'منتجات'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={order.status} onValueChange={value => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{getStatusText('pending')}</SelectItem>
                          <SelectItem value="confirmed">{getStatusText('confirmed')}</SelectItem>
                          <SelectItem value="shipped">{getStatusText('shipped')}</SelectItem>
                          <SelectItem value="delivered">{getStatusText('delivered')}</SelectItem>
                          <SelectItem value="cancelled">{getStatusText('cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)} className="gap-2">
                        <Tag className="w-4 h-4" />
                        {language === 'ar' ? 'التفاصيل' : 'Details'}
                      </Button>
                    </div>
                  </div>
                </motion.div>)}
              {orders.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{t('noOrders')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{language === 'en' ? 'Orders will appear here when customers place them' : 'ستظهر الطلبات هنا عندما يقوم العملاء بالطلب'}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {language === 'en' ? 'Manage Products' : 'إدارة المنتجات'}
              </h2>
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
                      {editingProduct ? language === 'en' ? 'Edit Product' : 'تعديل المنتج' : language === 'en' ? 'Add Product' : 'إضافة منتج'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name (EN)</Label>
                        <Input value={productForm.name_en} onChange={e => setProductForm({
                        ...productForm,
                        name_en: e.target.value
                      })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Name (AR)</Label>
                        <Input value={productForm.name_ar} onChange={e => setProductForm({
                        ...productForm,
                        name_ar: e.target.value
                      })} required dir="rtl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description (EN)</Label>
                        <Textarea value={productForm.description_en} onChange={e => setProductForm({
                        ...productForm,
                        description_en: e.target.value
                      })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (AR)</Label>
                        <Textarea value={productForm.description_ar} onChange={e => setProductForm({
                        ...productForm,
                        description_ar: e.target.value
                      })} dir="rtl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({
                        ...productForm,
                        price: e.target.value
                      })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Original Price</Label>
                        <Input type="number" step="0.01" value={productForm.original_price} onChange={e => setProductForm({
                        ...productForm,
                        original_price: e.target.value
                      })} />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'en' ? 'Category' : 'الفئة'}</Label>
                        <Select value={productForm.category} onValueChange={value => setProductForm({
                          ...productForm,
                          category: value
                        })}>
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
                    <div className="space-y-2">
                      <Label>{language === 'en' ? 'Product Image' : 'صورة المنتج'}</Label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {imageFile ? imageFile.name : (language === 'en' ? 'Choose image file' : 'اختر ملف الصورة')}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={productForm.in_stock} onCheckedChange={checked => setProductForm({
                      ...productForm,
                      in_stock: checked
                    })} />
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

            <div className="grid gap-4">
              {products.map(product => <motion.div key={product.id} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name_en} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{language === 'ar' ? product.name_ar : product.name_en}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.in_stock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {product.in_stock ? (language === 'ar' ? 'متوفر' : 'In Stock') : (language === 'ar' ? 'نفذ' : 'Out')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{language === 'ar' ? (
                        product.category === 'Subscriptions' ? 'اشتراكات' :
                        product.category === 'Designs' ? 'تصاميم' :
                        product.category === 'Engagement' ? 'تفاعل' :
                        product.category === 'Discord' ? 'ديسكورد' : product.category
                      ) : product.category}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-bold">{formatPriceWithSymbol(Number(product.price))}</span>
                        {product.original_price && (
                          <span className="text-muted-foreground text-sm line-through">{formatPriceWithSymbol(Number(product.original_price))}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => editProduct(product)} className="hover:bg-primary/10 hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>)}
              {products.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{language === 'en' ? 'No products yet' : 'لا توجد منتجات بعد'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{language === 'en' ? 'Add your first product to get started' : 'أضف أول منتج للبدء'}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewsManagement language={language} toast={toast} />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UsersManagement language={language} toast={toast} currentUserId={user?.id} />
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
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
                      {editingCoupon ? language === 'en' ? 'Edit Coupon' : 'تعديل الكوبون' : language === 'en' ? 'Add Coupon' : 'إضافة كوبون'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCouponSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input value={couponForm.code} onChange={e => setCouponForm({
                      ...couponForm,
                      code: e.target.value
                    })} placeholder="e.g., SAVE20" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input type="number" min="1" max="100" value={couponForm.discount_percent} onChange={e => setCouponForm({
                      ...couponForm,
                      discount_percent: e.target.value
                    })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Expires At (optional)</Label>
                      <Input type="date" value={couponForm.expires_at} onChange={e => setCouponForm({
                      ...couponForm,
                      expires_at: e.target.value
                    })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={couponForm.is_active} onCheckedChange={checked => setCouponForm({
                      ...couponForm,
                      is_active: checked
                    })} />
                      <Label>Active</Label>
                    </div>
                    <Button type="submit" variant="neon-filled" className="w-full">
                      {editingCoupon ? language === 'en' ? 'Update' : 'تحديث' : language === 'en' ? 'Create' : 'إنشاء'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {coupons.map(coupon => <motion.div key={coupon.id} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors">
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
                </motion.div>)}
              {coupons.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{language === 'en' ? 'No coupons yet' : 'لا توجد كوبونات بعد'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{language === 'en' ? 'Create a coupon to offer discounts' : 'أنشئ كوبون لتقديم خصومات'}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Payment Settings Tab */}
          <TabsContent value="settings">
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
                    <Input value={paymentSettings.stc_pay_number} onChange={e => setPaymentSettings({
                    ...paymentSettings,
                    stc_pay_number: e.target.value
                  })} placeholder="05xxxxxxxx" />
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
                      <Input value={paymentSettings.bank_name} onChange={e => setPaymentSettings({
                      ...paymentSettings,
                      bank_name: e.target.value
                    })} placeholder={language === 'ar' ? 'مثال: الراجحي' : 'e.g., Al Rajhi Bank'} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('accountName')}</Label>
                      <Input value={paymentSettings.bank_account_name} onChange={e => setPaymentSettings({
                      ...paymentSettings,
                      bank_account_name: e.target.value
                    })} placeholder={language === 'ar' ? 'اسم صاحب الحساب' : 'Account holder name'} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('iban')}</Label>
                      <Input value={paymentSettings.bank_iban} onChange={e => setPaymentSettings({
                      ...paymentSettings,
                      bank_iban: e.target.value
                    })} placeholder="SA..." />
                    </div>
                  </div>
                </div>

                <Button variant="neon-filled" onClick={savePaymentSettings} disabled={savingSettings} className="w-full">
                  {savingSettings ? <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'en' ? 'Saving...' : 'جاري الحفظ...'}
                    </> : t('saveSettings')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('orderDetails')}</DialogTitle>
          </DialogHeader>
          {selectedOrder && <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('orderNumber')}</p>
                  <p className="font-mono font-bold">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'en' ? 'Date' : 'التاريخ'}</p>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">{t('customerInfo')}</h4>
                <p><span className="text-muted-foreground">{t('fullName')}:</span> {selectedOrder.customer_name}</p>
                <p><span className="text-muted-foreground">{t('phoneNumber')}:</span> {selectedOrder.customer_phone}</p>
                <p><span className="text-muted-foreground">{t('address')}:</span> {selectedOrder.customer_address}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3">{language === 'en' ? 'Items' : 'المنتجات'}</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{language === 'ar' ? item.nameAr : item.name}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPriceWithSymbol(item.price * item.quantity)}</p>
                    </div>)}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">{t('paymentMethod')}</span>
                  <span className="font-medium">
                    {selectedOrder.payment_method === 'stc_pay' ? 'STC Pay' : t('bankTransfer')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('totalPrice')}</span>
                  <span className="text-primary">{formatPriceWithSymbol(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default Admin;