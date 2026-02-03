import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RankDiscount {
  discount_percent: number;
  rank_name_en: string | null;
  rank_name_ar: string | null;
}

export const useRankDiscount = () => {
  const [rankDiscount, setRankDiscount] = useState<RankDiscount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankDiscount = async () => {
      setLoading(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRankDiscount(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.rpc('get_user_rank_discount', {
          p_user_id: user.id
        });

        if (error) {
          console.error('Error fetching rank discount:', error);
          setRankDiscount(null);
        } else if (data && data.length > 0 && data[0].discount_percent > 0) {
          setRankDiscount({
            discount_percent: data[0].discount_percent,
            rank_name_en: data[0].rank_name_en,
            rank_name_ar: data[0].rank_name_ar,
          });
        } else {
          setRankDiscount(null);
        }
      } catch (error) {
        console.error('Error in useRankDiscount:', error);
        setRankDiscount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRankDiscount();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRankDiscount();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { rankDiscount, loading };
};

export default useRankDiscount;
