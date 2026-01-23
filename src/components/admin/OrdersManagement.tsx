import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapErrorToUserMessage } from '@/lib/errors';
import sarSymbol from '@/assets/sar-symbol.png';

interface OrderItemCustomization {
  hasLogo?: boolean;
  logoFile?: string;
  selectedColor?: string;
  customHexColor?: string;
  installLocation?: string;
  contactMethod?: string;
  selectedFeatures?: string[];
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{
    id: string;
    name: string;
    nameAr: string;
    price: number;
    quantity: number;
    image: string;
    customization?: OrderItemCustomization;
  }>;
  payment_method: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

interface OrdersManagementProps {
  orders: Order[];
  onRefresh: () => void;
}

const OrdersManagement: React.FC<OrdersManagementProps> = ({ orders, onRefresh }) => {
  const { language, t } = useLanguage();
  const { formatPrice, currency } = useCurrency();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'shipped': return 'bg-purple-500/20 text-purple-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'في الانتظار' },
      confirmed: { en: 'Confirmed', ar: 'مؤكد' },
      shipped: { en: 'Shipped', ar: 'تم الشحن' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };
    return statusMap[status]?.[language] || status;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'en' ? 'Status updated!' : 'تم تحديث الحالة!',
      });
      onRefresh();
    }
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete.id);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Order deleted!' : 'تم حذف الطلب!',
        description: language === 'en' 
          ? `Order ${orderToDelete.order_number} has been removed. Revenue updated.`
          : `تم حذف الطلب ${orderToDelete.order_number}. تم تحديث الإيرادات.`,
      });

      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      onRefresh();
    } catch (error: unknown) {
      const userMessage = mapErrorToUserMessage(error, language);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {t('manageOrders')}
        </h2>
        <span className="text-sm text-muted-foreground">
          {orders.length} {language === 'en' ? 'orders' : 'طلب'}
        </span>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono font-bold text-foreground text-lg">
                    {order.order_number}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">{order.customer_name}</span>
                  </p>
                  <p className="text-muted-foreground">{order.customer_phone}</p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-primary font-bold">{formatPriceWithSymbol(order.total_amount)}</span>
                  <span className="text-sm text-muted-foreground">
                    • {order.items.length} {language === 'en' ? 'items' : 'منتجات'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{getStatusText('pending')}</SelectItem>
                    <SelectItem value="confirmed">{getStatusText('confirmed')}</SelectItem>
                    <SelectItem value="shipped">{getStatusText('shipped')}</SelectItem>
                    <SelectItem value="delivered">{getStatusText('delivered')}</SelectItem>
                    <SelectItem value="cancelled">{getStatusText('cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)} className="gap-2">
                  <Tag className="w-4 h-4" />
                  {language === 'ar' ? 'التفاصيل' : 'Details'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteClick(order)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t('noOrders')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'en' ? 'Orders will appear here when customers place them' : 'ستظهر الطلبات هنا عندما يقوم العملاء بالطلب'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('orderDetails')}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('orderNumber')}</p>
                  <p className="font-mono font-bold">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'en' ? 'Date' : 'التاريخ'}</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">{t('customerInfo')}</h4>
                <p><span className="text-muted-foreground">{t('fullName')}:</span> {selectedOrder.customer_name}</p>
                <p><span className="text-muted-foreground">{t('phoneNumber')}:</span> {selectedOrder.customer_phone}</p>
                <p><span className="text-muted-foreground">{t('address')}:</span> {selectedOrder.customer_address}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">{language === 'en' ? 'Items' : 'المنتجات'}</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{language === 'ar' ? item.nameAr : item.name}</p>
                          <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <p className="font-bold text-primary">{formatPriceWithSymbol(item.price * item.quantity)}</p>
                      </div>
                      
                      {/* Customization Details */}
                      {item.customization && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <h5 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            {language === 'en' ? 'Customization Details' : 'تفاصيل التخصيص'}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {/* Logo */}
                            {item.customization.hasLogo !== undefined && (
                              <div className="flex items-start gap-2">
                                <span className="text-muted-foreground min-w-[80px]">
                                  {language === 'en' ? 'Logo:' : 'الشعار:'}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {item.customization.hasLogo 
                                      ? (language === 'en' ? 'Yes' : 'نعم')
                                      : (language === 'en' ? 'No' : 'لا')
                                    }
                                  </span>
                                  {item.customization.hasLogo && item.customization.logoFile && (
                                    <img 
                                      src={item.customization.logoFile} 
                                      alt="Logo" 
                                      className="mt-2 w-16 h-16 rounded-lg object-contain bg-card border border-border"
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Color */}
                            {item.customization.selectedColor && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground min-w-[80px]">
                                  {language === 'en' ? 'Color:' : 'اللون:'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                                    style={{ backgroundColor: item.customization.selectedColor }}
                                  />
                                  <span className="font-mono text-xs">{item.customization.selectedColor}</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Installation Location */}
                            {item.customization.installLocation && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground min-w-[80px]">
                                  {language === 'en' ? 'Platform:' : 'المنصة:'}
                                </span>
                                <span className="font-medium capitalize">{item.customization.installLocation}</span>
                              </div>
                            )}
                            
                            {/* Contact Method */}
                            {item.customization.contactMethod && (
                              <div className="flex items-center gap-2 col-span-full">
                                <span className="text-muted-foreground min-w-[80px]">
                                  {language === 'en' ? 'Contact:' : 'التواصل:'}
                                </span>
                                <span className="font-medium text-primary">{item.customization.contactMethod}</span>
                              </div>
                            )}
                            
                            {/* Selected Features */}
                            {item.customization.selectedFeatures && item.customization.selectedFeatures.length > 0 && (
                              <div className="col-span-full">
                                <span className="text-muted-foreground block mb-1">
                                  {language === 'en' ? 'Selected Features:' : 'الميزات المختارة:'}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {item.customization.selectedFeatures.map((feature, idx) => (
                                    <span 
                                      key={idx}
                                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                                    >
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">{t('paymentMethod')}</span>
                  <span className="font-medium">
                    {selectedOrder.payment_method === 'stc_pay' ? 'STC Pay' : t('bankTransfer')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('totalPrice')}</span>
                  <span className="text-primary">{formatPriceWithSymbol(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Delete Order?' : 'حذف الطلب؟'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? `Are you sure you want to delete order ${orderToDelete?.order_number}? This will remove the order and its amount (${orderToDelete?.total_amount.toFixed(2)}) from the total revenue. This action cannot be undone.`
                : `هل أنت متأكد من حذف الطلب ${orderToDelete?.order_number}؟ سيتم إزالة الطلب ومبلغه (${orderToDelete?.total_amount.toFixed(2)}) من إجمالي الإيرادات. لا يمكن التراجع عن هذا الإجراء.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Deleting...' : 'جاري الحذف...'}
                </>
              ) : (
                language === 'en' ? 'Delete' : 'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersManagement;
