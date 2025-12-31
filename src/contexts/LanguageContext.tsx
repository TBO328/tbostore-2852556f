import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', ar: 'الرئيسية' },
  products: { en: 'Products', ar: 'المنتجات' },
  about: { en: 'About Us', ar: 'من نحن' },
  contact: { en: 'Contact', ar: 'اتصل بنا' },
  reviews: { en: 'Reviews', ar: 'التقييمات' },
  favorites: { en: 'Favorites', ar: 'المفضلة' },
  
  // Hero
  heroTitle: { en: 'Welcome to\nTBO STORE', ar: 'نورتنا في\nTBO STORE' },
  heroSubtitle: { en: 'Discover the Future of Shopping', ar: 'اكتشف مستقبل التسوق' },
  heroDescription: { en: 'Experience premium products with cutting-edge design and unmatched quality.', ar: 'اختبر منتجات متميزة بتصميم متطور وجودة لا مثيل لها.' },
  shopNow: { en: 'Shop Now', ar: 'تسوق الآن' },
  exploreMore: { en: 'Explore More', ar: 'اكتشف المزيد' },
  
  // Categories
  categories: { en: 'Categories', ar: 'الفئات' },
  electronics: { en: 'Electronics', ar: 'إلكترونيات' },
  fashion: { en: 'Fashion', ar: 'أزياء' },
  accessories: { en: 'Accessories', ar: 'إكسسوارات' },
  homeGoods: { en: 'Home Goods', ar: 'مستلزمات منزلية' },
  
  // Products
  newArrivals: { en: 'New Arrivals', ar: 'وصل حديثاً' },
  featuredProducts: { en: 'Featured Products', ar: 'منتجات مميزة' },
  bestSellers: { en: 'Best Sellers', ar: 'الأكثر مبيعاً' },
  addToCart: { en: 'Add to Cart', ar: 'أضف للسلة' },
  buyNow: { en: 'Buy Now', ar: 'اشتر الآن' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  
  // About
  aboutTitle: { en: 'About TBO STORE', ar: 'عن TBO STORE' },
  aboutDescription: { en: 'We are dedicated to bringing you the finest products with exceptional quality and innovative design. Our mission is to transform your shopping experience into something extraordinary.', ar: 'نحن ملتزمون بتقديم أفضل المنتجات بجودة استثنائية وتصميم مبتكر. مهمتنا هي تحويل تجربة التسوق الخاصة بك إلى شيء استثنائي.' },
  
  // Reviews
  customerReviews: { en: 'Customer Reviews', ar: 'تقييمات العملاء' },
  
  // Footer
  followUs: { en: 'Follow Us', ar: 'تابعنا' },
  allRightsReserved: { en: 'All Rights Reserved', ar: 'جميع الحقوق محفوظة' },
  
  // Common
  loading: { en: 'Loading...', ar: 'جار التحميل...' },
  search: { en: 'Search', ar: 'بحث' },
  cart: { en: 'Cart', ar: 'السلة' },

  // Cart
  shoppingCart: { en: 'Shopping Cart', ar: 'سلة التسوق' },
  cartEmpty: { en: 'Your cart is empty', ar: 'سلتك فارغة' },
  cartEmptyDesc: { en: 'Add some products to get started!', ar: 'أضف بعض المنتجات للبدء!' },
  continueShopping: { en: 'Continue Shopping', ar: 'متابعة التسوق' },
  totalPrice: { en: 'Total Price', ar: 'إجمالي السعر' },
  contactUs: { en: 'Contact Us', ar: 'تواصل معنا' },
  proceedToCheckout: { en: 'Proceed to Checkout', ar: 'متابعة الشراء' },
  removeItem: { en: 'Remove', ar: 'إزالة' },
  quantity: { en: 'Quantity', ar: 'الكمية' },
  addedToCart: { en: 'Added to cart!', ar: 'تمت الإضافة للسلة!' },
  
  // Product Detail
  productDescription: { en: 'Product Description', ar: 'وصف المنتج' },
  relatedProducts: { en: 'Related Products', ar: 'منتجات ذات صلة' },
  inStock: { en: 'In Stock', ar: 'متوفر' },
  outOfStock: { en: 'Out of Stock', ar: 'غير متوفر' },

  // Checkout
  checkout: { en: 'Checkout', ar: 'إتمام الطلب' },
  customerInfo: { en: 'Customer Information', ar: 'معلومات العميل' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  phoneNumber: { en: 'Phone Number', ar: 'رقم الجوال' },
  address: { en: 'Address', ar: 'العنوان' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
  stcPay: { en: 'STC Pay', ar: 'STC Pay' },
  bankTransfer: { en: 'Bank Transfer', ar: 'تحويل بنكي' },
  transferTo: { en: 'Transfer to', ar: 'حول إلى' },
  bankName: { en: 'Bank Name', ar: 'اسم البنك' },
  accountName: { en: 'Account Name', ar: 'اسم صاحب الحساب' },
  iban: { en: 'IBAN', ar: 'رقم الآيبان' },
  confirmOrder: { en: 'Confirm Order', ar: 'تأكيد الطلب' },
  orderSuccess: { en: 'Order Placed Successfully!', ar: 'تم الطلب بنجاح!' },
  orderNumber: { en: 'Order Number', ar: 'رقم الطلب' },
  orderSuccessDesc: { en: 'Your order has been placed. We will contact you soon.', ar: 'تم تقديم طلبك. سنتواصل معك قريباً.' },
  backToHome: { en: 'Back to Home', ar: 'العودة للرئيسية' },
  pleaseEnterInfo: { en: 'Please fill in all required fields', ar: 'الرجاء ملء جميع الحقول المطلوبة' },
  orderPlacing: { en: 'Placing Order...', ar: 'جاري تقديم الطلب...' },
  
  // Admin Orders
  orders: { en: 'Orders', ar: 'الطلبات' },
  manageOrders: { en: 'Manage Orders', ar: 'إدارة الطلبات' },
  paymentSettings: { en: 'Payment Settings', ar: 'إعدادات الدفع' },
  noOrders: { en: 'No orders yet', ar: 'لا توجد طلبات بعد' },
  pending: { en: 'Pending', ar: 'في الانتظار' },
  confirmed: { en: 'Confirmed', ar: 'مؤكد' },
  shipped: { en: 'Shipped', ar: 'تم الشحن' },
  delivered: { en: 'Delivered', ar: 'تم التسليم' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
  updateStatus: { en: 'Update Status', ar: 'تحديث الحالة' },
  orderDetails: { en: 'Order Details', ar: 'تفاصيل الطلب' },
  saveSettings: { en: 'Save Settings', ar: 'حفظ الإعدادات' },
  settingsSaved: { en: 'Settings saved!', ar: 'تم حفظ الإعدادات!' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={language}
          dir={isRTL ? 'rtl' : 'ltr'}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
