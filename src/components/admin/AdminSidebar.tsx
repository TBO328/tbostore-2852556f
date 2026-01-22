import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Package, Star, Users, Handshake, 
  Ticket, Settings, FileText, Home, LogOut, Palette, Sparkles, MousePointer, Calendar, ArrowRight, Coins
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useVisualEditor } from '@/contexts/VisualEditorContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { id: 'ai-assistant', icon: Sparkles, labelEn: 'AI Assistant', labelAr: 'المساعد الذكي' },
  { id: 'visual-editor', icon: MousePointer, labelEn: 'Visual Edits', labelAr: 'التحرير المرئي', isSpecial: true },
  { id: 'orders', icon: ShoppingBag, labelEn: 'Orders', labelAr: 'الطلبات' },
  { id: 'products', icon: Package, labelEn: 'Products', labelAr: 'المنتجات' },
  { id: 'packages', icon: Package, labelEn: 'Packages', labelAr: 'الباقات' },
  { id: 'reviews', icon: Star, labelEn: 'Reviews', labelAr: 'التقييمات' },
  { id: 'user-management', icon: Users, labelEn: 'User Management', labelAr: 'إدارة المستخدمين' },
  { id: 'partners', icon: Handshake, labelEn: 'Partners', labelAr: 'الشركاء' },
  { id: 'coupons', icon: Ticket, labelEn: 'Coupons', labelAr: 'الكوبونات' },
  { id: 'loyalty', icon: Coins, labelEn: 'Loyalty Program', labelAr: 'نقاط الولاء' },
  { id: 'seasonal-themes', icon: Calendar, labelEn: 'Updates', labelAr: 'التحديثات' },
  { id: 'pages', icon: FileText, labelEn: 'Pages', labelAr: 'الصفحات' },
  { id: 'icons', icon: Palette, labelEn: 'Icons', labelAr: 'الأيقونات' },
  { id: 'settings', icon: Settings, labelEn: 'Settings', labelAr: 'الإعدادات' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, isOpen = true, onClose }) => {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const { enableEditMode } = useVisualEditor();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isRTL = language === 'ar';

  const handleTabClick = (item: typeof menuItems[0]) => {
    if (item.id === 'visual-editor') {
      enableEditMode();
      navigate('/');
    } else {
      onTabChange(item.id);
      if (isMobile && onClose) {
        onClose();
      }
    }
  };

  // On mobile, don't render if not open
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}
      
      <motion.aside
        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "fixed top-0 h-screen bg-card/95 backdrop-blur-xl border-border z-40 flex flex-col",
          isMobile ? "w-72" : "w-64",
          isRTL ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {language === 'en' ? 'Admin Panel' : 'لوحة التحكم'}
              </h1>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                {user?.email}
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isSpecial = 'isSpecial' in item && item.isSpecial;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm",
                  isSpecial 
                    ? "bg-gradient-to-r from-secondary/20 to-primary/20 text-primary border border-primary/30 hover:from-secondary/30 hover:to-primary/30"
                    : isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">
                  {language === 'en' ? item.labelEn : item.labelAr}
                </span>
                {isActive && !isSpecial && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={cn(
                      "w-1.5 h-1.5 rounded-full bg-primary-foreground flex-shrink-0",
                      isRTL ? "mr-auto" : "ml-auto"
                    )}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>{language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}</span>
          </Button>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;