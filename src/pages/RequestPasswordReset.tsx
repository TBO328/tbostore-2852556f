import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
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

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' 
          ? 'Please enter your email address' 
          : 'الرجاء إدخال بريدك الإلكتروني',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast({
        title: language === 'en' ? 'Email Sent!' : 'تم إرسال البريد!',
        description: language === 'en' 
          ? 'Check your inbox for the password reset link' 
          : 'تحقق من بريدك الوارد لرابط إعادة التعيين',
      });
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

            {emailSent ? (
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
                  {language === 'en' ? 'Check Your Email!' : 'تحقق من بريدك!'}
                </h1>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {language === 'en' 
                    ? `We've sent a password reset link to ${email}` 
                    : `لقد أرسلنا رابط إعادة التعيين إلى ${email}`
                  }
                </p>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full border-primary/30 hover:bg-primary/10"
                  >
                    {language === 'en' ? 'Send Again' : 'إرسال مرة أخرى'}
                  </Button>
                  
                  <Link to="/auth" className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      {language === 'en' ? 'Back to Login' : 'العودة لتسجيل الدخول'}
                    </Button>
                  </Link>
                </div>
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
                      {language === 'en' ? 'Password Recovery' : 'استعادة كلمة المرور'}
                    </span>
                  </motion.div>
                  
                  <h1 className="font-cairo text-2xl font-bold text-foreground mb-2">
                    {language === 'en' ? 'Forgot Password?' : 'نسيت كلمة المرور؟'}
                  </h1>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? "Enter your email and we'll send you a reset link" 
                      : 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
                    }
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 relative">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-cairo">
                      {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'en' ? 'your@email.com' : 'بريدك@الإلكتروني.com'}
                        className="pl-10 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-cairo h-12"
                        required
                      />
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
                          {language === 'en' ? 'Send Reset Link' : 'إرسال رابط إعادة التعيين'}
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link 
                    to="/auth" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-2 font-cairo"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'en' ? 'Back to Login' : 'العودة لتسجيل الدخول'}
                  </Link>
                </div>
              </>
            )}

            {/* Back to Store */}
            <div className="mt-4 text-center relative">
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

export default RequestPasswordReset;
