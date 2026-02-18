import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Camera, Loader2, LogOut, Key, Save, Crown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import UserRankBadge from '@/components/UserRankBadge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Profile: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone_number')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url);
        setPhoneNumber((data as any).phone_number || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          phone_number: phoneNumber || null,
          updated_at: new Date().toISOString(),
        } as any, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Profile Updated' : 'تم تحديث الملف الشخصي',
        description: language === 'en' ? 'Your profile has been updated successfully.' : 'تم تحديث ملفك الشخصي بنجاح.',
      });
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'en' ? 'Invalid File' : 'ملف غير صالح',
        description: language === 'en' ? 'Please select an image file.' : 'الرجاء اختيار ملف صورة.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: language === 'en' ? 'File Too Large' : 'الملف كبير جداً',
        description: language === 'en' ? 'Please select an image smaller than 2MB.' : 'الرجاء اختيار صورة أصغر من 2 ميجابايت.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithTimestamp);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: urlWithTimestamp,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      toast({
        title: language === 'en' ? 'Avatar Updated' : 'تم تحديث الصورة',
        description: language === 'en' ? 'Your profile picture has been updated.' : 'تم تحديث صورة ملفك الشخصي.',
      });
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Upload Failed' : 'فشل الرفع',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Password Reset Email Sent' : 'تم إرسال بريد إعادة تعيين كلمة المرور',
        description: language === 'en' 
          ? 'Check your email for the password reset link.' 
          : 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.',
      });
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: language === 'en' ? 'Signed Out' : 'تم تسجيل الخروج',
      description: language === 'en' ? 'You have been signed out successfully.' : 'تم تسجيل خروجك بنجاح.',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-5 md:p-8 shadow-xl"
          >
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
              {language === 'en' ? 'Account Settings' : 'إعدادات الحساب'}
            </h1>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-muted border-4 border-primary/20 overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-9 h-9 md:w-10 md:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-3 text-center">
                {language === 'en' ? 'Click the camera to change your photo' : 'اضغط على الكاميرا لتغيير صورتك'}
              </p>
            </div>

            {/* User Rank Section */}
            <div className="flex items-center justify-center gap-3 mb-6 p-4 rounded-xl bg-muted/50 border border-border">
              <Crown className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'Your Rank:' : 'رتبتك:'}
              </span>
              <UserRankBadge showLabel size="sm" />
            </div>

            {/* Profile Form */}
            <div className="space-y-4 md:space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted text-sm"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm">
                  {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                  className="text-sm"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Phone Number (WhatsApp)' : 'رقم الجوال (واتساب)'}
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+]/g, ''))}
                  placeholder={language === 'en' ? 'e.g. +966501234567' : 'مثال: 966501234567+'}
                  className="text-sm"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'en' 
                    ? 'Add your number so we can reach you on WhatsApp' 
                    : 'أضف رقمك حتى نتمكن من التواصل معك على واتساب'}
                </p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full"
                size="default"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
              </Button>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-border" />

            {/* Account Actions */}
            <div className="space-y-3">
              {/* Reset Password */}
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={resettingPassword}
                className="w-full justify-start text-sm"
                size="default"
              >
                {resettingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور'}
              </Button>

              {/* Sign Out */}
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="w-full justify-start text-sm"
                size="default"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;