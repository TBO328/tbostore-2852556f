import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  ExternalLink,
  Image,
  FileText,
  MessageCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentReceipt {
  id: string;
  order_id: string;
  order_number: string;
  receipt_url: string;
  customer_note: string | null;
  payment_method: string;
  status: string;
  created_at: string;
}

const PaymentsManagement: React.FC = () => {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchReceipts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('receipts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_receipts',
      }, () => {
        fetchReceipts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الإيصالات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReceiptStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payment_receipts')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: `تم تغيير الحالة إلى ${getStatusLabel(status)}`,
      });
      
      fetchReceipts();
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الحالة',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      approved: 'تمت الموافقة',
      rejected: 'مرفوض',
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      approved: <Check className="w-3 h-3" />,
      rejected: <X className="w-3 h-3" />,
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className="gap-1">
        {icons[status]}
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      stc_pay: 'STC Pay',
      bank_transfer: 'تحويل بنكي',
    };
    return labels[method] || method;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch = receipt.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            المدفوعات والإيصالات
          </h2>
          <p className="text-muted-foreground text-sm">
            إدارة إيصالات التحويل البنكي و STC Pay
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الطلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">تمت الموافقة</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الإيصالات', value: receipts.length, color: 'text-foreground' },
          { label: 'قيد المراجعة', value: receipts.filter(r => r.status === 'pending').length, color: 'text-yellow-500' },
          { label: 'تمت الموافقة', value: receipts.filter(r => r.status === 'approved').length, color: 'text-green-500' },
          { label: 'مرفوض', value: receipts.filter(r => r.status === 'rejected').length, color: 'text-red-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Receipts List */}
      {filteredReceipts.length === 0 ? (
        <div className="text-center py-20">
          <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد إيصالات</h3>
          <p className="text-muted-foreground">لم يتم رفع أي إيصالات بعد</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReceipts.map((receipt, index) => (
            <motion.div
              key={receipt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Receipt Preview */}
                <div 
                  className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedReceipt(receipt);
                    setPreviewOpen(true);
                  }}
                >
                  {isImage(receipt.receipt_url) ? (
                    <img
                      src={receipt.receipt_url}
                      alt="Receipt"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Receipt Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-foreground">#{receipt.order_number}</span>
                    {getStatusBadge(receipt.status)}
                    <Badge variant="outline">{getPaymentMethodLabel(receipt.payment_method)}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {formatDate(receipt.created_at)}
                  </p>
                  
                  {receipt.customer_note && (
                    <div className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                      <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-foreground">{receipt.customer_note}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReceipt(receipt);
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    عرض
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(receipt.receipt_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  {receipt.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateReceiptStatus(receipt.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 ml-1" />
                        موافقة
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateReceiptStatus(receipt.id, 'rejected')}
                      >
                        <X className="w-4 h-4 ml-1" />
                        رفض
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              إيصال الطلب #{selectedReceipt?.order_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(selectedReceipt.status)}
                <Badge variant="outline">{getPaymentMethodLabel(selectedReceipt.payment_method)}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(selectedReceipt.created_at)}
                </span>
              </div>
              
              <div className="rounded-xl overflow-hidden border border-border bg-muted">
                {isImage(selectedReceipt.receipt_url) ? (
                  <img
                    src={selectedReceipt.receipt_url}
                    alt="Receipt"
                    className="w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="p-10 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">ملف PDF</p>
                    <Button onClick={() => window.open(selectedReceipt.receipt_url, '_blank')}>
                      <ExternalLink className="w-4 h-4 ml-2" />
                      فتح الملف
                    </Button>
                  </div>
                )}
              </div>
              
              {selectedReceipt.customer_note && (
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm font-medium text-foreground mb-1">ملاحظة العميل:</p>
                  <p className="text-muted-foreground">{selectedReceipt.customer_note}</p>
                </div>
              )}
              
              {selectedReceipt.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      updateReceiptStatus(selectedReceipt.id, 'approved');
                      setPreviewOpen(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 ml-2" />
                    موافقة
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateReceiptStatus(selectedReceipt.id, 'rejected');
                      setPreviewOpen(false);
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsManagement;
