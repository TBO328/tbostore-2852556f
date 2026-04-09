import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, DollarSign, ShoppingBag, TrendingUp, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const StreamerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [affiliate, setAffiliate] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: aff } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .maybeSingle();

    if (aff) {
      setAffiliate(aff);
      const { data: affOrders } = await supabase
        .from('affiliate_orders')
        .select('*')
        .eq('affiliate_id', aff.id)
        .order('created_at', { ascending: false });
      setOrders(affOrders || []);
    }
    setLoading(false);
  };

  const copyCode = () => {
    if (affiliate) {
      navigator.clipboard.writeText(affiliate.affiliate_code);
      toast({ title: isRTL ? 'تم نسخ الكود' : 'Code copied!' });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {isRTL ? 'لا يوجد حساب شراكة' : 'No Affiliate Account'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isRTL ? 'تواصل معنا لتفعيل حساب الشراكة الخاص بك' : 'Contact us to activate your affiliate account'}
          </p>
          <Button onClick={() => navigate('/contact')}>
            {isRTL ? 'تواصل معنا' : 'Contact Us'}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const pendingEarnings = orders.filter(o => o.status === 'pending').reduce((s, o) => s + Number(o.commission_amount), 0);
  const paidEarnings = orders.filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.commission_amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isRTL ? 'لوحة تحكم الشريك' : 'Affiliate Dashboard'}
          </h1>
        </div>

        {/* Affiliate Code */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-primary/30 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{isRTL ? 'كود الخصم الخاص بك' : 'Your Affiliate Code'}</p>
              <p className="text-3xl font-bold font-mono text-primary">{affiliate.affiliate_code}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL ? `العمولة: ${affiliate.commission_percent}%` : `Commission: ${affiliate.commission_percent}%`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyCode} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                {isRTL ? 'نسخ' : 'Copy'}
              </Button>
              {affiliate.channel_url && (
                <Button variant="outline" className="gap-2" asChild>
                  <a href={affiliate.channel_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    {isRTL ? 'القناة' : 'Channel'}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: isRTL ? 'إجمالي الطلبات' : 'Total Orders', value: affiliate.total_orders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: isRTL ? 'إجمالي الأرباح' : 'Total Earnings', value: `${Number(affiliate.total_earnings).toFixed(2)} SAR`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: isRTL ? 'أرباح معلقة' : 'Pending', value: `${pendingEarnings.toFixed(2)} SAR`, icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { label: isRTL ? 'تم الدفع' : 'Paid', value: `${paidEarnings.toFixed(2)} SAR`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Orders */}
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {isRTL ? 'سجل الطلبات' : 'Order History'}
        </h2>
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                </p>
                <p className="font-medium text-foreground">
                  {isRTL ? 'مبلغ الطلب:' : 'Order:'} {Number(order.order_amount).toFixed(2)} SAR
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary font-bold">+{Number(order.commission_amount).toFixed(2)} SAR</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {order.status === 'paid' ? (isRTL ? 'مدفوع' : 'Paid') : (isRTL ? 'معلق' : 'Pending')}
                </span>
              </div>
            </motion.div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StreamerDashboard;
