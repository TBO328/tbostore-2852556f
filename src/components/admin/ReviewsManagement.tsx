import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Pencil, Trash2, Check, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminReviews, Review } from '@/hooks/useReviews';

interface ReviewsManagementProps {
  language: 'en' | 'ar';
  toast: (props: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const ReviewsManagement: React.FC<ReviewsManagementProps> = ({ language, toast }) => {
  const { reviews, loading, updateReview, deleteReview, uploadAvatar } = useAdminReviews();
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setAvatarPreview(review.customer_avatar);
    setEditDialogOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingReview) return;
    setSaving(true);
    try {
      let avatarUrl = editingReview.customer_avatar;
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile);
        if (uploaded) avatarUrl = uploaded;
      }
      await updateReview(editingReview.id, {
        ...editingReview,
        customer_avatar: avatarUrl
      });
      toast({ title: language === 'en' ? 'Review updated!' : 'تم تحديث التقييم!' });
      setEditDialogOpen(false);
      setEditingReview(null);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toast({ title: language === 'en' ? 'Error' : 'خطأ', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this review?' : 'حذف هذا التقييم؟')) return;
    try {
      await deleteReview(id);
      toast({ title: language === 'en' ? 'Review deleted' : 'تم حذف التقييم' });
    } catch (error) {
      toast({ title: language === 'en' ? 'Error' : 'خطأ', variant: 'destructive' });
    }
  };

  const handleApprove = async (review: Review, approved: boolean) => {
    try {
      await updateReview(review.id, { is_approved: approved });
      toast({ title: approved ? (language === 'en' ? 'Review approved!' : 'تمت الموافقة!') : (language === 'en' ? 'Review hidden' : 'تم إخفاء التقييم') });
    } catch (error) {
      toast({ title: language === 'en' ? 'Error' : 'خطأ', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {language === 'en' ? 'Manage Reviews' : 'إدارة التقييمات'}
        </h2>
        <span className="text-sm text-muted-foreground">
          {reviews.length} {language === 'en' ? 'reviews' : 'تقييم'}
        </span>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {review.customer_avatar ? (
                <img src={review.customer_avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{review.customer_name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-foreground">{review.customer_name}</h3>
                    {review.is_approved && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-primary fill-primary" />
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${review.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {review.is_approved ? (language === 'en' ? 'Approved' : 'معتمد') : (language === 'en' ? 'Pending' : 'معلق')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{review.review_text_ar}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleApprove(review, !review.is_approved)}
                  className={review.is_approved ? 'hover:bg-yellow-500/10 hover:text-yellow-500' : 'hover:bg-green-500/10 hover:text-green-500'}
                >
                  {review.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(review)} className="hover:bg-primary/10 hover:text-primary">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)} className="hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{language === 'en' ? 'No reviews yet' : 'لا توجد تقييمات بعد'}</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Edit Review' : 'تعديل التقييم'}</DialogTitle>
          </DialogHeader>
          {editingReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">{editingReview.customer_name.charAt(0)}</span>
                  </div>
                )}
                <label className="flex-1">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{language === 'en' ? 'Change Avatar' : 'تغيير الصورة'}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Name' : 'الاسم'}</Label>
                <Input
                  value={editingReview.customer_name}
                  onChange={(e) => setEditingReview({ ...editingReview, customer_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Review (Arabic)' : 'التقييم (عربي)'}</Label>
                <Textarea
                  value={editingReview.review_text_ar || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, review_text_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingReview.is_approved}
                  onCheckedChange={(checked) => setEditingReview({ ...editingReview, is_approved: checked })}
                />
                <Label>{language === 'en' ? 'Approved' : 'معتمد'}</Label>
              </div>
              <Button onClick={handleSave} variant="neon-filled" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {language === 'en' ? 'Save' : 'حفظ'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewsManagement;
