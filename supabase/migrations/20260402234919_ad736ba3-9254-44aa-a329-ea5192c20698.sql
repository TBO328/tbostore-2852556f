
-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid;

-- Generate referral codes for existing users
UPDATE public.profiles SET referral_code = UPPER(SUBSTRING(md5(random()::text || user_id::text) FROM 1 FOR 8)) WHERE referral_code IS NULL;

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  points_awarded integer NOT NULL DEFAULT 50,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- RLS: Admins can manage all referrals
CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to process referral on signup
CREATE OR REPLACE FUNCTION public.process_referral(p_referral_code text, p_new_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_referrer_id uuid;
  v_points integer := 50;
BEGIN
  -- Find referrer by code
  SELECT user_id INTO v_referrer_id FROM profiles WHERE referral_code = UPPER(p_referral_code);
  
  IF v_referrer_id IS NULL THEN RETURN false; END IF;
  IF v_referrer_id = p_new_user_id THEN RETURN false; END IF;
  
  -- Check if already referred
  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = p_new_user_id) THEN RETURN false; END IF;
  
  -- Record referral
  INSERT INTO referrals (referrer_id, referred_id, points_awarded) VALUES (v_referrer_id, p_new_user_id, v_points);
  
  -- Update referred_by
  UPDATE profiles SET referred_by = v_referrer_id WHERE user_id = p_new_user_id;
  
  -- Award points to referrer
  PERFORM add_loyalty_points(v_referrer_id, v_points, NULL, 'نقاط إحالة صديق', 'Referral bonus points');
  
  RETURN true;
END;
$$;

-- Function to auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(md5(random()::text || NEW.user_id::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Function to get referral stats
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id uuid)
RETURNS TABLE(total_referrals bigint, total_points_earned bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    COUNT(*) as total_referrals,
    COALESCE(SUM(points_awarded), 0) as total_points_earned
  FROM referrals
  WHERE referrer_id = p_user_id;
$$;
