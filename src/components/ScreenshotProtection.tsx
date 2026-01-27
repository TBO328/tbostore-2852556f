import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ScreenshotProtection: React.FC = () => {
  const [isBlurred, setIsBlurred] = useState(false);
  const { language } = useLanguage();
  const lastTriggerTime = useRef<number>(0);

  const showWarning = useCallback(() => {
    // Debounce to prevent multiple triggers
    const now = Date.now();
    if (now - lastTriggerTime.current < 1000) return;
    lastTriggerTime.current = now;
    
    setIsBlurred(true);
    // Hide after 3 seconds
    setTimeout(() => {
      setIsBlurred(false);
    }, 3000);
  }, []);

  useEffect(() => {
    // Detect PrintScreen key (all variations)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen detection (works on key up for some systems)
      if (
        e.key === 'PrintScreen' || 
        e.code === 'PrintScreen' ||
        e.keyCode === 44
      ) {
        e.preventDefault();
        showWarning();
        return;
      }
      
      // Windows Snipping Tool: Win + Shift + S
      if (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        showWarning();
        return;
      }
      
      // Mac screenshots: Cmd + Shift + 3, 4, 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        showWarning();
        return;
      }
      
      // Print dialog (often used to save as PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        showWarning();
        return;
      }
      
      // Save page
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        showWarning();
        return;
      }
    };

    // Key up handler for PrintScreen (some systems only trigger on keyup)
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        showWarning();
      }
    };

    // Detect right-click to prevent context menu screenshots
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showWarning();
      return false;
    };

    // Detect visibility change (screenshot tools may cause this)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        showWarning();
      }
    };

    // Detect window blur (could be screenshot tool opening)
    const handleWindowBlur = () => {
      showWarning();
    };

    // Detect devtools opening
    const handleDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key))
      ) {
        e.preventDefault();
        showWarning();
      }
    };

    // Detect clipboard access
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        showWarning();
      }
    };

    // Add all listeners
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('keydown', handleDevTools, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy, true);

    // Detect screen capture API if available
    if ('getDisplayMedia' in navigator.mediaDevices) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = function(...args) {
        showWarning();
        return originalGetDisplayMedia.apply(this, args);
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('keydown', handleDevTools, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy, true);
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
