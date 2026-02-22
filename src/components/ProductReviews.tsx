import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

interface ProductReviewsProps {
  productId: string;
  onRatingUpdate?: (avgRating: number, count: number) => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, onRatingUpdate }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    // Fetch profiles for reviewers
    const userIds = (data || []).map(r => r.user_id);
    let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      if (profiles) {
        profiles.forEach(p => {
          profilesMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }
    }

    const reviewsWithProfiles = (data || []).map(r => ({
      ...r,
      profile: profilesMap[r.user_id] || null,
    }));

    setReviews(reviewsWithProfiles);

    // Check if current user already reviewed
    if (user) {
      const existing = reviewsWithProfiles.find(r => r.user_id === user.id);
      if (existing) {
        setUserReview(existing);
        setRating(existing.rating);
        setReviewText(existing.review_text || '');
      }
    }

    // Calculate average
    if (reviewsWithProfiles.length > 0) {
      const avg = reviewsWithProfiles.reduce((sum, r) => sum + r.rating, 0) / reviewsWithProfiles.length;
      onRatingUpdate?.(Math.round(avg * 10) / 10, reviewsWithProfiles.length);
    } else {
      onRatingUpdate?.(0, 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel(`product-reviews-${productId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_reviews', filter: `product_id=eq.${productId}` }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [productId, user?.id]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return;
    }
    if (rating === 0) {
      toast.error(language === 'ar' ? 'اختر عدد النجوم' : 'Please select a rating');
      return;
    }

    setSubmitting(true);

    if (userReview && isEditing) {
      const { error } = await supabase
        .from('product_reviews')
        .update({ rating, review_text: reviewText || null, updated_at: new Date().toISOString() })
        .eq('id', userReview.id);

      if (error) {
        toast.error(language === 'ar' ? 'حدث خطأ' : 'Error updating review');
      } else {
        toast.success(language === 'ar' ? 'تم تحديث تقييمك' : 'Review updated');
        setIsEditing(false);
        fetchReviews();
      }
    } else {
      const { error } = await supabase
        .from('product_reviews')
        .insert({ product_id: productId, user_id: user.id, rating, review_text: reviewText || null });

      if (error) {
        if (error.code === '23505') {
          toast.error(language === 'ar' ? 'لقد قمت بتقييم هذا المنتج مسبقاً' : 'You already reviewed this product');
        } else {
          toast.error(language === 'ar' ? 'حدث خطأ' : 'Error submitting review');
        }
      } else {
        toast.success(language === 'ar' ? 'تم إضافة تقييمك' : 'Review submitted');
        fetchReviews();
      }
    }
    setSubmitting(false);
  };

  const renderStars = (value: number, interactive = false, size = 'w-5 h-5') => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            className={`${size} ${
              star <= (interactive ? (hoverRating || rating) : value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-secondary rounded-full" />
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          {language === 'ar' ? 'تقييمات المنتج' : 'Product Reviews'}
        </h2>
        <span className="text-muted-foreground text-sm">({reviews.length})</span>
      </div>

      {/* Review Form */}
      {user && (!userReview || isEditing) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-card border border-border space-y-4"
        >
          <h3 className="font-semibold text-foreground">
            {isEditing 
              ? (language === 'ar' ? 'تعديل تقييمك' : 'Edit your review')
              : (language === 'ar' ? 'أضف تقييمك' : 'Add your review')
            }
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {language === 'ar' ? 'تقييمك:' : 'Your rating:'}
            </span>
            {renderStars(rating, true, 'w-7 h-7')}
          </div>
          <Textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder={language === 'ar' ? 'اكتب تقييمك هنا (اختياري)...' : 'Write your review here (optional)...'}
            className="resize-none"
            rows={3}
          />
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={submitting || rating === 0} variant="neon">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {isEditing
                ? (language === 'ar' ? 'تحديث' : 'Update')
                : (language === 'ar' ? 'إرسال التقييم' : 'Submit Review')
              }
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={() => { setIsEditing(false); setRating(userReview!.rating); setReviewText(userReview!.review_text || ''); }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* User's existing review */}
      {userReview && !isEditing && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {language === 'ar' ? 'تقييمك' : 'Your review'}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              {language === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
          </div>
          {renderStars(userReview.rating)}
          {userReview.review_text && <p className="text-sm text-muted-foreground">{userReview.review_text}</p>}
        </div>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {language === 'ar' ? 'سجل الدخول لإضافة تقييمك' : 'Login to add your review'}
        </p>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {language === 'ar' ? 'لا توجد تقييمات بعد. كن أول من يقيّم!' : 'No reviews yet. Be the first to review!'}
        </p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.filter(r => r.user_id !== user?.id).map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-muted/30 border border-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {review.profile?.avatar_url ? (
                      <img src={review.profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className="font-medium text-sm text-foreground">
                      {review.profile?.full_name || (language === 'ar' ? 'مستخدم' : 'User')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                </div>
                {renderStars(review.rating)}
                {review.review_text && (
                  <p className="text-sm text-muted-foreground">{review.review_text}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
