import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, FileText, Loader2, Check, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReceiptUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  orderId: string;
  paymentMethod: string;
  onComplete: () => void;
}

const WHATSAPP_NUMBER = '905510070277';

const ReceiptUploadDialog: React.FC<ReceiptUploadDialogProps> = ({
  open,
  onOpenChange,
  orderNumber,
  orderId,
  paymentMethod,
  onComplete,
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customerNote, setCustomerNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({
          title: language === 'ar' ? 'نوع ملف غير مدعوم' : 'Unsupported file type',
          description: language === 'ar' ? 'يرجى رفع صورة أو PDF' : 'Please upload an image or PDF',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: language === 'ar' ? 'حجم الملف كبير جداً' : 'File too large',
          description: language === 'ar' ? 'الحد الأقصى 5 ميجابايت' : 'Maximum 5MB allowed',
          variant: 'destructive',
        });
        return;
      }
      
      setReceiptFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!receiptFile) {
      toast({
        title: language === 'ar' ? 'يرجى اختيار ملف' : 'Please select a file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${orderId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // Save receipt record
      const { error: insertError } = await supabase
        .from('payment_receipts')
        .insert({
          order_id: orderId,
          order_number: orderNumber,
          receipt_url: urlData.publicUrl,
          customer_note: customerNote.trim() || null,
          payment_method: paymentMethod,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Send WhatsApp notification
      sendWhatsAppNotification(urlData.publicUrl);

      setIsComplete(true);
      
      toast({
        title: language === 'ar' ? 'تم رفع الإيصال بنجاح!' : 'Receipt uploaded successfully!',
        description: language === 'ar' ? 'سنراجع إيصالك قريباً' : 'We will review your receipt soon',
      });

      // Close after delay
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: language === 'ar' ? 'فشل في الرفع' : 'Upload failed',
        description: language === 'ar' ? 'يرجى المحاولة مرة أخرى' : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sendWhatsAppNotification = (receiptUrl: string) => {
    const paymentMethodText = paymentMethod === 'stc_pay' ? 'STC Pay' : (language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer');
    
    const message = language === 'ar'
      ? `📎 إيصال الدفع\n\n📋 رقم الطلب: ${orderNumber}\n💳 طريقة الدفع: ${paymentMethodText}\n\n🖼️ رابط الإيصال:\n${receiptUrl}${customerNote ? `\n\n📝 ملاحظة: ${customerNote}` : ''}`
      : `📎 Payment Receipt\n\n📋 Order #: ${orderNumber}\n💳 Payment: ${paymentMethodText}\n\n🖼️ Receipt Link:\n${receiptUrl}${customerNote ? `\n\n📝 Note: ${customerNote}` : ''}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const resetForm = () => {
    setReceiptFile(null);
    setPreviewUrl(null);
    setCustomerNote('');
    setIsComplete(false);
  };

  const handleSkip = () => {
    // Send WhatsApp with request for receipt
    const paymentMethodText = paymentMethod === 'stc_pay' ? 'STC Pay' : (language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer');
    const message = language === 'ar'
      ? `🛒 طلب جديد\n\n📋 رقم الطلب: ${orderNumber}\n💳 طريقة الدفع: ${paymentMethodText}\n\n📎 سأقوم بإرسال إيصال التحويل لاحقاً`
      : `🛒 New Order\n\n📋 Order #: ${orderNumber}\n💳 Payment: ${paymentMethodText}\n\n📎 I will send the transfer receipt later`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    
    onComplete();
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isUploading) onOpenChange(o); }}>
      <DialogContent className="max-w-md bg-card border-border" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {language === 'ar' ? 'إكمال الطلب' : 'Complete Order'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {language === 'ar' ? 'تم بنجاح!' : 'Success!'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'شكراً لك، سنراجع إيصالك قريباً' : 'Thank you, we will review your receipt soon'}
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
                <p className="text-sm text-foreground text-center">
                  {language === 'ar' 
                    ? `رقم الطلب: ${orderNumber}` 
                    : `Order #: ${orderNumber}`}
                </p>
              </div>

              <p className="text-muted-foreground text-center">
                {language === 'ar'
                  ? 'يرجى رفع صورة أو وصل التحويل لإتمام الطلب'
                  : 'Please upload the transfer receipt to complete your order'}
              </p>

              {/* File Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer
                  ${receiptFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Receipt preview" 
                      className="w-full h-40 object-contain rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceiptFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : receiptFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="w-12 h-12 text-primary" />
                    <span className="text-sm text-foreground font-medium">{receiptFile.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceiptFile(null);
                      }}
                      className="text-xs text-destructive hover:underline"
                    >
                      {language === 'ar' ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <Image className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {language === 'ar' ? 'اضغط لرفع الإيصال' : 'Click to upload receipt'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' ? 'صورة أو PDF (حد أقصى 5MB)' : 'Image or PDF (max 5MB)'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Note */}
              <div className="space-y-2">
                <Label htmlFor="note">
                  {language === 'ar' ? 'ملاحظات للبائع (اختياري)' : 'Notes for seller (optional)'}
                </Label>
                <Textarea
                  id="note"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder={language === 'ar' ? 'أضف أي ملاحظات...' : 'Add any notes...'}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!receiptFile || isUploading}
                  className="w-full"
                  variant="neon"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'رفع الإيصال وإرسال للواتساب' : 'Upload & Send to WhatsApp'}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  disabled={isUploading}
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إرسال للواتساب بدون إيصال' : 'Send to WhatsApp without receipt'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptUploadDialog;
