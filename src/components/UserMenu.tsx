import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Sparkles, Heart, ShoppingBag, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

const UserMenu: React.FC = () => {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <Link to="/auth">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </motion.div>
      </Link>
    );
  }

  const menuItems = [
    {
      icon: Settings,
      label: language === 'en' ? 'Account Settings' : 'إعدادات الحساب',
      href: '/profile',
    },
    {
      icon: Sparkles,
      label: language === 'en' ? 'Customize Experience' : 'تخصيص تجربتي',
      href: '/profile',
    },
    {
      icon: Heart,
      label: language === 'en' ? 'Favorites' : 'المفضلة',
      href: '/favorites',
    },
    {
      icon: ShoppingBag,
      label: language === 'en' ? 'My Orders' : 'طلباتي',
      href: '/my-orders',
    },
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="relative">
            <User className="w-5 h-5 text-primary" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 bg-card/95 backdrop-blur-xl border-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-foreground">
            {language === 'en' ? 'Welcome back!' : 'أهلاً بعودتك!'}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        {menuItems.map((item, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link
              to={item.href}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-muted transition-colors"
            >
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">{language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
