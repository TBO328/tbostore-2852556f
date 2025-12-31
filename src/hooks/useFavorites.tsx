import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Favorite {
  id: string;
  product_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.product_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addToFavorites = async (productId: string) => {
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;
      
      setFavorites(prev => [...prev, productId]);
      toast.success(language === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to favorites');
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
      return false;
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      
      setFavorites(prev => prev.filter(id => id !== productId));
      toast.success(language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites');
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return false;
    }

    if (favorites.includes(productId)) {
      return removeFromFavorites(productId);
    } else {
      return addToFavorites(productId);
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  };
};
