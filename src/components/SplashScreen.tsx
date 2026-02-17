import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import tboStoreLogo from '@/assets/tbo-store-logo.png';

const SPLASH_DURATION = 1800; // 1.8 seconds

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);
  const location = useLocation();
  const { language } = useLanguage();
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = React.useRef<string>(location.pathname);

  const showSplash = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(true);
    setKey(k => k + 1);
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, SPLASH_DURATION);
  }, []);

  const skip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      showSplash();
    }
  }, [location.pathname, showSplash]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            backgroundColor: 'hsl(var(--background) / 0.75)',
          }}
        >
          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            onClick={skip}
            className="absolute top-5 right-5 flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {language === 'ar' ? 'تخطي' : 'Skip'}
            <span className="text-xs opacity-70">›</span>
          </motion.button>

          {/* Center logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex flex-col items-center gap-5 select-none"
          >
            {/* Logo image */}
            <motion.div
              animate={{
                filter: [
                  'drop-shadow(0 0 12px hsl(var(--primary) / 0.5))',
                  'drop-shadow(0 0 28px hsl(var(--primary) / 0.8))',
                  'drop-shadow(0 0 12px hsl(var(--primary) / 0.5))',
                ],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={tboStoreLogo}
                alt="TBO STORE"
                className="w-28 h-28 object-contain"
              />
            </motion.div>

            {/* Store name text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center"
            >
              <h1
                className="text-3xl font-bold tracking-widest text-gradient-neon"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                TBO STORE
              </h1>
              <p
                className="text-sm text-muted-foreground mt-1 tracking-wide"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {language === 'ar' ? 'متجرك الرقمي المتميز' : 'Your Premium Digital Store'}
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div className="w-40 h-0.5 rounded-full bg-muted overflow-hidden mt-1">
              <motion.div
                className="h-full rounded-full bg-gradient-neon"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: SPLASH_DURATION / 1000, ease: 'linear' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
