import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Package, Star, Users, Handshake, Ticket, Settings, 
  FileText, Home, LogOut, Palette, Sparkles, MousePointer, Calendar, 
  Coins, LayoutDashboard, X, ChevronRight, Tag, Crown, MessageCircle, Image, BarChart3, UserPlus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useVisualEditor } from '@/contexts/VisualEditorContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isOwner?: boolean;
}

const menuItems = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    labelEn: 'Dashboard',
    labelAr: 'لوحة المعلومات',
    color: 'text-primary'
  },
  {
    id: 'analytics',
    icon: BarChart3,
    labelEn: 'Analytics',
    labelAr: 'التحليلات',
    color: 'text-emerald-500'
  },
  {
    id: 'ai-assistant',
    icon: Sparkles,
    labelEn: 'AI Assistant',
    labelAr: 'المساعد الذكي',
    color: 'text-purple-500'
  },
  {
    id: 'visual-editor',
    icon: MousePointer,
    labelEn: 'Visual Edits',
    labelAr: 'التحرير المرئي',
    isSpecial: true,
    color: 'text-cyan-500'
  },
  { type: 'divider', labelEn: 'Management', labelAr: 'الإدارة' },
  {
    id: 'orders',
    icon: ShoppingBag,
    labelEn: 'Orders',
    labelAr: 'الطلبات',
    color: 'text-blue-500'
  },
  {
    id: 'expenses',
    icon: Coins,
    labelEn: 'Expenses',
    labelAr: 'المصروفات',
    color: 'text-red-500'
  },
  {
    id: 'chats',
    icon: MessageCircle,
    labelEn: 'Chats',
    labelAr: 'الدردشات',
    color: 'text-cyan-500'
  },
  {
    id: 'products',
    icon: Package,
    labelEn: 'Products',
    labelAr: 'المنتجات',
    color: 'text-green-500'
  },
  {
    id: 'categories',
    icon: Tag,
    labelEn: 'Categories',
    labelAr: 'الفئات',
    color: 'text-emerald-500'
  },
  {
    id: 'packages',
    icon: Package,
    labelEn: 'Packages',
    labelAr: 'الباقات',
    color: 'text-orange-500'
  },
  {
    id: 'reviews',
    icon: Star,
    labelEn: 'Reviews',
    labelAr: 'التقييمات',
    color: 'text-yellow-500'
  },
  { type: 'divider', labelEn: 'Users & Marketing', labelAr: 'المستخدمين والتسويق' },
  {
    id: 'user-management',
    icon: Users,
    labelEn: 'Users',
    labelAr: 'المستخدمين',
    color: 'text-indigo-500'
  },
  {
    id: 'partners',
    icon: Handshake,
    labelEn: 'Partners',
    labelAr: 'الشركاء',
    color: 'text-pink-500'
  },
  {
    id: 'coupons',
    icon: Ticket,
    labelEn: 'Coupons',
    labelAr: 'الكوبونات',
    color: 'text-red-500'
  },
  {
    id: 'loyalty',
    icon: Coins,
    labelEn: 'Loyalty',
    labelAr: 'نقاط الولاء',
    color: 'text-amber-500'
  },
  {
    id: 'referrals',
    icon: UserPlus,
    labelEn: 'Referrals',
    labelAr: 'الإحالات',
    color: 'text-teal-500'
  },
  {
    id: 'affiliates',
    icon: Handshake,
    labelEn: 'Affiliates',
    labelAr: 'الشراكات',
    color: 'text-orange-500'
  },
  {
    id: 'ranks',
    icon: Crown,
    labelEn: 'Ranks',
    labelAr: 'الرتب',
    color: 'text-yellow-500'
  },
  {
    id: 'portfolio',
    icon: Image,
    labelEn: 'Our Works',
    labelAr: 'أعمالنا',
    color: 'text-rose-500'
  },
  { type: 'divider', labelEn: 'Customization', labelAr: 'التخصيص' },
  {
    id: 'seasonal-themes',
    icon: Calendar,
    labelEn: 'Updates',
    labelAr: 'التحديثات',
    color: 'text-teal-500'
  },
  {
    id: 'pages',
    icon: FileText,
    labelEn: 'Pages',
    labelAr: 'الصفحات',
    color: 'text-slate-500'
  },
  {
    id: 'icons',
    icon: Palette,
    labelEn: 'Icons',
    labelAr: 'الأيقونات',
    color: 'text-violet-500'
  },
  {
    id: 'settings',
    icon: Settings,
    labelEn: 'Settings',
    labelAr: 'الإعدادات',
    color: 'text-gray-500'
  }
];

const AdminSidebarNew: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen = true,
  onClose,
  isOwner = false
}) => {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const { enableEditMode } = useVisualEditor();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isRTL = language === 'ar';
  
  // Filter menu items based on role
  // Owner only: user-management
  // Both Owner and Admin: everything else
  const filteredMenuItems = menuItems.filter(item => {
    if (item.type === 'divider') return true;
    if (item.id === 'user-management') return isOwner;
    return true;
  });
  const handleTabClick = (item: typeof menuItems[0]) => {
    if (item.type === 'divider') return;
    
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

  const sidebarVariants = {
    hidden: { 
      x: isRTL ? 280 : -280,
      opacity: 0 
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      x: isRTL ? 280 : -280,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isRTL ? 20 : -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    })
  };

  if (isMobile && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          "fixed top-0 h-screen z-50 flex flex-col",
          "bg-gradient-to-b from-card via-card to-card/95",
          "border-border/50 shadow-2xl",
          isMobile ? "w-[280px]" : "w-[260px]",
          isRTL ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        {/* Header */}
        <div className="relative p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div className="min-w-0">
                <h1 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {language === 'en' ? 'Admin Panel' : 'لوحة التحكم'}
                </h1>
                <p className="text-xs text-muted-foreground truncate max-w-[130px]">
                  {user?.email}
                </p>
              </div>
            </Link>
            
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {filteredMenuItems.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <motion.div
                    key={`divider-${index}`}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="pt-4 pb-2 px-3"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {language === 'en' ? item.labelEn : item.labelAr}
                    </span>
                  </motion.div>
                );
              }

              const Icon = item.icon!;
              const isActive = activeTab === item.id;
              const isSpecial = 'isSpecial' in item && item.isSpecial;

              return (
                <motion.button
                  key={item.id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handleTabClick(item)}
                  whileHover={{ x: isRTL ? -4 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group relative overflow-hidden",
                    isSpecial 
                      ? "bg-gradient-to-r from-cyan-500/10 to-primary/10 text-cyan-500 border border-cyan-500/20 hover:border-cyan-500/40" 
                      : isActive 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {/* Active indicator glow */}
                  {isActive && !isSpecial && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50"
                      transition={{ type: "spring", bounce: 0.2 }}
                    />
                  )}
                  
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    isActive && !isSpecial 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      isActive ? "text-primary-foreground" : item.color
                    )} />
                  </div>
                  
                  <span className="font-medium truncate relative z-10">
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

                  {isSpecial && (
                    <ChevronRight className={cn(
                      "w-4 h-4 ml-auto opacity-50",
                      isRTL && "rotate-180"
                    )} />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="relative p-4 border-t border-border/50">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="ghost" 
              onClick={signOut} 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-destructive" />
              </div>
              <span className="font-medium">
                {language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
              </span>
            </Button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebarNew;
