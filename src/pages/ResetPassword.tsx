import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, CheckCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import tboStoreLogo from '@/assets/tbo-store-logo.png';

const FloatingParticles = () => {
  return (
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
            y: [null, -20, 20],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user came from password reset email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL hash for recovery token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        setIsValidSession(true);
      } else if (session) {
        setIsValidSession(true);
      } else {
        toast({
          title: language === 'en' ? 'Invalid Link' : 'رابط غير صالح',
          description: language === 'en' 
            ? 'This password reset link is invalid or has expired' 
            : 'رابط إعادة التعيين هذا غير صالح أو منتهي الصلاحية',
          variant: 'destructive',
        });
      }
      setCheckingSession(false);
    };

    checkSession();

    // Listen for auth state changes (for recovery flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [language, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' 
          ? 'Passwords do not match' 
          : 'كلمات المرور غير متطابقة',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' 
          ? 'Password must be at least 6 characters' 
          : 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: language === 'en' ? 'Success!' : 'تم بنجاح!',
        description: language === 'en' 
          ? 'Your password has been reset successfully' 
          : 'تم إعادة تعيين كلمة المرور بنجاح',
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
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

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--secondary)/0.1),transparent_50%)]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <FloatingParticles />

      {/* Animated Orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.2, 0.3, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2], 
          opacity: [0.2, 0.3, 0.2],
          x: [0, -30, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 2, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-xl opacity-70" />
          
          <div className="relative bg-card/40 backdrop-blur-2xl rounded-2xl border border-white/10 p-8 shadow-2xl overflow-hidden">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Logo */}
            <Link to="/" className="flex justify-center mb-8 relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <img
                  src={tboStoreLogo}
                  alt="TBO Store"
                  className="h-16 w-auto drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
                />
              </motion.div>
            </Link>

            {!isValidSession ? (
              /* Invalid Session State */
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative"
              >
                <div className="w-24 h-24 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-12 h-12 text-destructive" />
                </div>
                
                <h1 className="font-cairo text-2xl font-bold text-foreground mb-2">
                  {language === 'en' ? 'Invalid Link' : 'رابط غير صالح'}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'This password reset link is invalid or has expired.' 
                    : 'رابط إعادة التعيين هذا غير صالح أو منتهي الصلاحية.'
                  }
                </p>
                
                <Link to="/request-password-reset">
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    {language === 'en' ? 'Request New Link' : 'طلب رابط جديد'}
                  </Button>
                </Link>
              </motion.div>
            ) : success ? (
              /* Success State */
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                >
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <CheckCircle className="w-12 h-12 text-primary relative z-10" />
                </motion.div>
                
                <h1 className="font-cairo text-2xl font-bold text-foreground mb-2">
                  {language === 'en' ? 'Password Reset!' : 'تم إعادة تعيين كلمة المرور!'}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'Your password has been successfully reset. Redirecting...' 
                    : 'تم إعادة تعيين كلمة المرور بنجاح. جاري التوجيه...'
                  }
                </p>
                
                <Link to="/">
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    {language === 'en' ? 'Go to Store' : 'الذهاب للمتجر'}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Title */}
                <div className="text-center mb-8 relative">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary font-cairo">
                      {language === 'en' ? 'New Password' : 'كلمة مرور جديدة'}
                    </span>
                  </motion.div>
                  
                  <h1 className="font-cairo text-2xl font-bold text-foreground mb-2">
                    {language === 'en' ? 'Reset Your Password' : 'إعادة تعيين كلمة المرور'}
                  </h1>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'Enter your new password below' 
                      : 'أدخل كلمة المرور الجديدة أدناه'
                    }
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 relative">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground font-cairo">
                      {language === 'en' ? 'New Password' : 'كلمة المرور الجديدة'}
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={language === 'en' ? 'Enter new password' : 'أدخل كلمة المرور الجديدة'}
                        className="pl-10 pr-10 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-cairo h-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-md transition-opacity duration-300" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-cairo">
                      {language === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={language === 'en' ? 'Confirm new password' : 'أكد كلمة المرور الجديدة'}
                        className="pl-10 pr-10 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-cairo h-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-md transition-opacity duration-300" />
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold font-cairo relative overflow-hidden group"
                      disabled={loading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {language === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور'}
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </>
            )}

            {/* Back to Store */}
            <div className="mt-6 text-center relative">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-cairo"
              >
                {language === 'en' ? '← Back to Store' : '← العودة إلى المتجر'}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
