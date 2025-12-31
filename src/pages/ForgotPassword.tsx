import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import tboStoreLogo from '@/assets/tbo-store-logo.png';

const ForgotPassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' 
          ? 'New passwords do not match' 
          : 'كلمات المرور الجديدة غير متطابقة',
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
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: language === 'en' ? 'Error' : 'خطأ',
          description: language === 'en' 
            ? 'Current password is incorrect' 
            : 'كلمة المرور الحالية غير صحيحة',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      toast({
        title: language === 'en' ? 'Success!' : 'تم بنجاح!',
        description: language === 'en' 
          ? 'Your password has been updated.' 
          : 'تم تحديث كلمة المرور.',
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

          {success ? (
            /* Success State */
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                {language === 'en' ? 'Password Updated!' : 'تم تحديث كلمة المرور!'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {language === 'en' 
                  ? 'Your password has been successfully changed.' 
                  : 'تم تغيير كلمة المرور بنجاح.'
                }
              </p>
              <Link to="/profile">
                <Button variant="neon-filled" size="lg" className="w-full">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'Back to Profile' : 'العودة للملف الشخصي'}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Title */}
              <h1 className="font-display text-2xl font-bold text-center text-foreground mb-2">
                {language === 'en' ? 'Change Password' : 'تغيير كلمة المرور'}
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                {language === 'en' 
                  ? 'Enter your current password and choose a new one' 
                  : 'أدخل كلمة المرور الحالية واختر كلمة مرور جديدة'
                }
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    {language === 'en' ? 'Current Password' : 'كلمة المرور الحالية'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Enter current password' : 'أدخل كلمة المرور الحالية'}
                      className="pl-10 bg-input border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    {language === 'en' ? 'New Password' : 'كلمة المرور الجديدة'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Enter new password' : 'أدخل كلمة المرور الجديدة'}
                      className="pl-10 bg-input border-border"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {language === 'en' ? 'Confirm New Password' : 'تأكيد كلمة المرور الجديدة'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Confirm new password' : 'أكد كلمة المرور الجديدة'}
                      className="pl-10 bg-input border-border"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="neon-filled"
                  size="lg"
                  className="w-full group"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {language === 'en' ? 'Update Password' : 'تحديث كلمة المرور'}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Back to Profile */}
              <div className="mt-6 text-center">
                <Link 
                  to="/profile" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'en' ? 'Back to Profile' : 'العودة للملف الشخصي'}
                </Link>
              </div>
            </>
          )}

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === 'en' ? '← Back to Store' : '← العودة إلى المتجر'}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
