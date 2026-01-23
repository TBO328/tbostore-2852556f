import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, TrendingUp, Package, DollarSign, 
  ArrowUpRight, ArrowDownRight, Users, Star 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import sarSymbol from '@/assets/sar-symbol.png';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalReviews?: number;
}

interface AdminDashboardProps {
  stats: DashboardStats;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
  const { language } = useLanguage();
  const { formatPrice, currency } = useCurrency();
  const { theme } = useTheme();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const statCards = [
    {
      title: language === 'en' ? 'Total Orders' : 'إجمالي الطلبات',
      value: stats.totalOrders,
      icon: ShoppingBag,
      trend: '+12%',
      trendUp: true,
      gradient: 'from-primary/20 via-primary/10 to-transparent',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
      borderColor: 'border-primary/30'
    },
    {
      title: language === 'en' ? 'Pending' : 'قيد الانتظار',
      value: stats.pendingOrders,
      icon: TrendingUp,
      trend: stats.pendingOrders > 0 ? 'Action needed' : 'All clear',
      trendUp: stats.pendingOrders === 0,
      gradient: 'from-yellow-500/20 via-yellow-500/10 to-transparent',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: language === 'en' ? 'Delivered' : 'تم التسليم',
      value: stats.deliveredOrders,
      icon: Package,
      trend: '+8%',
      trendUp: true,
      gradient: 'from-green-500/20 via-green-500/10 to-transparent',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500/30'
    },
    {
      title: language === 'en' ? 'Revenue' : 'الإيرادات',
      value: stats.totalRevenue,
      isPrice: true,
      icon: DollarSign,
      trend: '+23%',
      trendUp: true,
      gradient: 'from-secondary/20 via-secondary/10 to-transparent',
      iconBg: 'bg-secondary/20',
      iconColor: 'text-secondary',
      borderColor: 'border-secondary/30'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 p-6"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Welcome back! 👋' : 'أهلاً بعودتك! 👋'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Here\'s what\'s happening with your store today.'
              : 'إليك ما يحدث في متجرك اليوم.'}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400 }
            }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.borderColor} p-4 md:p-5 group cursor-pointer`}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <motion.div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <card.icon className={`w-5 h-5 md:w-6 md:h-6 ${card.iconColor}`} />
                </motion.div>
                
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  card.trendUp 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {card.trendUp ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">{card.trend}</span>
                </div>
              </div>

              <div className="space-y-1">
                <motion.p 
                  className="text-2xl md:text-3xl font-bold text-foreground"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                >
                  {card.isPrice ? formatPriceWithSymbol(card.value) : card.value}
                </motion.p>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
                  {card.title}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Package, label: language === 'en' ? 'Products' : 'المنتجات', count: stats.totalProducts },
          { icon: ShoppingBag, label: language === 'en' ? 'Orders' : 'الطلبات', count: stats.totalOrders },
          { icon: Users, label: language === 'en' ? 'Customers' : 'العملاء', count: '-' },
          { icon: Star, label: language === 'en' ? 'Reviews' : 'التقييمات', count: stats.totalReviews || '-' }
        ].map((action, index) => (
          <motion.div
            key={action.label}
            whileHover={{ y: -2 }}
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <action.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-lg font-bold text-primary">{action.count}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
