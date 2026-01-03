import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  customer_name: string;
  customer_avatar: string | null;
  rating: number;
  review_text_en: string | null;
  review_text_ar: string | null;
  product_name_en: string | null;
  product_name_ar: string | null;
  is_approved: boolean;
  created_at: string;
}

export const useReviews = (approvedOnly: boolean = true) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [approvedOnly]);

  return { reviews, loading, refetch: fetchReviews };
};

export const useAdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    const { error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchReviews();
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchReviews();
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    // Validate file type (MIME type, not extension)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
      return null;
    }
    
    // Validate file size - max 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large. Maximum size is 5MB.');
      return null;
    }
    
    // Use MIME type to determine extension instead of trusting filename
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    const fileExt = mimeToExt[file.type] || 'jpg';
    
    const fileName = `review-avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return { reviews, loading, updateReview, deleteReview, uploadAvatar, refetch: fetchReviews };
};
