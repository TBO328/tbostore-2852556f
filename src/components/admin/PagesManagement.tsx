import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pencil, Save, Loader2, Upload, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapErrorToUserMessage } from '@/lib/errors';

interface PageContent {
  id: string;
  page_key: string;
  title_en: string | null;
  title_ar: string | null;
  content_en: string | null;
  content_ar: string | null;
  image_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TextItem {
  key: string;
  label_en: string;
  label_ar: string;
  value_en: string;
  value_ar: string;
  type: 'text' | 'textarea';
}

interface ImageItem {
  key: string;
  label_en: string;
  label_ar: string;
  url: string | null;
}

interface PageDefinition {
  key: string;
  label_en: string;
  label_ar: string;
  description_en: string;
  description_ar: string;
  texts: TextItem[];
  images: ImageItem[];
}

// Define all pages with their editable content
const getPageDefinitions = (): PageDefinition[] => [
  {
    key: 'hero',
    label_en: 'Hero Section',
    label_ar: 'القسم الرئيسي',
    description_en: 'Main banner on homepage',
    description_ar: 'البانر الرئيسي في الصفحة الرئيسية',
    texts: [
      { key: 'heroTitle', label_en: 'Hero Title', label_ar: 'العنوان الرئيسي', value_en: 'Welcome to\nTBO STORE', value_ar: 'نورتنا في\nTBO STORE', type: 'textarea' },
      { key: 'heroSubtitle', label_en: 'Hero Subtitle', label_ar: 'العنوان الفرعي', value_en: 'Discover the Future of Shopping', value_ar: 'اكتشف مستقبل التسوق', type: 'text' },
      { key: 'heroDescription', label_en: 'Hero Description', label_ar: 'الوصف', value_en: 'Experience premium products with cutting-edge design and unmatched quality.', value_ar: 'اختبر منتجات متميزة بتصميم متطور وجودة لا مثيل لها.', type: 'textarea' },
      { key: 'shopNow', label_en: 'Shop Now Button', label_ar: 'زر تسوق الآن', value_en: 'Shop Now', value_ar: 'تسوق الآن', type: 'text' },
      { key: 'exploreMore', label_en: 'Explore More Button', label_ar: 'زر اكتشف المزيد', value_en: 'Explore More', value_ar: 'اكتشف المزيد', type: 'text' },
      { key: 'premiumBadge', label_en: 'Premium Badge Text', label_ar: 'نص الشارة', value_en: 'Premium Quality Products', value_ar: 'منتجات عالية الجودة', type: 'text' },
      { key: 'productsCount', label_en: 'Products Count', label_ar: 'عدد المنتجات', value_en: '500+', value_ar: '500+', type: 'text' },
      { key: 'customersCount', label_en: 'Customers Count', label_ar: 'عدد العملاء', value_en: '10K+', value_ar: '10K+', type: 'text' },
      { key: 'ratingValue', label_en: 'Rating Value', label_ar: 'قيمة التقييم', value_en: '4.9★', value_ar: '4.9★', type: 'text' },
    ],
    images: [
      { key: 'heroLogo', label_en: 'Hero Background Logo', label_ar: 'شعار الخلفية', url: null },
    ],
  },
  {
    key: 'navbar',
    label_en: 'Navigation Bar',
    label_ar: 'شريط التنقل',
    description_en: 'Top navigation menu',
    description_ar: 'قائمة التنقل العلوية',
    texts: [
      { key: 'home', label_en: 'Home Link', label_ar: 'رابط الرئيسية', value_en: 'Home', value_ar: 'الرئيسية', type: 'text' },
      { key: 'products', label_en: 'Products Link', label_ar: 'رابط المنتجات', value_en: 'Products', value_ar: 'المنتجات', type: 'text' },
      { key: 'about', label_en: 'About Link', label_ar: 'رابط من نحن', value_en: 'About Us', value_ar: 'من نحن', type: 'text' },
      { key: 'contact', label_en: 'Contact Link', label_ar: 'رابط اتصل بنا', value_en: 'Contact', value_ar: 'اتصل بنا', type: 'text' },
      { key: 'reviews', label_en: 'Reviews Link', label_ar: 'رابط التقييمات', value_en: 'Reviews', value_ar: 'التقييمات', type: 'text' },
      { key: 'favorites', label_en: 'Favorites Link', label_ar: 'رابط المفضلة', value_en: 'Favorites', value_ar: 'المفضلة', type: 'text' },
      { key: 'storeName', label_en: 'Store Name', label_ar: 'اسم المتجر', value_en: 'TBO STORE', value_ar: 'TBO STORE', type: 'text' },
    ],
    images: [
      { key: 'logo', label_en: 'Store Logo', label_ar: 'شعار المتجر', url: null },
    ],
  },
  {
    key: 'features',
    label_en: 'Features Section',
    label_ar: 'قسم المميزات',
    description_en: 'Features strip on homepage',
    description_ar: 'شريط المميزات في الصفحة الرئيسية',
    texts: [
      { key: 'securePayments', label_en: 'Secure Payments', label_ar: 'دفع آمن', value_en: 'Secure Payments', value_ar: 'دفع آمن', type: 'text' },
      { key: 'fastDelivery', label_en: 'Fast Delivery', label_ar: 'توصيل سريع', value_en: 'Fast Delivery', value_ar: 'توصيل سريع', type: 'text' },
      { key: 'support247', label_en: '24/7 Support', label_ar: 'دعم متواصل', value_en: '24/7 Support', value_ar: 'دعم متواصل', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'products_section',
    label_en: 'Products Section',
    label_ar: 'قسم المنتجات',
    description_en: 'Featured products on homepage',
    description_ar: 'المنتجات المميزة في الصفحة الرئيسية',
    texts: [
      { key: 'featuredProducts', label_en: 'Section Title', label_ar: 'عنوان القسم', value_en: 'Featured Products', value_ar: 'منتجات مميزة', type: 'text' },
      { key: 'featuredDescription', label_en: 'Section Description', label_ar: 'وصف القسم', value_en: 'Discover our handpicked selection of premium products.', value_ar: 'اكتشف مجموعتنا المختارة من المنتجات الفاخرة.', type: 'textarea' },
      { key: 'viewAllProducts', label_en: 'View All Button', label_ar: 'زر عرض الكل', value_en: 'View All Products', value_ar: 'عرض جميع المنتجات', type: 'text' },
      { key: 'addToCart', label_en: 'Add to Cart Button', label_ar: 'زر أضف للسلة', value_en: 'Add to Cart', value_ar: 'أضف للسلة', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'about',
    label_en: 'About Page',
    label_ar: 'صفحة من نحن',
    description_en: 'About page content',
    description_ar: 'محتوى صفحة من نحن',
    texts: [
      { key: 'aboutTitle', label_en: 'About Title', label_ar: 'عنوان من نحن', value_en: 'About TBO STORE', value_ar: 'عن TBO STORE', type: 'text' },
      { key: 'aboutDescription', label_en: 'About Description', label_ar: 'وصف من نحن', value_en: 'We are dedicated to bringing you the finest products with exceptional quality and innovative design. Our mission is to transform your shopping experience into something extraordinary.', value_ar: 'نحن ملتزمون بتقديم أفضل المنتجات بجودة استثنائية وتصميم مبتكر. مهمتنا هي تحويل تجربة التسوق الخاصة بك إلى شيء استثنائي.', type: 'textarea' },
      { key: 'learnMore', label_en: 'Learn More Button', label_ar: 'زر اعرف المزيد', value_en: 'Learn More', value_ar: 'اعرف المزيد', type: 'text' },
    ],
    images: [
      { key: 'aboutImage', label_en: 'About Image', label_ar: 'صورة من نحن', url: null },
    ],
  },
  {
    key: 'reviews_section',
    label_en: 'Reviews Section',
    label_ar: 'قسم التقييمات',
    description_en: 'Customer reviews section',
    description_ar: 'قسم تقييمات العملاء',
    texts: [
      { key: 'customerReviews', label_en: 'Reviews Title', label_ar: 'عنوان التقييمات', value_en: 'Customer Reviews', value_ar: 'تقييمات العملاء', type: 'text' },
      { key: 'reviewsDescription', label_en: 'Reviews Description', label_ar: 'وصف التقييمات', value_en: 'What our customers say about us.', value_ar: 'ماذا يقول عملاؤنا عنا.', type: 'text' },
      { key: 'writeReview', label_en: 'Write Review Button', label_ar: 'زر كتابة تقييم', value_en: 'Write a Review', value_ar: 'اكتب تقييم', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'contact',
    label_en: 'Contact Page',
    label_ar: 'صفحة التواصل',
    description_en: 'Contact information and details',
    description_ar: 'معلومات وتفاصيل التواصل',
    texts: [
      { key: 'contactTitle', label_en: 'Contact Title', label_ar: 'عنوان التواصل', value_en: 'Contact Us', value_ar: 'تواصل معنا', type: 'text' },
      { key: 'email', label_en: 'Email', label_ar: 'البريد الإلكتروني', value_en: 'support@tbostore.com', value_ar: 'support@tbostore.com', type: 'text' },
      { key: 'phone', label_en: 'Phone Number', label_ar: 'رقم الهاتف', value_en: '+966 50 000 0000', value_ar: '+966 50 000 0000', type: 'text' },
      { key: 'location', label_en: 'Location', label_ar: 'الموقع', value_en: 'Riyadh, Saudi Arabia', value_ar: 'الرياض، المملكة العربية السعودية', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'footer',
    label_en: 'Footer',
    label_ar: 'التذييل',
    description_en: 'Footer content and links',
    description_ar: 'محتوى وروابط التذييل',
    texts: [
      { key: 'footerDescription', label_en: 'Footer Description', label_ar: 'وصف التذييل', value_en: 'Your destination for premium products with cutting-edge design and unmatched quality.', value_ar: 'وجهتك للمنتجات الفاخرة بتصميم متطور وجودة لا مثيل لها.', type: 'textarea' },
      { key: 'quickLinks', label_en: 'Quick Links Title', label_ar: 'عنوان الروابط السريعة', value_en: 'Quick Links', value_ar: 'روابط سريعة', type: 'text' },
      { key: 'categoriesTitle', label_en: 'Categories Title', label_ar: 'عنوان الفئات', value_en: 'Categories', value_ar: 'الفئات', type: 'text' },
      { key: 'contactUsTitle', label_en: 'Contact Us Title', label_ar: 'عنوان اتصل بنا', value_en: 'Contact Us', value_ar: 'اتصل بنا', type: 'text' },
      { key: 'copyright', label_en: 'Copyright Text', label_ar: 'نص حقوق النشر', value_en: '© 2026 TBO STORE. All Rights Reserved', value_ar: '© 2026 TBO STORE. جميع الحقوق محفوظة', type: 'text' },
      { key: 'privacyPolicy', label_en: 'Privacy Policy', label_ar: 'سياسة الخصوصية', value_en: 'Privacy Policy', value_ar: 'سياسة الخصوصية', type: 'text' },
      { key: 'termsOfService', label_en: 'Terms of Service', label_ar: 'شروط الخدمة', value_en: 'Terms of Service', value_ar: 'شروط الخدمة', type: 'text' },
    ],
    images: [
      { key: 'footerLogo', label_en: 'Footer Logo', label_ar: 'شعار التذييل', url: null },
    ],
  },
  {
    key: 'cart',
    label_en: 'Cart Page',
    label_ar: 'صفحة السلة',
    description_en: 'Shopping cart page',
    description_ar: 'صفحة سلة التسوق',
    texts: [
      { key: 'shoppingCart', label_en: 'Cart Title', label_ar: 'عنوان السلة', value_en: 'Shopping Cart', value_ar: 'سلة التسوق', type: 'text' },
      { key: 'cartEmpty', label_en: 'Empty Cart Message', label_ar: 'رسالة السلة الفارغة', value_en: 'Your cart is empty', value_ar: 'سلتك فارغة', type: 'text' },
      { key: 'cartEmptyDesc', label_en: 'Empty Cart Description', label_ar: 'وصف السلة الفارغة', value_en: 'Add some products to get started!', value_ar: 'أضف بعض المنتجات للبدء!', type: 'text' },
      { key: 'continueShopping', label_en: 'Continue Shopping', label_ar: 'متابعة التسوق', value_en: 'Continue Shopping', value_ar: 'متابعة التسوق', type: 'text' },
      { key: 'totalPrice', label_en: 'Total Price', label_ar: 'إجمالي السعر', value_en: 'Total Price', value_ar: 'إجمالي السعر', type: 'text' },
      { key: 'proceedToCheckout', label_en: 'Proceed to Checkout', label_ar: 'متابعة الشراء', value_en: 'Proceed to Checkout', value_ar: 'متابعة الشراء', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'checkout',
    label_en: 'Checkout Page',
    label_ar: 'صفحة الدفع',
    description_en: 'Checkout and payment',
    description_ar: 'صفحة إتمام الطلب والدفع',
    texts: [
      { key: 'checkout', label_en: 'Checkout Title', label_ar: 'عنوان الدفع', value_en: 'Checkout', value_ar: 'إتمام الطلب', type: 'text' },
      { key: 'customerInfo', label_en: 'Customer Info', label_ar: 'معلومات العميل', value_en: 'Customer Information', value_ar: 'معلومات العميل', type: 'text' },
      { key: 'fullName', label_en: 'Full Name', label_ar: 'الاسم الكامل', value_en: 'Full Name', value_ar: 'الاسم الكامل', type: 'text' },
      { key: 'phoneNumber', label_en: 'Phone Number', label_ar: 'رقم الجوال', value_en: 'Phone Number', value_ar: 'رقم الجوال', type: 'text' },
      { key: 'address', label_en: 'Address', label_ar: 'العنوان', value_en: 'Address', value_ar: 'العنوان', type: 'text' },
      { key: 'paymentMethod', label_en: 'Payment Method', label_ar: 'طريقة الدفع', value_en: 'Payment Method', value_ar: 'طريقة الدفع', type: 'text' },
      { key: 'confirmOrder', label_en: 'Confirm Order', label_ar: 'تأكيد الطلب', value_en: 'Confirm Order', value_ar: 'تأكيد الطلب', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'policies',
    label_en: 'Policies Page',
    label_ar: 'صفحة السياسات',
    description_en: 'Privacy and return policies',
    description_ar: 'سياسات الخصوصية والإرجاع',
    texts: [
      { key: 'policiesTitle', label_en: 'Policies Title', label_ar: 'عنوان السياسات', value_en: 'Our Policies', value_ar: 'سياساتنا', type: 'text' },
      { key: 'policiesDescription', label_en: 'Policies Description', label_ar: 'وصف السياسات', value_en: 'Learn about our terms, privacy, and policies', value_ar: 'تعرف على شروطنا وسياسة الخصوصية', type: 'textarea' },
    ],
    images: [],
  },
  {
    key: 'auth',
    label_en: 'Login/Register Page',
    label_ar: 'صفحة تسجيل الدخول',
    description_en: 'Authentication pages',
    description_ar: 'صفحات المصادقة',
    texts: [
      { key: 'login', label_en: 'Login', label_ar: 'تسجيل الدخول', value_en: 'Login', value_ar: 'تسجيل الدخول', type: 'text' },
      { key: 'register', label_en: 'Register', label_ar: 'إنشاء حساب', value_en: 'Register', value_ar: 'إنشاء حساب', type: 'text' },
      { key: 'forgotPassword', label_en: 'Forgot Password', label_ar: 'نسيت كلمة المرور', value_en: 'Forgot Password?', value_ar: 'نسيت كلمة المرور؟', type: 'text' },
    ],
    images: [],
  },
];

const PagesManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPage, setEditingPage] = useState<PageDefinition | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, { en: string; ar: string }>>({});
  const [editedImages, setEditedImages] = useState<Record<string, string | null>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const pageDefinitions = getPageDefinitions();

  const fetchPages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .order('page_key');

      if (error) throw error;
      setPages((data as PageContent[]) || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('page_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_content'
        },
        () => {
          fetchPages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPages]);

  const getPageData = (pageKey: string): PageContent | undefined => {
    return pages.find(p => p.page_key === pageKey);
  };

  const handleEdit = (pageDef: PageDefinition) => {
    const pageData = getPageData(pageDef.key);
    const metadata = (pageData?.metadata || {}) as Record<string, unknown>;
    
    // Initialize texts from metadata or defaults
    const textsInit: Record<string, { en: string; ar: string }> = {};
    pageDef.texts.forEach(text => {
      const stored = metadata[text.key] as { en?: string; ar?: string } | undefined;
      textsInit[text.key] = {
        en: stored?.en || text.value_en,
        ar: stored?.ar || text.value_ar,
      };
    });
    
    // Initialize images from metadata or defaults
    const imagesInit: Record<string, string | null> = {};
    pageDef.images.forEach(img => {
      const stored = metadata[`image_${img.key}`] as string | undefined;
      imagesInit[img.key] = stored || img.url;
    });

    setEditingPage(pageDef);
    setEditedTexts(textsInit);
    setEditedImages(imagesInit);
    setImageFiles({});
    setDialogOpen(true);
  };

  const handleImageChange = (imageKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFiles(prev => ({ ...prev, [imageKey]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImages(prev => ({ ...prev, [imageKey]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageKey: string) => {
    setImageFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[imageKey];
      return newFiles;
    });
    setEditedImages(prev => ({ ...prev, [imageKey]: null }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `page-content/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!editingPage) return;

    setSaving(true);
    try {
      // Upload any new images
      const uploadedImages: Record<string, string | null> = { ...editedImages };
      for (const [key, file] of Object.entries(imageFiles)) {
        const url = await uploadImage(file);
        if (url) {
          uploadedImages[key] = url;
        }
      }

      // Build metadata object
      const metadata: Record<string, unknown> = {};
      Object.entries(editedTexts).forEach(([key, value]) => {
        metadata[key] = value;
      });
      Object.entries(uploadedImages).forEach(([key, url]) => {
        metadata[`image_${key}`] = url;
      });

      const existingPage = getPageData(editingPage.key);
      
      if (existingPage) {
        const { error } = await supabase
          .from('page_content')
          .update({
            metadata: metadata as unknown as Record<string, never>,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('page_content')
          .insert([{
            page_key: editingPage.key,
            metadata: metadata as unknown as Record<string, never>,
          }]);

        if (error) throw error;
      }

      toast({
        title: language === 'en' ? 'Page updated!' : 'تم تحديث الصفحة!',
        description: language === 'en' ? 'Changes are now live on the website.' : 'التغييرات الآن مباشرة على الموقع.',
      });

      setDialogOpen(false);
      fetchPages();
    } catch (error: unknown) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {language === 'en' ? 'Manage Pages' : 'إدارة الصفحات'}
        </h2>
        <span className="text-sm text-muted-foreground">
          {pageDefinitions.length} {language === 'en' ? 'pages' : 'صفحة'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pageDefinitions.map((pageDef) => {
          const pageData = getPageData(pageDef.key);
          const hasData = !!pageData;

          return (
            <motion.div
              key={pageDef.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleEdit(pageDef)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">
                    {language === 'en' ? pageDef.label_en : pageDef.label_ar}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {language === 'en' ? pageDef.description_en : pageDef.description_ar}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {pageDef.texts.length} {language === 'en' ? 'texts' : 'نص'}
                    </span>
                    {pageDef.images.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                        {pageDef.images.length} {language === 'en' ? 'images' : 'صورة'}
                      </span>
                    )}
                    {hasData && (
                      <span className="text-xs text-green-500">●</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingPage && (language === 'en' ? editingPage.label_en : editingPage.label_ar)}
            </DialogTitle>
          </DialogHeader>

          {editingPage && (
            <Tabs defaultValue="texts" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="texts">
                  {language === 'en' ? 'Texts' : 'النصوص'} ({editingPage.texts.length})
                </TabsTrigger>
                <TabsTrigger value="images">
                  {language === 'en' ? 'Images' : 'الصور'} ({editingPage.images.length})
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                <TabsContent value="texts" className="m-0 space-y-4 pr-4">
                  {editingPage.texts.map((text) => (
                    <div key={text.key} className="bg-muted/30 rounded-xl p-4 border border-border">
                      <Label className="text-sm font-medium text-primary mb-3 block">
                        {language === 'en' ? text.label_en : text.label_ar}
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">English</Label>
                          {text.type === 'textarea' ? (
                            <Textarea
                              value={editedTexts[text.key]?.en || ''}
                              onChange={(e) =>
                                setEditedTexts(prev => ({
                                  ...prev,
                                  [text.key]: { ...prev[text.key], en: e.target.value }
                                }))
                              }
                              rows={3}
                              className="resize-none"
                            />
                          ) : (
                            <Input
                              value={editedTexts[text.key]?.en || ''}
                              onChange={(e) =>
                                setEditedTexts(prev => ({
                                  ...prev,
                                  [text.key]: { ...prev[text.key], en: e.target.value }
                                }))
                              }
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">العربية</Label>
                          {text.type === 'textarea' ? (
                            <Textarea
                              value={editedTexts[text.key]?.ar || ''}
                              onChange={(e) =>
                                setEditedTexts(prev => ({
                                  ...prev,
                                  [text.key]: { ...prev[text.key], ar: e.target.value }
                                }))
                              }
                              rows={3}
                              dir="rtl"
                              className="resize-none"
                            />
                          ) : (
                            <Input
                              value={editedTexts[text.key]?.ar || ''}
                              onChange={(e) =>
                                setEditedTexts(prev => ({
                                  ...prev,
                                  [text.key]: { ...prev[text.key], ar: e.target.value }
                                }))
                              }
                              dir="rtl"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {editingPage.texts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {language === 'en' ? 'No texts to edit' : 'لا توجد نصوص للتعديل'}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="images" className="m-0 space-y-4 pr-4">
                  {editingPage.images.map((img) => (
                    <div key={img.key} className="bg-muted/30 rounded-xl p-4 border border-border">
                      <Label className="text-sm font-medium text-primary mb-3 block">
                        {language === 'en' ? img.label_en : img.label_ar}
                      </Label>
                      {editedImages[img.key] ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
                          <img
                            src={editedImages[img.key]!}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(img.key)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            {language === 'en' ? 'Click to upload image' : 'انقر لرفع صورة'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(img.key, e)}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                  {editingPage.images.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {language === 'en' ? 'No images to edit' : 'لا توجد صور للتعديل'}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>

              <div className="pt-4 border-t border-border mt-4">
                <Button
                  variant="neon-filled"
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'en' ? 'Saving...' : 'جاري الحفظ...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Save & Publish' : 'حفظ ونشر'}
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PagesManagement;
