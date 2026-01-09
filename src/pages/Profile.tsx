import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Camera, Loader2, LogOut, Key, Save, Snowflake, MousePointer, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Profile: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const { winterMode, setWinterMode, customCursor, setCustomCursor, theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customizeRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  // Scroll to customize section if hash is present
  useEffect(() => {
    if (location.hash === '#customize' && customizeRef.current) {
      setTimeout(() => {
        customizeRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.hash, loading]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url);
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
          updated_at: new Date().toISOString(),
        }, {
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'en' ? 'Invalid File' : 'ملف غير صالح',
        description: language === 'en' ? 'Please select an image file.' : 'الرجاء اختيار ملف صورة.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
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

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add timestamp to bust cache
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithTimestamp);

      // Update profile
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
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              {language === 'en' ? 'My Profile' : 'ملفي الشخصي'}
            </h1>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-muted border-4 border-primary/20 overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
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
              <p className="text-sm text-muted-foreground mt-3">
                {language === 'en' ? 'Click the camera to change your photo' : 'اضغط على الكاميرا لتغيير صورتك'}
              </p>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full"
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
            <div className="my-8 border-t border-border" />

            {/* Experience Customization */}
            <div className="space-y-4" ref={customizeRef} id="customize">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {language === 'en' ? 'Customize Experience' : 'تخصيص التجربة'}
              </h2>

              {/* Winter Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Snowflake className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {language === 'en' ? 'Winter Mode' : 'المود الشتوي'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Show falling snowflakes effect' : 'عرض تأثير الثلج المتساقط'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={winterMode}
                  onCheckedChange={setWinterMode}
                />
              </div>

              {/* Custom Cursor Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MousePointer className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {language === 'en' ? 'Custom Cursor' : 'المؤشر المخصص'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Use custom styled cursor' : 'استخدام المؤشر المخصص'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={customCursor}
                  onCheckedChange={setCustomCursor}
                />
              </div>

              {/* Theme Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {language === 'en' ? 'Dark Mode' : 'الوضع الداكن'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Switch between light and dark theme' : 'التبديل بين الوضع الفاتح والداكن'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-border" />

            {/* Account Actions */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {language === 'en' ? 'Account Settings' : 'إعدادات الحساب'}
              </h2>

              {/* Reset Password */}
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={resettingPassword}
                className="w-full justify-start"
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
                className="w-full justify-start"
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
