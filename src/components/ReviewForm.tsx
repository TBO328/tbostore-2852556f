import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const ReviewForm: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [userProfile, setUserProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [form, setForm] = useState({
    name: '',
    review: '',
    productName: ''
  });

  // Fetch user profile if logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserProfile(data);
        if (data.full_name) {
          setForm(prev => ({ ...prev, name: data.full_name || '' }));
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.review.trim()) {
      toast({
        title: language === 'en' ? 'Please fill all required fields' : 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        customer_name: form.name,
        customer_avatar: userProfile?.avatar_url || null, // Use user's avatar if logged in
        rating,
        review_text_ar: form.review,
        review_text_en: form.review,
        product_name_ar: form.productName || null,
        product_name_en: form.productName || null,
        is_approved: false
      });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Review submitted!' : 'تم إرسال التقييم!',
        description: language === 'en' 
          ? 'Your review will appear after approval.' 
          : 'سيظهر تقييمك بعد الموافقة عليه.'
      });

      setForm({ name: userProfile?.full_name || '', review: '', productName: '' });
      setRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to submit review' : 'فشل في إرسال التقييم',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-2xl p-6 md:p-8 border border-border"
    >
      <h3 className="font-display text-2xl font-bold text-foreground mb-6">
        {language === 'en' ? 'Share Your Experience' : 'شاركنا تجربتك'}
      </h3>

      {/* User Avatar Preview */}
      {user && userProfile && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-muted/50 rounded-xl">
          {userProfile.avatar_url ? (
            <img 
              src={userProfile.avatar_url} 
              alt="" 
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/50" 
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/50">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{userProfile.full_name || user.email}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Your photo will appear with your review' : 'ستظهر صورتك مع تقييمك'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            {language === 'en' ? 'Your Rating' : 'تقييمك'}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-primary fill-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name - prefilled if logged in */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === 'en' ? 'Your Name' : 'اسمك'} *
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
            required
          />
        </div>

        {/* Product Name (Optional) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === 'en' ? 'Product Name (Optional)' : 'اسم المنتج (اختياري)'}
          </label>
          <Input
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            placeholder={language === 'en' ? 'Which product did you buy?' : 'ما المنتج الذي اشتريته؟'}
          />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === 'en' ? 'Your Review' : 'تقييمك'} *
          </label>
          <Textarea
            value={form.review}
            onChange={(e) => setForm({ ...form, review: e.target.value })}
            placeholder={language === 'en' ? 'Tell us about your experience...' : 'أخبرنا عن تجربتك...'}
            rows={4}
            required
          />
        </div>

        <Button type="submit" variant="neon-filled" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {language === 'en' ? 'Submitting...' : 'جاري الإرسال...'}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Submit Review' : 'إرسال التقييم'}
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
