import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserRank {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  discount_percent: number;
  badge_color: string;
  icon: string;
  properties: string[];
}

export const useUserRank = () => {
  const { user } = useAuth();
  const [rank, setRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRank = async () => {
      if (!user) {
        // Set default rank for non-logged-in users
        setRank({
          id: 'default',
          name_en: 'Regular Customer',
          name_ar: 'عميل عادي',
          description_en: 'Standard customer benefits',
          description_ar: 'مزايا العميل العادي',
          discount_percent: 0,
          badge_color: '#B87333', // Bronze
          icon: 'user',
          properties: [],
        });
        setLoading(false);
        return;
      }

      try {
        // Get user's profile with rank
        const { data: profile } = await supabase
          .from('profiles')
          .select('rank_id')
          .eq('user_id', user.id)
          .single();

        if (profile?.rank_id) {
          // Get the rank details
          const { data: rankData } = await supabase
            .from('ranks')
            .select('*')
            .eq('id', profile.rank_id)
            .eq('is_active', true)
            .single();

          if (rankData) {
            setRank({
              ...rankData,
              properties: Array.isArray(rankData.properties) ? rankData.properties as string[] : [],
            });
          } else {
            // Set default rank
            setRank({
              id: 'default',
              name_en: 'Regular Customer',
              name_ar: 'عميل عادي',
              description_en: 'Standard customer benefits',
              description_ar: 'مزايا العميل العادي',
              discount_percent: 0,
              badge_color: '#B87333',
              icon: 'user',
              properties: [],
            });
          }
        } else {
          // No rank assigned, use default
          setRank({
            id: 'default',
            name_en: 'Regular Customer',
            name_ar: 'عميل عادي',
            description_en: 'Standard customer benefits',
            description_ar: 'مزايا العميل العادي',
            discount_percent: 0,
            badge_color: '#B87333',
            icon: 'user',
            properties: [],
          });
        }
      } catch (error) {
        console.error('Error fetching user rank:', error);
        // Set default on error
        setRank({
          id: 'default',
          name_en: 'Regular Customer',
          name_ar: 'عميل عادي',
          description_en: 'Standard customer benefits',
          description_ar: 'مزايا العميل العادي',
          discount_percent: 0,
          badge_color: '#B87333',
          icon: 'user',
          properties: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRank();
  }, [user]);

  return { rank, loading };
};
