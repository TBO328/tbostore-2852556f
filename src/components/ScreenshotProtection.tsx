import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ScreenshotProtection: React.FC = () => {
  const [isBlurred, setIsBlurred] = useState(false);
  const { language } = useLanguage();

  const showWarning = useCallback(() => {
    setIsBlurred(true);
    // Hide after 3 seconds
    setTimeout(() => {
      setIsBlurred(false);
    }, 3000);
  }, []);

  useEffect(() => {
    // Detect PrintScreen key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        showWarning();
      }
      // Detect common screenshot shortcuts
      // Windows: Win + Shift + S, Win + PrintScreen
      // Mac: Cmd + Shift + 3, Cmd + Shift + 4
      if (
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) ||
        (e.metaKey && e.shiftKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'p')
      ) {
        e.preventDefault();
        showWarning();
      }
    };

    // Detect right-click to prevent context menu screenshots
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Detect visibility change (some screenshot tools minimize/restore)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // When tab becomes hidden, could be screenshot
        showWarning();
      }
    };

    // Detect devtools opening (F12, Ctrl+Shift+I)
    const handleDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault();
        showWarning();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleDevTools);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Disable text selection copy for extra protection
    const handleCopy = (e: ClipboardEvent) => {
      // Allow copy in input/textarea elements
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    document.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleDevTools);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
    };
  }, [showWarning]);

  return (
    <AnimatePresence>
      {isBlurred && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            backdropFilter: 'blur(30px)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center p-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 mb-6"
            >
              <ShieldAlert className="w-10 h-10 text-destructive" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {language === 'ar' ? 'لا يمكن أخذ لقطة شاشة' : 'Screenshots are not allowed'}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {language === 'ar' 
                ? 'هذا المحتوى محمي ولا يمكن التقاط صور للشاشة'
                : 'This content is protected and cannot be captured'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScreenshotProtection;
