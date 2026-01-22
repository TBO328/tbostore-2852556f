import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LoyaltyPointsData {
  points: number;
  totalEarned: number;
  totalRedeemed: number;
}

interface PointsTransaction {
  id: string;
  points: number;
  transaction_type: string;
  description_ar: string | null;
  description_en: string | null;
  created_at: string;
}

export const useLoyaltyPoints = () => {
  const { user } = useAuth();
  const [pointsData, setPointsData] = useState<LoyaltyPointsData>({
    points: 0,
    totalEarned: 0,
    totalRedeemed: 0
  });
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate points from amount (1 SAR = 1 point)
  const calculatePointsFromAmount = (amount: number): number => {
    return Math.floor(amount);
  };

  // Calculate SAR value from points (1 point = 0.1 SAR)
  const calculateValueFromPoints = (points: number): number => {
    return points * 0.1;
  };

  // Fetch user points
  const fetchPoints = async () => {
    if (!user) {
      setPointsData({ points: 0, totalEarned: 0, totalRedeemed: 0 });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching points:', error);
      }

      if (data) {
        setPointsData({
          points: data.points,
          totalEarned: data.total_earned,
          totalRedeemed: data.total_redeemed
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions history
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Add points (called after successful purchase)
  const addPoints = async (amount: number, orderId?: string) => {
    if (!user) return false;

    const points = calculatePointsFromAmount(amount);
    if (points <= 0) return false;

    try {
      const { data, error } = await supabase.rpc('add_loyalty_points', {
        p_user_id: user.id,
        p_points: points,
        p_order_id: orderId || null,
        p_description_ar: `نقاط من عملية شراء بقيمة ${amount} ريال`,
        p_description_en: `Points from ${amount} SAR purchase`
      });

      if (error) {
        console.error('Error adding points:', error);
        return false;
      }

      await fetchPoints();
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  // Redeem points
  const redeemPoints = async (points: number) => {
    if (!user || points <= 0 || points > pointsData.points) return false;

    try {
      const { data, error } = await supabase.rpc('redeem_loyalty_points', {
        p_user_id: user.id,
        p_points: points,
        p_description_ar: `استبدال ${points} نقطة`,
        p_description_en: `Redeemed ${points} points`
      });

      if (error) {
        console.error('Error redeeming points:', error);
        return false;
      }

      await fetchPoints();
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchPoints();
    fetchTransactions();
  }, [user]);

  return {
    points: pointsData.points,
    totalEarned: pointsData.totalEarned,
    totalRedeemed: pointsData.totalRedeemed,
    transactions,
    loading,
    calculatePointsFromAmount,
    calculateValueFromPoints,
    addPoints,
    redeemPoints,
    refetch: fetchPoints
  };
};

export default useLoyaltyPoints;
