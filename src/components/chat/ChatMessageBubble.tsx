import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, Play, Pause } from 'lucide-react';

interface Message {
  id: string;
  sender_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  attachment_url: string | null;
  attachment_type: string | null;
}

interface ChatMessageBubbleProps {
  message: Message;
  language: string;
  isAdmin: boolean;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, language, isAdmin }) => {
  const [playing, setPlaying] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const isSelf = isAdmin ? message.sender_type === 'admin' : message.sender_type === 'user';

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
            isSelf
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          }`}
        >
          {/* Image attachment */}
          {message.attachment_type === 'image' && message.attachment_url && (
            <img
              src={message.attachment_url}
              alt="attachment"
              className="rounded-lg max-w-full max-h-48 object-cover mb-1 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setImgOpen(true)}
            />
          )}

          {/* Voice attachment */}
          {message.attachment_type === 'voice' && message.attachment_url && (
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={toggleAudio}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isSelf ? 'bg-primary-foreground/20' : 'bg-primary/20'
                }`}
              >
                {playing ? (
                  <Pause className={`w-4 h-4 ${isSelf ? 'text-primary-foreground' : 'text-primary'}`} />
                ) : (
                  <Play className={`w-4 h-4 ${isSelf ? 'text-primary-foreground' : 'text-primary'}`} />
                )}
              </button>
              <div className="flex-1">
                <div className={`h-1 rounded-full ${isSelf ? 'bg-primary-foreground/30' : 'bg-primary/30'}`}>
                  <div className={`h-full rounded-full w-0 ${isSelf ? 'bg-primary-foreground' : 'bg-primary'}`} />
                </div>
              </div>
              <audio
                ref={audioRef}
                src={message.attachment_url}
                onEnded={() => setPlaying(false)}
                className="hidden"
              />
            </div>
          )}

          {/* Text - hide default emoji text if there's an attachment */}
          {message.message && !(message.attachment_url && ['🎤 رسالة صوتية', '📷 صورة'].includes(message.message)) && (
            <p className="text-sm">{message.message}</p>
          )}

          <div className={`flex items-center gap-1 mt-1 text-xs ${
            isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {new Date(message.created_at).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
            {isSelf && message.is_read && <CheckCheck className="w-3 h-3" />}
          </div>
        </div>
      </motion.div>

      {/* Full-screen image viewer */}
      {imgOpen && message.attachment_url && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImgOpen(false)}
        >
          <img
            src={message.attachment_url}
            alt="full"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

export default ChatMessageBubble;
