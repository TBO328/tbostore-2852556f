-- Create loyalty points table for tracking user points
CREATE TABLE public.loyalty_points (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    points integer NOT NULL DEFAULT 0,
    total_earned integer NOT NULL DEFAULT 0,
    total_redeemed integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- Create points transactions table for history
CREATE TABLE public.points_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    points integer NOT NULL,
    transaction_type text NOT NULL, -- 'earned', 'redeemed', 'expired', 'bonus'
    order_id uuid NULL,
    description_ar text,
    description_en text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for loyalty_points
CREATE POLICY "Users can view their own points" 
ON public.loyalty_points 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert points" 
ON public.loyalty_points 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update points" 
ON public.loyalty_points 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all points" 
ON public.loyalty_points 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for points_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.points_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" 
ON public.points_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" 
ON public.points_transactions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Function to calculate points from purchase amount (1 SAR = 1 point)
CREATE OR REPLACE FUNCTION public.calculate_points_from_amount(amount numeric)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1 point per 1 SAR spent
  RETURN FLOOR(amount)::integer;
END;
$$;

-- Function to add points to user
CREATE OR REPLACE FUNCTION public.add_loyalty_points(
  p_user_id uuid,
  p_points integer,
  p_order_id uuid DEFAULT NULL,
  p_description_ar text DEFAULT 'نقاط من عملية شراء',
  p_description_en text DEFAULT 'Points from purchase'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update loyalty points
  INSERT INTO loyalty_points (user_id, points, total_earned)
  VALUES (p_user_id, p_points, p_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = loyalty_points.points + p_points,
    total_earned = loyalty_points.total_earned + p_points,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO points_transactions (user_id, points, transaction_type, order_id, description_ar, description_en)
  VALUES (p_user_id, p_points, 'earned', p_order_id, p_description_ar, p_description_en);
  
  RETURN true;
END;
$$;

-- Function to redeem points
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(
  p_user_id uuid,
  p_points integer,
  p_description_ar text DEFAULT 'استبدال نقاط',
  p_description_en text DEFAULT 'Points redeemed'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_points integer;
BEGIN
  -- Get current points
  SELECT points INTO current_points FROM loyalty_points WHERE user_id = p_user_id;
  
  -- Check if user has enough points
  IF current_points IS NULL OR current_points < p_points THEN
    RETURN false;
  END IF;
  
  -- Deduct points
  UPDATE loyalty_points 
  SET 
    points = points - p_points,
    total_redeemed = total_redeemed + p_points,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO points_transactions (user_id, points, transaction_type, description_ar, description_en)
  VALUES (p_user_id, -p_points, 'redeemed', p_description_ar, p_description_en);
  
  RETURN true;
END;
$$;

-- Function to get user points balance
CREATE OR REPLACE FUNCTION public.get_user_points(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_points integer;
BEGIN
  SELECT points INTO user_points FROM loyalty_points WHERE user_id = p_user_id;
  RETURN COALESCE(user_points, 0);
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_loyalty_points_updated_at
BEFORE UPDATE ON public.loyalty_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add loyalty section content to page_content if not exists
INSERT INTO public.page_content (page_key, title_en, title_ar, content_en, content_ar, metadata)
VALUES (
  'loyalty_program',
  'Loyalty Points',
  'نقاط الولاء',
  'Earn points with every purchase and redeem them for discounts!',
  'اكسب نقاط مع كل عملية شراء واستبدلها بخصومات!',
  '{"points_value": 0.1, "points_per_sar": 1}'::jsonb
)
ON CONFLICT DO NOTHING;