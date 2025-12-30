import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const ReviewForm: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [form, setForm] = useState({
    name: '',
    review: '',
    productName: ''
  });

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

      setForm({ name: '', review: '', productName: '' });
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

        {/* Name */}
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
