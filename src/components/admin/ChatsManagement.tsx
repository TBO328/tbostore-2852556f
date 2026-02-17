import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, X, Clock, Loader2, Image, Mic, Square, Archive, Inbox, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ChatMessageBubble from '@/components/chat/ChatMessageBubble';

interface Conversation {
  id: string;
  user_id: string;
  order_id: string | null;
  order_number: string | null;
  customer_name: string;
  customer_email: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
}

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

interface ChatsManagementProps {
  language: 'en' | 'ar';
}

const ChatsManagement: React.FC<ChatsManagementProps> = ({ language }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
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
        .eq('sender_type', 'user')
        .eq('is_read', false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    const channel = supabase
      .channel('admin-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => fetchConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      const channel = supabase
        .channel(`admin-messages-${selectedConversation.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); };
  }, []);

  const uploadFile = async (file: Blob, fileType: 'image' | 'voice'): Promise<string | null> => {
    if (!user) return null;
    const ext = fileType === 'voice' ? 'webm' : (file as File).name?.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('chat-attachments').upload(fileName, file);
    if (error) { console.error('Upload error:', error); return null; }
    const { data: urlData } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const sendMessage = async (attachmentUrl?: string, attachmentType?: string) => {
    if (!newMessage.trim() && !attachmentUrl) return;
    if (!selectedConversation || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: 'admin',
        message: newMessage.trim() || (attachmentType === 'voice' ? '🎤 رسالة صوتية' : '📷 صورة'),
        attachment_url: attachmentUrl || null,
        attachment_type: attachmentType || null
      });
      if (error) throw error;

      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

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
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setUploading(true);
        try {
          const url = await uploadFile(blob, 'voice');
          if (url) await sendMessage(url, 'voice');
        } finally { setUploading(false); }
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (error) { console.error('Microphone access denied:', error); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const closeConversation = async (conversationId: string) => {
    try {
      await supabase.from('chat_conversations').update({ status: 'closed' }).eq('id', conversationId);
      fetchConversations();
      if (selectedConversation?.id === conversationId) setSelectedConversation(null);
    } catch (error) { console.error('Error closing conversation:', error); }
  };

  const restoreConversation = async (conversationId: string) => {
    try {
      await supabase.from('chat_conversations').update({ status: 'open' }).eq('id', conversationId);
      fetchConversations();
      if (selectedConversation?.id === conversationId) setSelectedConversation(null);
    } catch (error) { console.error('Error restoring conversation:', error); }
  };

  const activeConversations = conversations.filter(c => c.status === 'open');
  const archivedConversations = conversations.filter(c => c.status === 'closed');
  const displayedConversations = activeTab === 'active' ? activeConversations : archivedConversations;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Conversations List */}
      <div className="w-full md:w-80 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{language === 'en' ? 'Conversations' : 'المحادثات'}</h2>
          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-muted rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('active'); setSelectedConversation(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'active' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              {language === 'en' ? 'Active' : 'نشط'}
              {activeConversations.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {activeConversations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('archive'); setSelectedConversation(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'archive' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              {language === 'en' ? 'Archive' : 'الأرشيف'}
              {archivedConversations.length > 0 && (
                <span className="bg-muted-foreground/30 text-muted-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {archivedConversations.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {displayedConversations.map((conv) => (
            <motion.button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 text-left border-b border-border/50 hover:bg-muted/50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-primary/10' : ''}`}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/20 text-primary">{conv.customer_name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground truncate">{conv.customer_name}</span>
                    {activeTab === 'archive' && (
                      <Archive className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  {conv.order_number && <span className="text-xs text-muted-foreground">{language === 'en' ? 'Order' : 'طلب'}: {conv.order_number}</span>}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.last_message_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
          {displayedConversations.length === 0 && (
            <div className="p-8 text-center">
              {activeTab === 'archive' ? (
                <>
                  <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{language === 'en' ? 'No archived chats' : 'لا توجد دردشات مؤرشفة'}</p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{language === 'en' ? 'No active conversations' : 'لا توجد محادثات نشطة'}</p>
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/20 text-primary">{selectedConversation.customer_name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedConversation.customer_name}</h3>
                  {selectedConversation.order_number && <span className="text-sm text-muted-foreground">{language === 'en' ? 'Order' : 'طلب'}: {selectedConversation.order_number}</span>}
                </div>
              </div>
              {selectedConversation.status === 'open' ? (
                <Button variant="outline" size="sm" onClick={() => closeConversation(selectedConversation.id)}>
                  <Archive className="w-4 h-4 mr-1" />{language === 'en' ? 'Archive' : 'أرشفة'}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => restoreConversation(selectedConversation.id)} className="text-primary border-primary/30 hover:bg-primary/10">
                  <ArchiveRestore className="w-4 h-4 mr-1" />{language === 'en' ? 'Restore' : 'استعادة'}
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <ChatMessageBubble key={msg.id} message={msg} language={language} isAdmin={true} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {selectedConversation.status === 'open' && (
              <div className="p-4 border-t border-border">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {isRecording ? (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={cancelRecording} className="text-destructive"><X className="w-4 h-4" /></Button>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      <span className="text-sm text-destructive font-medium">{formatTime(recordingTime)}</span>
                    </div>
                    <Button size="icon" onClick={stopRecording} className="bg-destructive hover:bg-destructive/90"><Square className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading || sending}><Image className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={startRecording} disabled={uploading || sending}><Mic className="w-4 h-4" /></Button>
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder={language === 'en' ? 'Type a message...' : 'اكتب رسالة...'} className="flex-1" />
                    <Button onClick={() => sendMessage()} disabled={sending || uploading || !newMessage.trim()}>
                      {sending || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{language === 'en' ? 'Select a conversation to start chatting' : 'اختر محادثة للبدء'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsManagement;
