import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordStrengthMeterProps {
  password: string;
}

interface PasswordCheck {
  label: string;
  labelAr: string;
  passed: boolean;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { language } = useLanguage();

  const checks = useMemo((): PasswordCheck[] => {
    return [
      {
        label: 'At least 6 characters',
        labelAr: '6 أحرف على الأقل',
        passed: password.length >= 6,
      },
      {
        label: 'Contains uppercase letter',
        labelAr: 'يحتوي على حرف كبير',
        passed: /[A-Z]/.test(password),
      },
      {
        label: 'Contains lowercase letter',
        labelAr: 'يحتوي على حرف صغير',
        passed: /[a-z]/.test(password),
      },
      {
        label: 'Contains a number',
        labelAr: 'يحتوي على رقم',
        passed: /[0-9]/.test(password),
      },
      {
        label: 'Contains special character',
        labelAr: 'يحتوي على رمز خاص',
        passed: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const passedCount = checks.filter(c => c.passed).length;
    if (passedCount === 0) return { level: 0, label: 'Very Weak', labelAr: 'ضعيفة جداً', color: 'bg-destructive' };
    if (passedCount === 1) return { level: 1, label: 'Weak', labelAr: 'ضعيفة', color: 'bg-destructive' };
    if (passedCount === 2) return { level: 2, label: 'Fair', labelAr: 'مقبولة', color: 'bg-orange-500' };
    if (passedCount === 3) return { level: 3, label: 'Good', labelAr: 'جيدة', color: 'bg-yellow-500' };
    if (passedCount === 4) return { level: 4, label: 'Strong', labelAr: 'قوية', color: 'bg-primary' };
    return { level: 5, label: 'Very Strong', labelAr: 'قوية جداً', color: 'bg-green-500' };
  }, [checks]);

  const StrengthIcon = useMemo(() => {
    if (strength.level <= 1) return ShieldAlert;
    if (strength.level <= 3) return Shield;
    return ShieldCheck;
  }, [strength.level]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-3"
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StrengthIcon className={`w-4 h-4 ${
              strength.level <= 1 ? 'text-destructive' : 
              strength.level <= 3 ? 'text-yellow-500' : 'text-green-500'
            }`} />
            <span className="text-sm font-medium font-cairo text-muted-foreground">
              {language === 'en' ? 'Password Strength:' : 'قوة كلمة المرور:'}
            </span>
          </div>
          <span className={`text-sm font-bold font-cairo ${
            strength.level <= 1 ? 'text-destructive' : 
            strength.level <= 3 ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {language === 'en' ? strength.label : strength.labelAr}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <motion.div
              key={level}
              className="h-2 flex-1 rounded-full bg-muted overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: strength.level >= level ? '100%' : '0%',
                }}
                transition={{ duration: 0.3, delay: level * 0.05 }}
                className={`h-full rounded-full ${strength.color}`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 gap-1.5">
        {checks.map((check, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2"
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              check.passed 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {check.passed ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
            </div>
            <span className={`text-xs font-cairo ${
              check.passed ? 'text-green-500' : 'text-muted-foreground'
            }`}>
              {language === 'en' ? check.label : check.labelAr}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PasswordStrengthMeter;
