import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Minimize2, Loader2, CheckCheck, Image, Mic, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import ChatMessageBubble from '@/components/chat/ChatMessageBubble';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  attachment_url: string | null;
  attachment_type: string | null;
}

interface Conversation {
  id: string;
  user_id: string;
  order_id: string | null;
  order_number: string | null;
  customer_name: string;
  status: string;
}

const CustomerChat: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrCreateConversation = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing && !fetchError) {
        setConversation(existing);
        fetchMessages(existing.id);
      }
    } catch {
      console.log('No existing conversation');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'admin')
        .eq('is_read', false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createConversation = async (): Promise<Conversation | null> => {
    if (!user) return null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          customer_name: profile?.full_name || user.email?.split('@')[0] || 'Customer',
          customer_email: user.email,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;
      setConversation(data);
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const uploadFile = async (file: Blob, fileType: 'image' | 'voice'): Promise<string | null> => {
    if (!user) return null;
    const ext = fileType === 'voice' ? 'webm' : (file as File).name?.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const sendMessage = async (attachmentUrl?: string, attachmentType?: string) => {
    if (!user) return;
    if (!newMessage.trim() && !attachmentUrl) return;

    setSending(true);
    try {
      let conv = conversation;
      if (!conv) {
        conv = await createConversation();
        if (!conv) throw new Error('Failed to create conversation');
      }

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: conv.id,
        sender_id: user.id,
        sender_type: 'user',
        message: newMessage.trim() || (attachmentType === 'voice' ? '🎤 رسالة صوتية' : '📷 صورة'),
        attachment_url: attachmentUrl || null,
        attachment_type: attachmentType || null
      });

      if (error) throw error;

      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conv.id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file, 'image');
      if (url) await sendMessage(url, 'image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setUploading(true);
        try {
          const url = await uploadFile(audioBlob, 'voice');
          if (url) await sendMessage(url, 'voice');
        } finally {
          setUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (isOpen && user) fetchOrCreateConversation();
  }, [isOpen, user]);

  useEffect(() => {
    if (conversation) {
      const channel = supabase
        .channel(`customer-messages-${conversation.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation.id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  if (!user) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 left-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 left-4 z-50 w-[340px] h-[480px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">
                    {language === 'en' ? 'Support Chat' : 'الدعم الفني'}
                  </h3>
                  <p className="text-xs text-primary-foreground/70">
                    {language === 'en' ? 'We typically reply quickly' : 'نرد عادةً بسرعة'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20">
                <Minimize2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Send us a message and we\'ll get back to you!' : 'أرسل لنا رسالة وسنرد عليك!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <ChatMessageBubble key={msg.id} message={msg} language={language} isAdmin={false} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              {isRecording ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={cancelRecording} className="text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-sm text-destructive font-medium">{formatTime(recordingTime)}</span>
                  </div>
                  <Button size="icon" onClick={stopRecording} className="bg-destructive hover:bg-destructive/90">
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1.5 items-center">
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading || sending} className="shrink-0">
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={startRecording} disabled={uploading || sending} className="shrink-0">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={language === 'en' ? 'Message...' : 'رسالة...'}
                    className="flex-1 h-9 text-sm"
                    disabled={uploading}
                  />
                  <Button onClick={() => sendMessage()} disabled={sending || uploading || !newMessage.trim()} size="icon" className="shrink-0 h-9 w-9">
                    {sending || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomerChat;
