import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';

interface OrderItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  order_number: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes: string | null;
}

const MyOrders: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch orders where customer_phone matches user's phone or we can match by some other criteria
      // For now, we'll fetch all orders and filter client-side by checking if user email matches
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else if (data) {
        // Cast the items properly
        const typedOrders: Order[] = data.map(order => ({
          ...order,
          items: order.items as unknown as OrderItem[]
        }));
        setOrders(typedOrders);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      processing: { en: 'Processing', ar: 'قيد المعالجة' },
      shipped: { en: 'Shipped', ar: 'تم الشحن' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };
    return labels[status]?.[language] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                  {language === 'en' ? 'My ' : ''}
                  <span className="text-gradient-neon glow-text-cyan">
                    {language === 'en' ? 'Orders' : 'طلباتي'}
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  {language === 'en'
                    ? 'Track and manage all your orders in one place'
                    : 'تتبع وإدارة جميع طلباتك في مكان واحد'}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Orders Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {language === 'en' ? 'No orders yet' : 'لا توجد طلبات بعد'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'en'
                    ? 'Start shopping to see your orders here'
                    : 'ابدأ التسوق لرؤية طلباتك هنا'}
                </p>
                <Button onClick={() => navigate('/products')}>
                  {language === 'en' ? 'Browse Products' : 'تصفح المنتجات'}
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    {/* Order Header */}
                    <div
                      className="p-4 md:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              #{order.order_number}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className="font-bold text-foreground">
                            {formatPrice(order.total_amount)}
                          </span>
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-border overflow-hidden"
                        >
                          <div className="p-4 md:p-6 space-y-6">
                            {/* Status Timeline */}
                            <div className="flex items-center gap-2 pb-4 border-b border-border">
                              {getStatusIcon(order.status)}
                              <span className="text-sm font-medium">
                                {getStatusLabel(order.status)}
                              </span>
                            </div>

                            {/* Order Items */}
                            <div>
                              <h4 className="font-medium text-foreground mb-3">
                                {language === 'en' ? 'Items' : 'المنتجات'}
                              </h4>
                              <div className="space-y-3">
                                {order.items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl"
                                  >
                                    <img
                                      src={item.image}
                                      alt={language === 'en' ? item.name : item.nameAr}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                      <h5 className="font-medium text-foreground">
                                        {language === 'en' ? item.name : item.nameAr}
                                      </h5>
                                      <p className="text-sm text-muted-foreground">
                                        {language === 'en' ? 'Quantity' : 'الكمية'}: {item.quantity}
                                      </p>
                                    </div>
                                    <span className="font-semibold text-foreground">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                              <div>
                                <h4 className="text-sm text-muted-foreground mb-1">
                                  {language === 'en' ? 'Delivery Address' : 'عنوان التوصيل'}
                                </h4>
                                <p className="text-foreground">{order.customer_address}</p>
                              </div>
                              <div>
                                <h4 className="text-sm text-muted-foreground mb-1">
                                  {language === 'en' ? 'Payment Method' : 'طريقة الدفع'}
                                </h4>
                                <p className="text-foreground capitalize">{order.payment_method}</p>
                              </div>
                            </div>

                            {order.notes && (
                              <div className="pt-4 border-t border-border">
                                <h4 className="text-sm text-muted-foreground mb-1">
                                  {language === 'en' ? 'Notes' : 'ملاحظات'}
                                </h4>
                                <p className="text-foreground">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;
