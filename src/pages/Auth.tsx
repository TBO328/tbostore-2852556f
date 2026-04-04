import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Phone, MessageSquare, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import PhoneInput from '@/components/PhoneInput';
import tboStoreLogo from '@/assets/tbo-store-logo.png';

type AuthMode = 'email' | 'phone';
type PhoneStep = 'phone' | 'otp' | 'name';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  
  // Email auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('phone');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [isNewPhoneUser, setIsNewPhoneUser] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
      setGoogleLoading(false);
    }
  };

  // Blocked disposable email domains
  const BLOCKED_EMAIL_DOMAINS = [
    'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
    'dispostable.com', 'trashmail.com', 'tempail.com', 'temp-mail.org',
    'fakeinbox.com', 'mailnesia.com', 'maildrop.cc', 'discard.email',
    'tmpmail.net', 'tmpmail.org', 'bupmail.com', 'emailondeck.com',
    'mintemail.com', 'mohmal.com', 'burpcollaborator.net', 'mailcatch.com',
    'tmail.ws', 'harakirimail.com', 'getairmail.com', 'meltmail.com',
    'spamdecoy.net', 'trashinbox.com', 'mailexpire.com', 'tempr.email',
    '10minutemail.com', 'guerrillamail.info', 'grr.la', 'guerrillamail.net',
    'guerrillamail.org', 'guerrillamail.de', 'spam4.me', 'trashmail.me',
    'trashmail.net', 'byom.de', 'spamgourmet.com', 'mytemp.email',
    'throwam.com', 'mailnull.com', 'jetable.org', 'tempinbox.com',
  ];

  const isBlockedEmail = (emailAddr: string): boolean => {
    const domain = emailAddr.split('@')[1]?.toLowerCase();
    return BLOCKED_EMAIL_DOMAINS.includes(domain);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Block temp emails on signup
    if (!isLogin && isBlockedEmail(email)) {
      toast({
        title: language === 'en' ? 'Email Not Allowed' : 'البريد غير مسموح',
        description: language === 'en'
          ? 'Temporary/disposable emails are not allowed. Please use a real email.'
          : 'البريد الإلكتروني المؤقت غير مسموح به. الرجاء استخدام بريد حقيقي.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message === 'Invalid login credentials') {
            toast({
              title: language === 'en' ? 'Login Failed' : 'فشل تسجيل الدخول',
              description: language === 'en' 
                ? 'Invalid email or password. Please try again.' 
                : 'البريد الإلكتروني أو كلمة المرور غير صحيحة. حاول مرة أخرى.',
              variant: 'destructive',
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: language === 'en' ? 'Welcome back!' : 'مرحباً بعودتك!',
            description: language === 'en' 
              ? 'You have successfully logged in.' 
              : 'لقد سجلت دخولك بنجاح.',
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: language === 'en' ? 'Account Exists' : 'الحساب موجود',
              description: language === 'en' 
                ? 'This email is already registered. Please login instead.' 
                : 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.',
              variant: 'destructive',
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: language === 'en' ? 'Account Created!' : 'تم إنشاء الحساب!',
            description: language === 'en' 
              ? 'Welcome to TBO Store!' 
              : 'مرحباً بك في متجر TBO!',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      toast({
        title: language === 'en' ? 'Invalid Phone' : 'رقم غير صالح',
        description: language === 'en' 
          ? 'Please enter a valid phone number' 
          : 'يرجى إدخال رقم جوال صحيح',
        variant: 'destructive',
      });
      return;
    }

    setPhoneLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-otp', {
        body: { phone: fullPhoneNumber },
      });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'OTP Sent!' : 'تم إرسال الرمز!',
        description: language === 'en' 
          ? 'Check your phone for the verification code' 
          : 'تحقق من جوالك للحصول على رمز التحقق',
      });

      // For development, show the OTP if returned
      if (data?.dev_otp) {
        console.log('Development OTP:', data.dev_otp);
        // Show prominent dev OTP notification
        setTimeout(() => {
          toast({
            title: language === 'en' ? '🔐 Development Mode' : '🔐 وضع التطوير',
            description: language === 'en' 
              ? `Your verification code is: ${data.dev_otp}` 
              : `رمز التحقق الخاص بك هو: ${data.dev_otp}`,
            duration: 30000, // 30 seconds
          });
        }, 500);
      }

      setPhoneStep('otp');
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message || (language === 'en' ? 'Failed to send OTP' : 'فشل إرسال الرمز'),
        variant: 'destructive',
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: language === 'en' ? 'Invalid Code' : 'رمز غير صالح',
        description: language === 'en' 
          ? 'Please enter the 6-digit code' 
          : 'يرجى إدخال الرمز المكون من 6 أرقام',
        variant: 'destructive',
      });
      return;
    }

    setPhoneLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-sms-otp', {
        body: { 
          phone: fullPhoneNumber, 
          otp: otpCode,
          fullName: fullName || undefined,
        },
      });

      if (error) throw error;

      if (data?.isNewUser && !fullName) {
        setIsNewPhoneUser(true);
        setPhoneStep('name');
        return;
      }

      // Use the magic link to sign in
      if (data?.magicLink) {
        window.location.href = data.magicLink;
      } else {
        toast({
          title: language === 'en' ? 'Success!' : 'نجاح!',
          description: language === 'en' 
            ? 'You are now logged in' 
            : 'تم تسجيل دخولك بنجاح',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message || (language === 'en' ? 'Invalid OTP code' : 'رمز غير صحيح'),
        variant: 'destructive',
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleCompletePhoneSignup = async () => {
    if (!fullName.trim()) {
      toast({
        title: language === 'en' ? 'Name Required' : 'الاسم مطلوب',
        description: language === 'en' 
          ? 'Please enter your name' 
          : 'يرجى إدخال اسمك',
        variant: 'destructive',
      });
      return;
    }

    setPhoneLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-sms-otp', {
        body: { 
          phone: fullPhoneNumber, 
          otp: otpCode,
          fullName: fullName.trim(),
        },
      });

      if (error) throw error;

      if (data?.magicLink) {
        window.location.href = data.magicLink;
      } else {
        toast({
          title: language === 'en' ? 'Account Created!' : 'تم إنشاء الحساب!',
          description: language === 'en' 
            ? 'Welcome to TBO Store!' 
            : 'مرحباً بك في متجر TBO!',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const resetPhoneAuth = () => {
    setPhoneStep('phone');
    setOtpCode('');
    setFullName('');
    setIsNewPhoneUser(false);
  };

  // Floating particles component
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            x: [null, (Math.random() - 0.5) * 100],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.15, 0.25, 0.15],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/30 via-purple-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.3, 1, 1.3], 
            opacity: [0.15, 0.25, 0.15],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 3 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-secondary/30 via-cyan-500/20 to-transparent rounded-full blur-3xl"
        />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Floating particles */}
        <FloatingParticles />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main card with glass morphism */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-xl opacity-70" />
          
          <div className="relative bg-card/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Logo with glow */}
            <Link to="/" className="flex justify-center mb-6 relative">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(var(--primary), 0.3)',
                    '0 0 40px rgba(var(--primary), 0.5)',
                    '0 0 20px rgba(var(--primary), 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-2xl p-3 bg-gradient-to-br from-primary/10 to-transparent"
              >
                <img
                  src={tboStoreLogo}
                  alt="TBO Store"
                  className="h-14 w-auto drop-shadow-lg"
                />
              </motion.div>
            </Link>

            {/* Title with gradient */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-6"
            >
              <h1 className="font-cairo text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-2">
                {isLogin 
                  ? (language === 'en' ? 'Welcome Back' : 'مرحباً بعودتك')
                  : (language === 'en' ? 'Create Account' : 'إنشاء حساب')
                }
              </h1>
              <p className="font-cairo text-muted-foreground text-sm flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {isLogin
                  ? (language === 'en' ? 'Sign in to continue shopping' : 'سجل دخولك لمتابعة التسوق')
                  : (language === 'en' ? 'Join the TBO family today' : 'انضم لعائلة TBO اليوم')
                }
              </p>
            </motion.div>

            {/* Auth Mode Toggle - Enhanced */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative flex gap-1 mb-6 p-1.5 bg-muted/50 rounded-2xl border border-white/5"
            >
              <motion.div
                className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10"
                initial={false}
                animate={{
                  left: authMode === 'email' ? '6px' : '50%',
                  right: authMode === 'email' ? '50%' : '6px',
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                type="button"
                onClick={() => { setAuthMode('email'); resetPhoneAuth(); }}
                className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all z-10 ${
                  authMode === 'email' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="w-4 h-4" />
                {language === 'en' ? 'Email' : 'البريد'}
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('phone'); resetPhoneAuth(); }}
                className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all z-10 ${
                  authMode === 'phone' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Phone className="w-4 h-4" />
                {language === 'en' ? 'Phone' : 'الجوال'}
              </button>
            </motion.div>

            <AnimatePresence mode="wait">
              {authMode === 'email' ? (
                <motion.div
                  key="email-form"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Email Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-5">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="fullName" className="font-cairo text-sm text-muted-foreground">
                          {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              id="fullName"
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                              className="pl-12 h-12 bg-muted/50 border-white/10 rounded-xl focus:border-primary/50 transition-all"
                              required={!isLogin}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-cairo text-sm text-muted-foreground">
                        {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                      </Label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={language === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
                            className="pl-12 h-12 bg-muted/50 border-white/10 rounded-xl focus:border-primary/50 transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="font-cairo text-sm text-muted-foreground">
                        {language === 'en' ? 'Password' : 'كلمة المرور'}
                      </Label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={language === 'en' ? 'Enter your password' : 'أدخل كلمة المرور'}
                            className="pl-12 h-12 bg-muted/50 border-white/10 rounded-xl focus:border-primary/50 transition-all"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      {isLogin && (
                        <div className="text-right">
                          <Link 
                            to="/request-password-reset" 
                            className="font-cairo text-xs text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                          >
                            <Shield className="w-3 h-3" />
                            {language === 'en' ? 'Forgot Password?' : 'نسيت كلمة المرور؟'}
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Submit Button - Enhanced */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 group relative overflow-hidden"
                        disabled={loading}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-2 font-cairo">
                            <Zap className="w-5 h-5" />
                            {isLogin 
                              ? (language === 'en' ? 'Sign In' : 'تسجيل الدخول')
                              : (language === 'en' ? 'Create Account' : 'إنشاء حساب')
                            }
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="phone-form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence mode="wait">
                    {phoneStep === 'phone' && (
                      <motion.div
                        key="phone-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label className="font-cairo text-sm text-muted-foreground">
                            {language === 'en' ? 'Phone Number' : 'رقم الجوال'}
                          </Label>
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                            <div className="relative">
                              <PhoneInput
                                value={phoneNumber}
                                onChange={(value, fullNumber) => {
                                  setPhoneNumber(value);
                                  setFullPhoneNumber(fullNumber);
                                }}
                                placeholder={language === 'en' ? '5XXXXXXXX' : '5XXXXXXXX'}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {language === 'en' 
                              ? 'We will send a verification code to this number' 
                              : 'سنرسل رمز التحقق إلى هذا الرقم'}
                          </p>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="button"
                            size="lg"
                            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 group relative overflow-hidden"
                            onClick={handleSendOTP}
                            disabled={phoneLoading}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {phoneLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <span className="flex items-center gap-2 font-cairo">
                                <MessageSquare className="w-5 h-5" />
                                {language === 'en' ? 'Send Verification Code' : 'إرسال رمز التحقق'}
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {phoneStep === 'otp' && (
                      <motion.div
                        key="otp-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-5"
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' 
                              ? `Enter the code sent to` 
                              : `أدخل الرمز المرسل إلى`}
                          </p>
                          <p className="text-primary font-semibold mt-1 direction-ltr">{fullPhoneNumber}</p>
                        </div>

                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={otpCode}
                            onChange={(value) => setOtpCode(value)}
                            className="gap-2"
                          >
                            <InputOTPGroup className="gap-2">
                              {[0, 1, 2, 3, 4, 5].map((index) => (
                                <InputOTPSlot 
                                  key={index}
                                  index={index} 
                                  className="w-12 h-14 text-xl font-bold rounded-xl border-white/10 bg-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="button"
                            size="lg"
                            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 group relative overflow-hidden"
                            onClick={handleVerifyOTP}
                            disabled={phoneLoading || otpCode.length !== 6}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {phoneLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <span className="flex items-center gap-2 font-cairo">
                                {language === 'en' ? 'Verify Code' : 'تحقق من الرمز'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </span>
                            )}
                          </Button>
                        </motion.div>

                        <div className="flex justify-between text-sm">
                          <button
                            type="button"
                            onClick={resetPhoneAuth}
                            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            {language === 'en' ? 'Change number' : 'تغيير الرقم'}
                          </button>
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={phoneLoading}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {language === 'en' ? 'Resend code' : 'إعادة إرسال الرمز'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {phoneStep === 'name' && (
                      <motion.div
                        key="name-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-5"
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' 
                              ? 'Almost there! Enter your name to complete signup' 
                              : 'تقريباً وصلت! أدخل اسمك لإكمال التسجيل'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneName" className="font-cairo text-sm text-muted-foreground">
                            {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                          </Label>
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="phoneName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                                className="pl-12 h-12 bg-muted/50 border-white/10 rounded-xl focus:border-primary/50 transition-all"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="button"
                            size="lg"
                            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 group relative overflow-hidden"
                            onClick={handleCompletePhoneSignup}
                            disabled={phoneLoading}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {phoneLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <span className="flex items-center gap-2 font-cairo">
                                <Sparkles className="w-5 h-5" />
                                {language === 'en' ? 'Complete Signup' : 'إكمال التسجيل'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider - Enhanced */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="font-cairo bg-card/90 px-4 text-xs text-muted-foreground uppercase tracking-wider">
                  {language === 'en' ? 'Or continue with' : 'أو تابع عبر'}
                </span>
              </div>
            </div>

            {/* Google Sign In - Enhanced */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12 gap-3 bg-muted/50 border-white/10 hover:bg-muted hover:border-white/20 rounded-xl transition-all group"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium">Google</span>
                  </>
                )}
              </Button>
            </motion.div>

            {/* Toggle - Only for email mode */}
            {authMode === 'email' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-center"
              >
                <p className="font-cairo text-sm text-muted-foreground">
                  {isLogin 
                    ? (language === 'en' ? "Don't have an account?" : 'ليس لديك حساب؟')
                    : (language === 'en' ? 'Already have an account?' : 'لديك حساب بالفعل؟')
                  }
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-cairo mx-2 text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    {isLogin 
                      ? (language === 'en' ? 'Sign Up' : 'سجل الآن')
                      : (language === 'en' ? 'Sign In' : 'تسجيل الدخول')
                    }
                  </button>
                </p>
              </motion.div>
            )}

            {/* Back to Home - Enhanced */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-4 text-center"
            >
              <Link 
                to="/" 
                className="font-cairo text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                {language === 'en' ? 'Back to Store' : 'العودة إلى المتجر'}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
