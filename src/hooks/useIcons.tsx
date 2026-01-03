import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Home, ShoppingBag, Heart, User, Settings, Phone, Mail, MapPin,
  Star, Package, Truck, CreditCard, Shield, Clock, Check, AlertCircle,
  ChevronRight, ChevronLeft, Menu, Plus, Minus, Trash2, Pencil, Eye,
  Facebook, Twitter, Instagram, Youtube, Linkedin, Send, MessageCircle,
  Bell, Gift, Percent, Tag, Bookmark, Share2, Download, Upload,
  Camera, Image, Video, Music, FileText, Folder, Archive, Link,
  Globe, Wifi, Zap, Battery, Sun, Moon, Cloud, Umbrella,
  Car, Plane, Train, Bus, Bike, Ship, Rocket, Compass,
  Coffee, Pizza, Apple, Cake, Utensils, Wine, Beer, IceCream,
  Book, GraduationCap, Award, Trophy, Medal, Target, Flag, Lightbulb,
  Palette, Brush, Scissors, Ruler, Hammer, Wrench, Key, Lock,
  Headphones, Speaker, Mic, Radio, Tv, Monitor, Smartphone, Tablet,
  Watch, Glasses, Shirt, Footprints, Diamond, Crown, Gem, Flower2,
  TreePine, Mountain, Waves, Flame, Snowflake, Wind, Droplet, Leaf,
  Activity, Thermometer, Pill, Stethoscope, Syringe, Dna, Brain, Bone,
  Search, X, ArrowLeft, ArrowRight, ChevronUp, ChevronDown, ExternalLink,
  Copy, LogOut, LogIn, UserPlus, Users, DollarSign, Sparkles, ShoppingCart
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface IconConfig {
  id: string;
  location: string;
  location_ar: string;
  icon_name: string;
  section: string;
  section_ar: string;
}

// All available icons map
const iconsMap: Record<string, LucideIcon> = {
  Home, ShoppingBag, Heart, User, Settings, Phone, Mail, MapPin,
  Star, Package, Truck, CreditCard, Shield, Clock, Check, AlertCircle,
  ChevronRight, ChevronLeft, Menu, Plus, Minus, Trash2, Pencil, Eye,
  Facebook, Twitter, Instagram, Youtube, Linkedin, Send, MessageCircle,
  Bell, Gift, Percent, Tag, Bookmark, Share2, Download, Upload,
  Camera, Image, Video, Music, FileText, Folder, Archive, Link,
  Globe, Wifi, Zap, Battery, Sun, Moon, Cloud, Umbrella,
  Car, Plane, Train, Bus, Bike, Ship, Rocket, Compass,
  Coffee, Pizza, Apple, Cake, Utensils, Wine, Beer, IceCream,
  Book, GraduationCap, Award, Trophy, Medal, Target, Flag, Lightbulb,
  Palette, Brush, Scissors, Ruler, Hammer, Wrench, Key, Lock,
  Headphones, Speaker, Mic, Radio, Tv, Monitor, Smartphone, Tablet,
  Watch, Glasses, Shirt, Footprints, Diamond, Crown, Gem, Flower2,
  TreePine, Mountain, Waves, Flame, Snowflake, Wind, Droplet, Leaf,
  Activity, Thermometer, Pill, Stethoscope, Syringe, Dna, Brain, Bone,
  Search, X, ArrowLeft, ArrowRight, ChevronUp, ChevronDown, ExternalLink,
  Copy, LogOut, LogIn, UserPlus, Users, DollarSign, Sparkles, ShoppingCart
};

export const getIconByName = (name: string): LucideIcon => {
  return iconsMap[name] || Star;
};

export const allIconsList = Object.keys(iconsMap).map(name => ({
  name,
  icon: iconsMap[name]
}));

// Default icons configuration with all locations in the store
export const getDefaultIcons = (): IconConfig[] => [
  // Navbar Section
  { id: 'nav_menu', section: 'Navbar', section_ar: 'شريط التنقل', location: 'Mobile Menu Button', location_ar: 'زر القائمة للجوال', icon_name: 'Menu' },
  { id: 'nav_close', section: 'Navbar', section_ar: 'شريط التنقل', location: 'Close Menu Button', location_ar: 'زر إغلاق القائمة', icon_name: 'X' },
  { id: 'nav_search', section: 'Navbar', section_ar: 'شريط التنقل', location: 'Search Button', location_ar: 'زر البحث', icon_name: 'Search' },
  { id: 'nav_cart', section: 'Navbar', section_ar: 'شريط التنقل', location: 'Cart Button', location_ar: 'زر السلة', icon_name: 'ShoppingCart' },
  { id: 'nav_user', section: 'Navbar', section_ar: 'شريط التنقل', location: 'User Profile', location_ar: 'الملف الشخصي', icon_name: 'User' },
  { id: 'nav_admin', section: 'Navbar', section_ar: 'شريط التنقل', location: 'Admin Panel', location_ar: 'لوحة الإدارة', icon_name: 'AlertTriangle' },
  { id: 'nav_theme_dark', section: 'Navbar', section_ar: 'شريط التنقل', location: 'Dark Mode', location_ar: 'الوضع الليلي', icon_name: 'Moon' },
  { id: 'nav_theme_light', section: 'Navbar', section_ar: 'شريط التنقل', location: 'Light Mode', location_ar: 'الوضع النهاري', icon_name: 'Sun' },
  { id: 'nav_currency', section: 'Navbar', section_ar: 'شريط التنقل', location: 'Currency USD', location_ar: 'العملة دولار', icon_name: 'DollarSign' },
  
  // Hero Section
  { id: 'hero_badge', section: 'Hero', section_ar: 'القسم الرئيسي', location: 'Premium Badge', location_ar: 'شارة الجودة', icon_name: 'Sparkles' },
  { id: 'hero_cta', section: 'Hero', section_ar: 'القسم الرئيسي', location: 'Shop Now Button', location_ar: 'زر تسوق الآن', icon_name: 'ArrowRight' },
  
  // Product Card
  { id: 'product_cart', section: 'Product Card', section_ar: 'بطاقة المنتج', location: 'Add to Cart', location_ar: 'أضف للسلة', icon_name: 'ShoppingCart' },
  { id: 'product_heart', section: 'Product Card', section_ar: 'بطاقة المنتج', location: 'Add to Favorites', location_ar: 'أضف للمفضلة', icon_name: 'Heart' },
  { id: 'product_view', section: 'Product Card', section_ar: 'بطاقة المنتج', location: 'View Product', location_ar: 'عرض المنتج', icon_name: 'Eye' },
  { id: 'product_star', section: 'Product Card', section_ar: 'بطاقة المنتج', location: 'Rating Star', location_ar: 'نجمة التقييم', icon_name: 'Star' },
  { id: 'product_new', section: 'Product Card', section_ar: 'بطاقة المنتج', location: 'New Badge', location_ar: 'شارة جديد', icon_name: 'Sparkles' },
  
  // Cart Page
  { id: 'cart_header', section: 'Cart', section_ar: 'صفحة السلة', location: 'Cart Header Icon', location_ar: 'أيقونة السلة', icon_name: 'ShoppingCart' },
  { id: 'cart_back', section: 'Cart', section_ar: 'صفحة السلة', location: 'Back Arrow', location_ar: 'سهم الرجوع', icon_name: 'ArrowLeft' },
  { id: 'cart_plus', section: 'Cart', section_ar: 'صفحة السلة', location: 'Increase Quantity', location_ar: 'زيادة الكمية', icon_name: 'Plus' },
  { id: 'cart_minus', section: 'Cart', section_ar: 'صفحة السلة', location: 'Decrease Quantity', location_ar: 'تقليل الكمية', icon_name: 'Minus' },
  { id: 'cart_delete', section: 'Cart', section_ar: 'صفحة السلة', location: 'Remove Item', location_ar: 'حذف المنتج', icon_name: 'Trash2' },
  { id: 'cart_coupon', section: 'Cart', section_ar: 'صفحة السلة', location: 'Coupon Icon', location_ar: 'أيقونة الكوبون', icon_name: 'Tag' },
  { id: 'cart_payment', section: 'Cart', section_ar: 'صفحة السلة', location: 'Payment Method', location_ar: 'طريقة الدفع', icon_name: 'CreditCard' },
  { id: 'cart_bank', section: 'Cart', section_ar: 'صفحة السلة', location: 'Bank Transfer', location_ar: 'تحويل بنكي', icon_name: 'Building2' },
  { id: 'cart_copy', section: 'Cart', section_ar: 'صفحة السلة', location: 'Copy Button', location_ar: 'زر النسخ', icon_name: 'Copy' },
  { id: 'cart_success', section: 'Cart', section_ar: 'صفحة السلة', location: 'Success Check', location_ar: 'علامة النجاح', icon_name: 'Check' },
  { id: 'cart_whatsapp', section: 'Cart', section_ar: 'صفحة السلة', location: 'WhatsApp', location_ar: 'واتساب', icon_name: 'MessageCircle' },
  
  // About Section
  { id: 'about_shield', section: 'About', section_ar: 'قسم من نحن', location: 'Secure Payments', location_ar: 'دفع آمن', icon_name: 'Shield' },
  { id: 'about_truck', section: 'About', section_ar: 'قسم من نحن', location: 'Fast Delivery', location_ar: 'توصيل سريع', icon_name: 'Truck' },
  { id: 'about_support', section: 'About', section_ar: 'قسم من نحن', location: '24/7 Support', location_ar: 'دعم على مدار الساعة', icon_name: 'Headphones' },
  { id: 'about_quality', section: 'About', section_ar: 'قسم من نحن', location: 'Premium Quality', location_ar: 'جودة فاخرة', icon_name: 'Award' },
  
  // Contact Page
  { id: 'contact_mail', section: 'Contact', section_ar: 'صفحة التواصل', location: 'Email Icon', location_ar: 'أيقونة البريد', icon_name: 'Mail' },
  { id: 'contact_phone', section: 'Contact', section_ar: 'صفحة التواصل', location: 'Phone Icon', location_ar: 'أيقونة الهاتف', icon_name: 'Phone' },
  { id: 'contact_location', section: 'Contact', section_ar: 'صفحة التواصل', location: 'Location Icon', location_ar: 'أيقونة الموقع', icon_name: 'MapPin' },
  { id: 'contact_hours', section: 'Contact', section_ar: 'صفحة التواصل', location: 'Working Hours', location_ar: 'ساعات العمل', icon_name: 'Clock' },
  { id: 'contact_send', section: 'Contact', section_ar: 'صفحة التواصل', location: 'Send Button', location_ar: 'زر الإرسال', icon_name: 'Send' },
  { id: 'contact_instagram', section: 'Contact', section_ar: 'صفحة التواصل', location: 'Instagram', location_ar: 'انستقرام', icon_name: 'Instagram' },
  
  // Footer
  { id: 'footer_mail', section: 'Footer', section_ar: 'التذييل', location: 'Email Icon', location_ar: 'أيقونة البريد', icon_name: 'Mail' },
  { id: 'footer_phone', section: 'Footer', section_ar: 'التذييل', location: 'Phone Icon', location_ar: 'أيقونة الهاتف', icon_name: 'Phone' },
  { id: 'footer_location', section: 'Footer', section_ar: 'التذييل', location: 'Location Icon', location_ar: 'أيقونة الموقع', icon_name: 'MapPin' },
  { id: 'footer_instagram', section: 'Footer', section_ar: 'التذييل', location: 'Instagram', location_ar: 'انستقرام', icon_name: 'Instagram' },
  
  // Reviews
  { id: 'review_star', section: 'Reviews', section_ar: 'التقييمات', location: 'Rating Star', location_ar: 'نجمة التقييم', icon_name: 'Star' },
  { id: 'review_quote', section: 'Reviews', section_ar: 'التقييمات', location: 'Quote Icon', location_ar: 'أيقونة الاقتباس', icon_name: 'MessageCircle' },
  
  // Authentication
  { id: 'auth_login', section: 'Authentication', section_ar: 'المصادقة', location: 'Login Icon', location_ar: 'أيقونة الدخول', icon_name: 'LogIn' },
  { id: 'auth_logout', section: 'Authentication', section_ar: 'المصادقة', location: 'Logout Icon', location_ar: 'أيقونة الخروج', icon_name: 'LogOut' },
  { id: 'auth_register', section: 'Authentication', section_ar: 'المصادقة', location: 'Register Icon', location_ar: 'أيقونة التسجيل', icon_name: 'UserPlus' },
];

export const useIcons = () => {
  const [icons, setIcons] = useState<IconConfig[]>(getDefaultIcons());
  const [loading, setLoading] = useState(true);

  const fetchIcons = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', 'icons')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.metadata) {
        const metadata = data.metadata as { icons?: IconConfig[] };
        if (metadata.icons && metadata.icons.length > 0) {
          // Merge saved icons with default icons (for any new icons added)
          const savedIconsMap = new Map(metadata.icons.map(i => [i.id, i]));
          const mergedIcons = getDefaultIcons().map(defaultIcon => {
            const savedIcon = savedIconsMap.get(defaultIcon.id);
            return savedIcon ? { ...defaultIcon, icon_name: savedIcon.icon_name } : defaultIcon;
          });
          setIcons(mergedIcons);
        }
      }
    } catch (error) {
      console.error('Error fetching icons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIcons();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('icons-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_content',
          filter: 'page_key=eq.icons'
        },
        () => {
          fetchIcons();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = (iconId: string): LucideIcon => {
    const iconConfig = icons.find(i => i.id === iconId);
    return getIconByName(iconConfig?.icon_name || 'Star');
  };

  const getIconName = (iconId: string): string => {
    const iconConfig = icons.find(i => i.id === iconId);
    return iconConfig?.icon_name || 'Star';
  };

  return { icons, loading, getIcon, getIconName, refetch: fetchIcons };
};
