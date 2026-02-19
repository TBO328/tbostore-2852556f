import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Package, Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import sarSymbol from '@/assets/sar-symbol.png';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{ name: string; nameAr: string; quantity: number; price: number }>;
}

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const AnalyticsDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { formatPrice, currency } = useCurrency();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const symbolFilter = theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders((data || []).map(o => ({
        ...o,
        items: o.items as Order['items']
      })));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const dailySalesData = useMemo(() => {
    const now = new Date();
    let daysBack = 7;
    if (period === 'month') daysBack = 30;
    if (period === 'year') daysBack = 365;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    const grouped: Record<string, { revenue: number; count: number }> = {};

    orders.forEach(order => {
      const date = new Date(order.created_at);
      if (date < startDate) return;

      let key: string;
      if (period === 'year') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${date.getMonth() + 1}/${date.getDate()}`;
      }

      if (!grouped[key]) grouped[key] = { revenue: 0, count: 0 };
      grouped[key].revenue += Number(order.total_amount);
      grouped[key].count += 1;
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      [language === 'en' ? 'Revenue' : 'الإيرادات']: Math.round(data.revenue * 100) / 100,
      [language === 'en' ? 'Orders' : 'الطلبات']: data.count,
    }));
  }, [orders, period, language]);

  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; nameAr: string; quantity: number; revenue: number }> = {};

    orders.forEach(order => {
      if (!Array.isArray(order.items)) return;
      order.items.forEach(item => {
        const key = item.name || item.nameAr;
        if (!productMap[key]) {
          productMap[key] = { name: item.name, nameAr: item.nameAr, quantity: 0, revenue: 0 };
        }
        productMap[key].quantity += item.quantity || 1;
        productMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8)
      .map(p => ({
        name: language === 'en' ? (p.name || p.nameAr) : (p.nameAr || p.name),
        [language === 'en' ? 'Quantity' : 'الكمية']: p.quantity,
        [language === 'en' ? 'Revenue' : 'الإيرادات']: Math.round(p.revenue * 100) / 100,
      }));
  }, [orders, language]);

  const statusDistribution = useMemo(() => {
    const statusMap: Record<string, number> = {};
    orders.forEach(order => {
      const status = order.status || 'pending';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const statusLabels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      processing: { en: 'Processing', ar: 'قيد المعالجة' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };

    return Object.entries(statusMap).map(([status, count]) => ({
      name: language === 'en' ? (statusLabels[status]?.en || status) : (statusLabels[status]?.ar || status),
      value: count,
    }));
  }, [orders, language]);

  const summaryStats = useMemo(() => {
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = orders.filter(o => {
      const d = new Date(o.created_at);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });

    const thisRevenue = thisMonth.reduce((s, o) => s + Number(o.total_amount), 0);
    const lastRevenue = lastMonth.reduce((s, o) => s + Number(o.total_amount), 0);
    const growth = lastRevenue > 0 ? ((thisRevenue - lastRevenue) / lastRevenue * 100) : 0;

    return {
      thisMonthOrders: thisMonth.length,
      thisMonthRevenue: thisRevenue,
      lastMonthRevenue: lastRevenue,
      growth: Math.round(growth),
      avgOrderValue: thisMonth.length > 0 ? Math.round(thisRevenue / thisMonth.length * 100) / 100 : 0,
    };
  }, [orders]);

  const formatAmount = (val: number) => {
    if (currency === 'SAR') return `${val.toFixed(2)} ر.س`;
    return formatPrice(val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const revenueKey = language === 'en' ? 'Revenue' : 'الإيرادات';
  const ordersKey = language === 'en' ? 'Orders' : 'الطلبات';
  const quantityKey = language === 'en' ? 'Quantity' : 'الكمية';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {language === 'en' ? 'Sales Analytics' : 'تحليلات المبيعات'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'en' ? `${orders.length} total orders analyzed` : `${orders.length} طلب تم تحليله`}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: language === 'en' ? 'This Month Orders' : 'طلبات هذا الشهر',
            value: summaryStats.thisMonthOrders,
            icon: Package,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: language === 'en' ? 'This Month Revenue' : 'إيرادات هذا الشهر',
            value: formatAmount(summaryStats.thisMonthRevenue),
            icon: TrendingUp,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
          },
          {
            label: language === 'en' ? 'Avg Order Value' : 'متوسط قيمة الطلب',
            value: formatAmount(summaryStats.avgOrderValue),
            icon: BarChart3,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
          },
          {
            label: language === 'en' ? 'Monthly Growth' : 'النمو الشهري',
            value: `${summaryStats.growth > 0 ? '+' : ''}${summaryStats.growth}%`,
            icon: TrendingUp,
            color: summaryStats.growth >= 0 ? 'text-green-500' : 'text-red-500',
            bg: summaryStats.growth >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {language === 'en' ? 'Revenue Over Time' : 'الإيرادات عبر الزمن'}
          </h3>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)} className="w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs px-3 h-7">
                {language === 'en' ? '7 Days' : '7 أيام'}
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 h-7">
                {language === 'en' ? '30 Days' : '30 يوم'}
              </TabsTrigger>
              <TabsTrigger value="year" className="text-xs px-3 h-7">
                {language === 'en' ? 'Year' : 'سنة'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {dailySalesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey={revenueKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {language === 'en' ? 'No data for this period' : 'لا توجد بيانات لهذه الفترة'}
          </div>
        )}
      </div>

      {/* Bottom Section: Top Products + Status Pie */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-green-500" />
            {language === 'en' ? 'Best Selling Products' : 'أفضل المنتجات مبيعاً'}
          </h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" fontSize={11} width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Bar dataKey={quantityKey} fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              {language === 'en' ? 'No product data yet' : 'لا توجد بيانات منتجات'}
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            {language === 'en' ? 'Order Status Distribution' : 'توزيع حالات الطلبات'}
          </h3>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              {language === 'en' ? 'No orders yet' : 'لا توجد طلبات'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
