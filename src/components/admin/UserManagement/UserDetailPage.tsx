import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, User, Mail, Calendar, Shield, ShieldOff, 
  Ban, Coins, Plus, Minus, Ticket, Trash2, Loader2, Save,
  Copy, Check, Upload, KeyRound, Eye, EyeOff, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface UserDetails {
  user_id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  loyalty_points: number;
  total_earned: number;
  total_redeemed: number;
}

interface PersonalCoupon {
  id: string;
  code: string;
  discount_percent: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserDetailPageProps {
  userId: string;
  language: string;
  onBack: () => void;
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  currentUserId?: string;
}

export const UserDetailPage = ({ userId, language, onBack, toast, currentUserId }: UserDetailPageProps) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [coupons, setCoupons] = useState<PersonalCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Editable fields
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Points adjustment
  const [pointsDialog, setPointsDialog] = useState(false);
  const [pointsChange, setPointsChange] = useState(0);
  const [pointsAction, setPointsAction] = useState<'add' | 'remove'>('add');
  
  // Blacklist
  const [blacklistDialog, setBlacklistDialog] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  
  // Coupon
  const [couponDialog, setCouponDialog] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  // Password reset OTP system
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'generate' | 'verify' | 'reset'>('generate');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      const [userResult, couponsResult] = await Promise.all([
        supabase.rpc('get_user_details_for_admin', { p_user_id: userId }),
        supabase.rpc('get_user_personal_coupons', { p_user_id: userId })
      ]);
      
      if (userResult.error) throw userResult.error;
      if (userResult.data && userResult.data.length > 0) {
        const userData = userResult.data[0];
        setUser(userData);
        setFullName(userData.full_name || '');
        setAvatarUrl(userData.avatar_url || '');
      }
      
      if (!couponsResult.error) {
        setCoupons(couponsResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to load user details' : 'فشل في تحميل بيانات المستخدم',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'en' ? 'Invalid file' : 'ملف غير صالح',
        description: language === 'en' ? 'Please select an image file' : 'يرجى اختيار ملف صورة',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: language === 'en' ? 'File too large' : 'الملف كبير جداً',
        description: language === 'en' ? 'Max size is 2MB' : 'الحد الأقصى 2 ميجابايت',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the avatar URL
      const { error: updateError } = await supabase.rpc('admin_update_user_profile', {
        p_target_user_id: userId,
        p_full_name: null,
        p_avatar_url: publicUrl
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'Avatar updated' : 'تم تحديث الصورة',
      });
      fetchUserDetails();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to upload avatar' : 'فشل في رفع الصورة',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('admin_update_user_profile', {
        p_target_user_id: userId,
        p_full_name: fullName || null,
        p_avatar_url: null // Don't update avatar here, it's handled separately
      });
      
      if (error) throw error;
      
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'Profile updated' : 'تم تحديث الملف الشخصي',
      });
      fetchUserDetails();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to update profile' : 'فشل في تحديث الملف الشخصي',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdmin = async () => {
    if (userId === currentUserId) {
      toast({
        title: language === 'en' ? 'Cannot change own role' : 'لا يمكن تغيير صلاحيتك',
        description: language === 'en' ? 'You cannot change your own admin status' : 'لا يمكنك تغيير صلاحياتك',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase.rpc('set_admin_role', {
        _target_user_id: userId,
        _make_admin: !user?.is_admin
      });
      
      if (error) throw error;
      
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: user?.is_admin 
          ? (language === 'en' ? 'Admin removed' : 'تم إزالة صلاحية الأدمن')
          : (language === 'en' ? 'Admin added' : 'تم إضافة صلاحية الأدمن'),
      });
      fetchUserDetails();
    } catch (error) {
      console.error('Error toggling admin:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        variant: 'destructive',
      });
    }
  };

  const handlePointsChange = async () => {
    const change = pointsAction === 'add' ? pointsChange : -pointsChange;
    
    try {
      const { error } = await supabase.rpc('admin_update_loyalty_points', {
        p_target_user_id: userId,
        p_points_change: change
      });
      
      if (error) throw error;
      
      setPointsDialog(false);
      setPointsChange(0);
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'Points updated' : 'تم تحديث النقاط',
      });
      fetchUserDetails();
    } catch (error) {
      console.error('Error updating points:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        variant: 'destructive',
      });
    }
  };

  const handleBlacklist = async () => {
    try {
      const { error } = await supabase.rpc('set_user_blacklist', {
        p_target_user_id: userId,
        p_is_blacklisted: !user?.is_blacklisted,
        p_reason: !user?.is_blacklisted ? blacklistReason : null
      });
      
      if (error) throw error;
      
      setBlacklistDialog(false);
      setBlacklistReason('');
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: user?.is_blacklisted 
          ? (language === 'en' ? 'User unblocked' : 'تم إلغاء الحظر')
          : (language === 'en' ? 'User blocked' : 'تم حظر المستخدم'),
      });
      fetchUserDetails();
    } catch (error) {
      console.error('Error updating blacklist:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        variant: 'destructive',
      });
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim()) return;
    
    try {
      const { error } = await supabase.rpc('create_personal_coupon', {
        p_target_user_id: userId,
        p_code: newCouponCode.toUpperCase(),
        p_discount_percent: newCouponDiscount
      });
      
      if (error) throw error;
      
      setCouponDialog(false);
      setNewCouponCode('');
      setNewCouponDiscount(10);
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'Coupon created' : 'تم إنشاء الكوبون',
      });
      fetchUserDetails();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Coupon code may already exist' : 'كود الكوبون قد يكون موجود',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      const { error } = await supabase.rpc('admin_delete_user', {
        p_target_user_id: userId
      });
      
      if (error) throw error;
      
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'User deleted' : 'تم حذف المستخدم',
      });
      onBack();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to delete user' : 'فشل في حذف المستخدم',
        variant: 'destructive',
      });
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateOtp = async () => {
    if (!user?.email) return;
    
    setOtpLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_password_reset_otp', {
        p_user_email: user.email
      });
      
      if (error) throw error;
      
      setGeneratedOtp(data);
      setPasswordStep('verify');
      toast({
        title: language === 'en' ? 'OTP Generated' : 'تم إنشاء الكود',
        description: language === 'en' 
          ? 'Give this code to the user to verify their identity'
          : 'أعط هذا الكود للمستخدم للتحقق من هويته',
      });
    } catch (error) {
      console.error('Error generating OTP:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' 
          ? 'Failed to generate OTP'
          : 'فشل في إنشاء الكود',
        variant: 'destructive',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!user?.email || enteredOtp.length !== 6) return;
    
    setOtpLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_password_reset_otp', {
        p_user_email: user.email,
        p_otp: enteredOtp
      });
      
      if (error) throw error;
      
      if (data) {
        setPasswordStep('reset');
        toast({
          title: language === 'en' ? 'OTP Verified' : 'تم التحقق من الكود',
          description: language === 'en' 
            ? 'You can now set a new password'
            : 'يمكنك الآن تعيين كلمة مرور جديدة',
        });
      } else {
        toast({
          title: language === 'en' ? 'Invalid OTP' : 'كود غير صحيح',
          description: language === 'en' 
            ? 'The code is incorrect or expired'
            : 'الكود غير صحيح أو منتهي الصلاحية',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        variant: 'destructive',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: language === 'en' ? 'Invalid Password' : 'كلمة مرور غير صالحة',
        description: language === 'en' 
          ? 'Password must be at least 6 characters'
          : 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        variant: 'destructive',
      });
      return;
    }
    
    setResetLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          userId: userId,
          newPassword: newPassword,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }
      
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Password has been reset successfully'
          : 'تم إعادة تعيين كلمة المرور بنجاح',
      });
      
      // Reset all states and close dialog
      setPasswordDialog(false);
      setPasswordStep('generate');
      setGeneratedOtp('');
      setEnteredOtp('');
      setNewPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message || (language === 'en' 
          ? 'Failed to reset password'
          : 'فشل في إعادة تعيين كلمة المرور'),
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const openPasswordDialog = () => {
    setPasswordDialog(true);
    setPasswordStep('generate');
    setGeneratedOtp('');
    setEnteredOtp('');
    setNewPassword('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          {language === 'en' ? 'User not found' : 'المستخدم غير موجود'}
        </p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          {language === 'en' ? 'Go Back' : 'العودة'}
        </Button>
      </div>
    );
  }

  const isRTL = language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">
            {language === 'en' ? 'User Details' : 'تفاصيل المستخدم'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
              {userId}
            </code>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyUserId}>
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-24 h-24 border-4 border-border">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary text-2xl font-bold">
                {user.full_name?.[0] || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-1 flex-wrap justify-center">
              {user.is_admin && (
                <Badge className="bg-amber-500/20 text-amber-400">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              {user.is_blacklisted && (
                <Badge variant="destructive">
                  <Ban className="w-3 h-3 mr-1" />
                  {language === 'en' ? 'Banned' : 'محظور'}
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">
                  {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{user.email}</span>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  {language === 'en' ? 'Registered' : 'تاريخ التسجيل'}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>

            {/* Loyalty Points Summary */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-foreground">
                  {language === 'en' ? 'Loyalty Points' : 'نقاط الولاء'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-amber-500">{user.loyalty_points}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Current' : 'الحالي'}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-500">+{user.total_earned}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Earned' : 'مكتسب'}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-500">-{user.total_redeemed}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Redeemed' : 'مستبدل'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">
          {language === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{language === 'en' ? 'Full Name' : 'الاسم الكامل'}</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={language === 'en' ? 'Enter name...' : 'أدخل الاسم...'}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{language === 'en' ? 'Avatar' : 'الصورة الشخصية'}</Label>
            <div className="mt-1 flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-border">
                <AvatarImage src={avatarUrl || user.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                  {fullName?.[0] || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {uploadingAvatar 
                      ? (language === 'en' ? 'Uploading...' : 'جاري الرفع...')
                      : (language === 'en' ? 'Upload' : 'رفع صورة')}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving} className="mt-4">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {language === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
        </Button>
      </div>

      {/* Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Admin Toggle */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user.is_admin ? <Shield className="w-5 h-5 text-amber-500" /> : <ShieldOff className="w-5 h-5 text-muted-foreground" />}
              <span className="font-medium text-sm">
                {language === 'en' ? 'Admin' : 'أدمن'}
              </span>
            </div>
            <Switch
              checked={user.is_admin}
              onCheckedChange={handleToggleAdmin}
              disabled={userId === currentUserId}
            />
          </div>
        </div>

        {/* Points */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-sm">
                {language === 'en' ? 'Points' : 'النقاط'}
              </span>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { setPointsAction('add'); setPointsDialog(true); }}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { setPointsAction('remove'); setPointsDialog(true); }}>
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Blacklist */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ban className={`w-5 h-5 ${user.is_blacklisted ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className="font-medium text-sm">
                {language === 'en' ? 'Blacklist' : 'القائمة السوداء'}
              </span>
            </div>
            <Switch
              checked={user.is_blacklisted}
              onCheckedChange={() => setBlacklistDialog(true)}
              disabled={userId === currentUserId}
            />
          </div>
          {user.is_blacklisted && user.blacklist_reason && (
            <p className="text-xs text-red-400 mt-2">{user.blacklist_reason}</p>
          )}
        </div>

        {/* Personal Coupon */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">
                {language === 'en' ? 'Coupon' : 'كوبون خاص'}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setCouponDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              {language === 'en' ? 'Add' : 'إضافة'}
            </Button>
          </div>
        </div>

        {/* Password Reset */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">
                {language === 'en' ? 'Password' : 'كلمة المرور'}
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={openPasswordDialog}
            >
              <KeyRound className="w-4 h-4 mr-1" />
              {language === 'en' ? 'Reset' : 'إعادة'}
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Coupons List */}
      {coupons.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            {language === 'en' ? 'Personal Coupons' : 'الكوبونات الخاصة'}
          </h3>
          <div className="space-y-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <code className="font-mono font-bold text-primary">{coupon.code}</code>
                  <Badge variant="secondary">{coupon.discount_percent}%</Badge>
                  {!coupon.is_active && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {language === 'en' ? 'Inactive' : 'غير فعال'}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(coupon.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="font-semibold text-red-400 mb-4">
          {language === 'en' ? 'Danger Zone' : 'منطقة الخطر'}
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="destructive" onClick={() => setDeleteDialog(true)} disabled={userId === currentUserId}>
            <Trash2 className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Delete Account' : 'حذف الحساب'}
          </Button>
        </div>
        {userId === currentUserId && (
          <p className="text-xs text-muted-foreground mt-2">
            {language === 'en' ? 'You cannot delete your own account' : 'لا يمكنك حذف حسابك'}
          </p>
        )}
      </div>

      {/* Points Dialog */}
      <Dialog open={pointsDialog} onOpenChange={setPointsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pointsAction === 'add' 
                ? (language === 'en' ? 'Add Points' : 'إضافة نقاط')
                : (language === 'en' ? 'Remove Points' : 'إزالة نقاط')}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? `Current balance: ${user.loyalty_points} points`
                : `الرصيد الحالي: ${user.loyalty_points} نقطة`}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>{language === 'en' ? 'Points' : 'النقاط'}</Label>
            <Input
              type="number"
              min={1}
              value={pointsChange}
              onChange={(e) => setPointsChange(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPointsDialog(false)}>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button onClick={handlePointsChange} disabled={pointsChange <= 0}>
              {language === 'en' ? 'Confirm' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blacklist Dialog */}
      <AlertDialog open={blacklistDialog} onOpenChange={setBlacklistDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.is_blacklisted 
                ? (language === 'en' ? 'Remove from Blacklist?' : 'إزالة من القائمة السوداء؟')
                : (language === 'en' ? 'Add to Blacklist?' : 'إضافة للقائمة السوداء؟')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.is_blacklisted 
                ? (language === 'en' ? 'User will be able to access the store again.' : 'سيتمكن المستخدم من الوصول للمتجر مرة أخرى.')
                : (language === 'en' ? 'User will be blocked from accessing the store.' : 'سيتم حظر المستخدم من الوصول للمتجر.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!user.is_blacklisted && (
            <div>
              <Label>{language === 'en' ? 'Reason (optional)' : 'السبب (اختياري)'}</Label>
              <Textarea
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
                placeholder={language === 'en' ? 'Enter reason...' : 'أدخل السبب...'}
                className="mt-1"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'إلغاء'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlacklist} className={user.is_blacklisted ? '' : 'bg-destructive hover:bg-destructive/90'}>
              {language === 'en' ? 'Confirm' : 'تأكيد'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Coupon Dialog */}
      <Dialog open={couponDialog} onOpenChange={setCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Create Personal Coupon' : 'إنشاء كوبون خاص'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'This coupon will only work for this user.'
                : 'هذا الكوبون سيعمل فقط لهذا المستخدم.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'en' ? 'Coupon Code' : 'كود الكوبون'}</Label>
              <Input
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                placeholder={language === 'en' ? 'e.g. VIP2024' : 'مثال: VIP2024'}
                className="mt-1 font-mono uppercase"
              />
            </div>
            <div>
              <Label>{language === 'en' ? 'Discount Percent' : 'نسبة الخصم'}</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(parseInt(e.target.value) || 10)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCouponDialog(false)}>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button onClick={handleCreateCoupon} disabled={!newCouponCode.trim()}>
              {language === 'en' ? 'Create' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Delete User Account?' : 'حذف حساب المستخدم؟'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? 'This action cannot be undone. All user data will be permanently deleted.'
                : 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم نهائياً.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'إلغاء'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
              {language === 'en' ? 'Delete' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset OTP Dialog */}
      <Dialog open={passwordDialog} onOpenChange={(open) => {
        if (!open) {
          setPasswordDialog(false);
          setPasswordStep('generate');
          setGeneratedOtp('');
          setEnteredOtp('');
          setNewPassword('');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور'}
            </DialogTitle>
            <DialogDescription>
              {passwordStep === 'generate' && (
                language === 'en' 
                  ? 'Generate a one-time code to verify user identity'
                  : 'إنشاء كود مؤقت للتحقق من هوية المستخدم'
              )}
              {passwordStep === 'verify' && (
                language === 'en' 
                  ? 'Enter the code provided by the user'
                  : 'أدخل الكود الذي أعطاه لك المستخدم'
              )}
              {passwordStep === 'reset' && (
                language === 'en' 
                  ? 'Set a new password for the user'
                  : 'تعيين كلمة مرور جديدة للمستخدم'
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Generate OTP */}
          {passwordStep === 'generate' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Click to generate a 6-digit code. Share this code with the user for verification.'
                    : 'اضغط لإنشاء كود من 6 أرقام. شارك هذا الكود مع المستخدم للتحقق.'}
                </p>
              </div>
              <Button 
                onClick={handleGenerateOtp} 
                disabled={otpLoading} 
                className="w-full"
              >
                {otpLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Generate Code' : 'إنشاء الكود'}
              </Button>
            </div>
          )}

          {/* Step 2: Show OTP and Verify */}
          {passwordStep === 'verify' && (
            <div className="space-y-6">
              {/* Display Generated OTP */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Generated Code (Share with user)' : 'الكود المُنشأ (شاركه مع المستخدم)'}
                </Label>
                <div className="text-3xl font-mono font-bold tracking-widest text-primary mt-2">
                  {generatedOtp}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {language === 'en' ? 'Valid for 10 minutes' : 'صالح لمدة 10 دقائق'}
                </p>
              </div>

              <Separator />

              {/* Enter OTP from user */}
              <div className="space-y-3">
                <Label className="text-center block">
                  {language === 'en' ? 'Enter code from user' : 'أدخل الكود من المستخدم'}
                </Label>
                <div className="flex justify-center" dir="ltr">
                  <InputOTP 
                    maxLength={6} 
                    value={enteredOtp} 
                    onChange={setEnteredOtp}
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
              </div>

              <Button 
                onClick={handleVerifyOtp} 
                disabled={otpLoading || enteredOtp.length !== 6} 
                className="w-full"
              >
                {otpLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Verify Code' : 'تحقق من الكود'}
              </Button>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {passwordStep === 'reset' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {language === 'en' ? 'Code verified successfully!' : 'تم التحقق من الكود بنجاح!'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{language === 'en' ? 'New Password' : 'كلمة المرور الجديدة'}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'en' ? 'Enter new password...' : 'أدخل كلمة المرور الجديدة...'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Minimum 6 characters' : '6 أحرف كحد أدنى'}
                </p>
              </div>

              <Button 
                onClick={handleResetPassword} 
                disabled={resetLoading || newPassword.length < 6} 
                className="w-full"
              >
                {resetLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <KeyRound className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور'}
              </Button>
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button 
              variant="outline" 
              onClick={() => setPasswordDialog(false)}
            >
              {language === 'en' ? 'Close' : 'إغلاق'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
