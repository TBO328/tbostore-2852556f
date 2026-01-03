import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, CheckCircle, XCircle, AlertCircle, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: ActionData;
  actionStatus?: 'pending' | 'success' | 'error';
  imageUrl?: string;
}

interface ActionData {
  action: 'update' | 'insert' | 'delete' | 'upsert' | 'none';
  table?: string;
  data?: Record<string, unknown>;
  condition?: Record<string, unknown>;
  message?: string;
}

interface UploadedImage {
  file: File;
  preview: string;
  uploading: boolean;
  url?: string;
}

const ADMIN_AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai`;

const AIAssistant: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف صورة صالح',
        variant: 'destructive',
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setUploadedImage({ file, preview, uploading: false });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!uploadedImage) return null;

    setIsUploading(true);
    try {
      const fileExt = uploadedImage.file.name.split('.').pop();
      const fileName = `ai-upload-${Date.now()}.${fileExt}`;
      const filePath = `ai-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, uploadedImage.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'خطأ في رفع الصورة',
        description: error instanceof Error ? error.message : 'فشل رفع الصورة',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseAIResponse = (content: string): { text: string; action?: ActionData } => {
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ActionData;
        if (parsed.action) {
          const textBefore = content.substring(0, content.indexOf(jsonMatch[0])).trim();
          return { text: textBefore || parsed.message || '', action: parsed };
        }
      }
    } catch {
      // Not JSON, return as plain text
    }
    return { text: content };
  };

  const executeAction = async (action: ActionData, messageId: string) => {
    if (action.action === 'none') return;

    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, actionStatus: 'pending' as const } : m
    ));

    try {
      const response = await fetch(ADMIN_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ executeAction: action }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, actionStatus: 'success' as const } : m
        ));
        toast({
          title: 'تم بنجاح ✓',
          description: result.message || 'تم تنفيذ الإجراء بنجاح',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, actionStatus: 'error' as const } : m
      ));
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في تنفيذ الإجراء',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !uploadedImage) || isLoading) return;

    // Upload image first if present
    let imageUrl: string | null = null;
    if (uploadedImage) {
      imageUrl = await uploadImage();
      if (!imageUrl && uploadedImage) {
        // Upload failed, don't send message
        return;
      }
    }

    const messageContent = imageUrl 
      ? `${input.trim()}\n\n[صورة مرفوعة: ${imageUrl}]`
      : input.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() || 'صورة مرفقة',
      imageUrl: imageUrl || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    removeImage();
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    let assistantContent = '';

    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    }]);

    try {
      const response = await fetch(ADMIN_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: messageContent }].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m =>
                m.id === assistantMessageId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Parse final response for actions
      const { text, action } = parseAIResponse(assistantContent);
      
      setMessages(prev => prev.map(m =>
        m.id === assistantMessageId ? { 
          ...m, 
          content: text || assistantContent,
          action,
        } : m
      ));

    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => prev.map(m =>
        m.id === assistantMessageId ? {
          ...m,
          content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        } : m
      ));
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'خطأ في الاتصال',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getActionTableName = (table?: string) => {
    const names: Record<string, string> = {
      products: 'المنتجات',
      page_content: 'محتوى الصفحة',
      reviews: 'التقييمات',
      partners: 'الشركاء',
      payment_settings: 'إعدادات الدفع',
      coupons: 'الكوبونات',
      orders: 'الطلبات',
      profiles: 'الملفات الشخصية',
    };
    return names[table || ''] || table;
  };

  const getActionName = (action?: string) => {
    const names: Record<string, string> = {
      update: 'تحديث',
      insert: 'إضافة',
      delete: 'حذف',
      upsert: 'تحديث/إضافة',
    };
    return names[action || ''] || action;
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-background rounded-xl border border-border overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">مساعد TBO الذكي</h2>
            <p className="text-xs text-muted-foreground">
              صف ما تريد تغييره وسأقوم بتنفيذه فوراً
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">كيف يمكنني مساعدتك؟</h3>
                <p className="text-sm text-muted-foreground">
                  أنا مساعدك الذكي لإدارة متجر TBO. يمكنني تعديل المنتجات، المحتوى، التقييمات، الكوبونات، والمزيد!
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'غير عنوان الصفحة الرئيسية',
                  'أضف منتج جديد بسعر 100 ريال',
                  'أنشئ كوبون خصم 20%',
                  'عرض جميع الطلبات',
                  'غير رقم STC Pay',
                ].map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-primary/20 to-secondary/20"
                  )}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className={cn(
                    "flex-1 max-w-[80%]",
                    message.role === 'user' && "flex flex-col items-end"
                  )}>
                    <div className={cn(
                      "rounded-2xl px-4 py-2",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}>
                      {message.imageUrl && (
                        <img 
                          src={message.imageUrl} 
                          alt="صورة مرفقة" 
                          className="max-w-full h-auto rounded-lg mb-2 max-h-48 object-cover"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap" dir="rtl">
                        {message.content || (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            جاري التفكير...
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Action Card */}
                    {message.action && message.action.action !== 'none' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2 p-3 bg-card border border-border rounded-xl w-full"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">
                              {getActionName(message.action.action)} {getActionTableName(message.action.table)}
                            </span>
                          </div>
                          {message.actionStatus === 'success' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {message.actionStatus === 'error' && (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        
                        {!message.actionStatus && (
                          <Button
                            size="sm"
                            onClick={() => executeAction(message.action!, message.id)}
                            className="w-full"
                          >
                            تنفيذ الإجراء
                          </Button>
                        )}
                        
                        {message.actionStatus === 'pending' && (
                          <div className="flex items-center justify-center gap-2 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              جاري التنفيذ...
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Image Preview */}
      {uploadedImage && (
        <div className="px-4 py-2 border-t border-border bg-muted/50">
          <div className="relative inline-block">
            <img 
              src={uploadedImage.preview} 
              alt="معاينة الصورة" 
              className="h-20 w-auto rounded-lg object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={removeImage}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2">
          <Button
            onClick={sendMessage}
            disabled={(!input.trim() && !uploadedImage) || isLoading || isUploading}
            size="icon"
            className="h-[44px] w-[44px] flex-shrink-0"
          >
            {isLoading || isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 rotate-180" />
            )}
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="صف ما تريد تغييره... مثال: استخدم هذه الصورة للمنتج الأول"
            className="min-h-[44px] max-h-[120px] resize-none"
            dir="rtl"
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-[44px] w-[44px] flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !!uploadedImage}
          >
            <Image className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
