import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FingerprintLockProps {
  onUnlock: () => void;
}

const FingerprintLock: React.FC<FingerprintLockProps> = ({ onUnlock }) => {
  const { language } = useLanguage();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 2000; // 2 seconds (faster unlock)

  const handleStart = () => {
    setIsHolding(true);
    setIsScanning(true);
    setProgress(0);

    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / HOLD_DURATION * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval.current!);
        setIsUnlocked(true);
        setTimeout(() => {
          onUnlock();
        }, 800);
      }
    }, 50);

    holdTimeout.current = setTimeout(() => {

      // Cleanup handled by progress interval
    }, HOLD_DURATION);};

  const handleEnd = () => {
    if (!isUnlocked) {
      setIsHolding(false);
      setIsScanning(false);
      setProgress(0);
      if (holdTimeout.current) clearTimeout(holdTimeout.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimeout.current) clearTimeout(holdTimeout.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            {[...Array(20)].map((_, i) =>
            <motion.div
              key={i}
              className="absolute w-64 h-64 border border-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }} />

            )}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-4">
          {/* Lock Icon at Top */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8">
            
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BadgeCheck className="w-8 h-8 text-primary" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center font-cairo">
            
            {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-12 text-center font-cairo">
            
            {language === 'ar' ?
            'اضغط مع الاستمرار على البصمة للدخول' :
            'Hold the fingerprint to access'}
          </motion.p>

          {/* Fingerprint Scanner */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="relative">
            
            {/* Progress Ring */}
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted/20" />
              
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 - 283 * progress / 100}
                className="drop-shadow-lg" />
              
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </svg>

            {/* Fingerprint Button */}
            <motion.button
              onMouseDown={handleStart}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchEnd={handleEnd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute inset-0 m-auto w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
              isUnlocked ?
              'bg-green-500/20 border-green-500' :
              isScanning ?
              'bg-primary/20 border-primary' :
              'bg-card border-border hover:border-primary/50'} border-2`
              }
              disabled={isUnlocked}>
              
              <AnimatePresence mode="wait">
                {isUnlocked ?
                <motion.div
                  key="unlocked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500">
                  
                    <ShieldCheck className="w-16 h-16" />
                  </motion.div> :

                <motion.div
                  key="fingerprint"
                  animate={isScanning ? {
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className={isScanning ? 'text-primary' : 'text-muted-foreground'}>
                  
                    <Fingerprint className="w-16 h-16" />
                  </motion.div>
                }
              </AnimatePresence>
            </motion.button>

            {/* Scanning Lines */}
            {isScanning && !isUnlocked &&
            <motion.div
              className="absolute inset-0 m-auto w-32 h-32 rounded-full overflow-hidden pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}>
              
                <motion.div
                className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ y: [-64, 64] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
              
              </motion.div>
            }
          </motion.div>

          {/* Status Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-muted-foreground font-cairo">
            
            {isUnlocked ?
            language === 'ar' ? '✓ تم التحقق بنجاح' : '✓ Verified successfully' :
            isScanning ?
            language === 'ar' ? `جاري المسح... ${Math.round(progress)}%` : `Scanning... ${Math.round(progress)}%` :
            language === 'ar' ? '2 ثانية للتحقق' : '2 seconds to verify'
            }
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>);

};

export default FingerprintLock;