import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: ActionData;
  actionStatus?: 'pending' | 'success' | 'error';
}

interface ActionData {
  action: 'update' | 'insert' | 'delete' | 'none';
  table?: string;
  data?: Record<string, unknown>;
  condition?: Record<string, unknown>;
  message?: string;
}

const ADMIN_AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai`;

const AIAssistant: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
          title: language === 'en' ? 'Success' : 'تم بنجاح',
          description: result.message || (language === 'en' ? 'Action executed successfully' : 'تم تنفيذ الإجراء بنجاح'),
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, actionStatus: 'error' as const } : m
      ));
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error instanceof Error ? error.message : 'Failed to execute action',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
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
          messages: [...messages, userMessage].map(m => ({
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
          content: language === 'en' 
            ? 'Sorry, an error occurred. Please try again.'
            : 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        } : m
      ));
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error instanceof Error ? error.message : 'Connection error',
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
    const names: Record<string, { en: string; ar: string }> = {
      products: { en: 'Products', ar: 'المنتجات' },
      page_content: { en: 'Page Content', ar: 'محتوى الصفحة' },
      reviews: { en: 'Reviews', ar: 'التقييمات' },
      partners: { en: 'Partners', ar: 'الشركاء' },
      payment_settings: { en: 'Payment Settings', ar: 'إعدادات الدفع' },
      coupons: { en: 'Coupons', ar: 'الكوبونات' },
    };
    return names[table || '']?.[language] || table;
  };

  const getActionName = (action?: string) => {
    const names: Record<string, { en: string; ar: string }> = {
      update: { en: 'Update', ar: 'تحديث' },
      insert: { en: 'Add', ar: 'إضافة' },
      delete: { en: 'Delete', ar: 'حذف' },
    };
    return names[action || '']?.[language] || action;
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-background rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {language === 'en' ? 'AI Assistant' : 'المساعد الذكي'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'en' 
                ? 'Describe what you want to change and I will do it' 
                : 'صف ما تريد تغييره وسأقوم بتنفيذه'}
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
                <h3 className="font-medium text-foreground mb-2">
                  {language === 'en' ? 'How can I help you?' : 'كيف يمكنني مساعدتك؟'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Try saying: "Change the hero title to Welcome to TBO Store" or "Add a new product called Premium Design"'
                    : 'جرب قول: "غير عنوان الصفحة الرئيسية إلى مرحباً بكم في متجر TBO" أو "أضف منتج جديد اسمه تصميم مميز"'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  language === 'en' ? 'Change hero title' : 'غير عنوان الصفحة',
                  language === 'en' ? 'Add new product' : 'أضف منتج جديد',
                  language === 'en' ? 'Update about page' : 'حدث صفحة من نحن',
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
                      <p className="text-sm whitespace-pre-wrap" dir={isRTL ? 'rtl' : 'ltr'}>
                        {message.content || (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {language === 'en' ? 'Thinking...' : 'جاري التفكير...'}
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
                            {language === 'en' ? 'Execute' : 'تنفيذ'}
                          </Button>
                        )}
                        
                        {message.actionStatus === 'pending' && (
                          <div className="flex items-center justify-center gap-2 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              {language === 'en' ? 'Executing...' : 'جاري التنفيذ...'}
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

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'en' 
              ? 'Describe what you want to change...' 
              : 'صف ما تريد تغييره...'}
            className="min-h-[44px] max-h-[120px] resize-none"
            dir={isRTL ? 'rtl' : 'ltr'}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[44px] w-[44px] flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className={cn("w-5 h-5", isRTL && "rotate-180")} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
