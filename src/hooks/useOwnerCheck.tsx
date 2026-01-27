import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useOwnerCheck = () => {
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOwnerRole = async () => {
      if (!user) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_owner', {
          _user_id: user.id
        });

        if (!error && data) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Error checking owner role:', error);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };

    checkOwnerRole();
  }, [user]);

  return { isOwner, loading };
};
