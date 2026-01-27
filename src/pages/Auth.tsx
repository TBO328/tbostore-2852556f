import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Phone, MessageSquare } from 'lucide-react';
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        toast({
          title: 'Development Mode',
          description: `OTP: ${data.dev_otp}`,
        });
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-8 shadow-card">
          {/* Logo */}
          <Link to="/" className="flex justify-center mb-8">
            <img
              src={tboStoreLogo}
              alt="TBO Store"
              className="h-16 w-auto"
            />
          </Link>

          {/* Title */}
          <h1 className="font-cairo text-2xl font-bold text-center text-foreground mb-2">
            {isLogin 
              ? (language === 'en' ? 'Welcome Back' : 'مرحباً بعودتك')
              : (language === 'en' ? 'Create Account' : 'إنشاء حساب')
            }
          </h1>
          <p className="font-cairo text-muted-foreground text-center mb-6">
            {isLogin
              ? (language === 'en' ? 'Sign in to your account' : 'سجل دخولك إلى حسابك')
              : (language === 'en' ? 'Join TBO Store today' : 'انضم إلى متجر TBO اليوم')
            }
          </p>

          {/* Auth Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => { setAuthMode('email'); resetPhoneAuth(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMode === 'email' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" />
              {language === 'en' ? 'Email' : 'البريد'}
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('phone'); resetPhoneAuth(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMode === 'phone' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Phone className="w-4 h-4" />
              {language === 'en' ? 'Phone' : 'الجوال'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {authMode === 'email' ? (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="font-cairo">
                        {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                          className="pl-10 bg-input border-border"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-cairo">
                      {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
                        className="pl-10 bg-input border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-cairo">
                      {language === 'en' ? 'Password' : 'كلمة المرور'}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={language === 'en' ? 'Enter your password' : 'أدخل كلمة المرور'}
                        className="pl-10 bg-input border-border"
                        required
                        minLength={6}
                      />
                    </div>
                    {isLogin && (
                      <div className="text-right">
                        <Link 
                          to="/forgot-password" 
                          className="font-cairo text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          {language === 'en' ? 'Forgot Password?' : 'نسيت كلمة المرور؟'}
                        </Link>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="neon-filled"
                    size="lg"
                    className="w-full group font-cairo"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin 
                          ? (language === 'en' ? 'Sign In' : 'تسجيل الدخول')
                          : (language === 'en' ? 'Create Account' : 'إنشاء حساب')
                        }
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="phone-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {phoneStep === 'phone' && (
                    <motion.div
                      key="phone-step"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label className="font-cairo">
                          {language === 'en' ? 'Phone Number' : 'رقم الجوال'}
                        </Label>
                        <PhoneInput
                          value={phoneNumber}
                          onChange={(value, fullNumber) => {
                            setPhoneNumber(value);
                            setFullPhoneNumber(fullNumber);
                          }}
                          placeholder={language === 'en' ? '5XXXXXXXX' : '5XXXXXXXX'}
                        />
                        <p className="text-xs text-muted-foreground">
                          {language === 'en' 
                            ? 'We will send a verification code to this number' 
                            : 'سنرسل رمز التحقق إلى هذا الرقم'}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="neon-filled"
                        size="lg"
                        className="w-full group font-cairo"
                        onClick={handleSendOTP}
                        disabled={phoneLoading}
                      >
                        {phoneLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <MessageSquare className="w-5 h-5 mr-2" />
                            {language === 'en' ? 'Send Verification Code' : 'إرسال رمز التحقق'}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {phoneStep === 'otp' && (
                    <motion.div
                      key="otp-step"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">
                          {language === 'en' 
                            ? `Enter the code sent to ${fullPhoneNumber}` 
                            : `أدخل الرمز المرسل إلى ${fullPhoneNumber}`}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otpCode}
                          onChange={(value) => setOtpCode(value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      <Button
                        type="button"
                        variant="neon-filled"
                        size="lg"
                        className="w-full group font-cairo"
                        onClick={handleVerifyOTP}
                        disabled={phoneLoading || otpCode.length !== 6}
                      >
                        {phoneLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {language === 'en' ? 'Verify Code' : 'تحقق من الرمز'}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>

                      <div className="flex justify-between text-sm">
                        <button
                          type="button"
                          onClick={resetPhoneAuth}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {language === 'en' ? '← Change number' : '← تغيير الرقم'}
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">
                          {language === 'en' 
                            ? 'Please enter your name to complete signup' 
                            : 'يرجى إدخال اسمك لإكمال التسجيل'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneName" className="font-cairo">
                          {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="phoneName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                            className="pl-10 bg-input border-border"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="neon-filled"
                        size="lg"
                        className="w-full group font-cairo"
                        onClick={handleCompletePhoneSignup}
                        disabled={phoneLoading}
                      >
                        {phoneLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {language === 'en' ? 'Complete Signup' : 'إكمال التسجيل'}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="font-cairo bg-card px-4 text-muted-foreground">
                {language === 'en' ? 'Or continue with' : 'أو تابع عبر'}
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-3"
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
                Google
              </>
            )}
          </Button>

          {/* Toggle - Only for email mode */}
          {authMode === 'email' && (
            <div className="mt-6 text-center">
              <p className="font-cairo text-muted-foreground">
                {isLogin 
                  ? (language === 'en' ? "Don't have an account?" : 'ليس لديك حساب؟')
                  : (language === 'en' ? 'Already have an account?' : 'لديك حساب بالفعل؟')
                }
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-cairo ml-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {isLogin 
                    ? (language === 'en' ? 'Sign Up' : 'سجل الآن')
                    : (language === 'en' ? 'Sign In' : 'تسجيل الدخول')
                  }
                </button>
              </p>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link 
              to="/" 
              className="font-cairo text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === 'en' ? '← Back to Store' : '← العودة إلى المتجر'}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
