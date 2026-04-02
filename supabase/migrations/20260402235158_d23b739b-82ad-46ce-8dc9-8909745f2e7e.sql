
CREATE OR REPLACE FUNCTION public.process_referral(p_referral_code text, p_new_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_referrer_id uuid;
  v_points integer := 5;
BEGIN
  SELECT user_id INTO v_referrer_id FROM profiles WHERE referral_code = UPPER(p_referral_code);
  IF v_referrer_id IS NULL THEN RETURN false; END IF;
  IF v_referrer_id = p_new_user_id THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = p_new_user_id) THEN RETURN false; END IF;
  
  INSERT INTO referrals (referrer_id, referred_id, points_awarded) VALUES (v_referrer_id, p_new_user_id, v_points);
  UPDATE profiles SET referred_by = v_referrer_id WHERE user_id = p_new_user_id;
  PERFORM add_loyalty_points(v_referrer_id, v_points, NULL, 'نقاط إحالة صديق', 'Referral bonus points');
  
  RETURN true;
END;
$$;
