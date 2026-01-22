
-- Add blacklist and personal coupon support to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blacklisted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blacklist_reason text;

-- Add user_id to coupons for personal coupons
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_personal boolean DEFAULT false;

-- Create function to update user loyalty points (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_loyalty_points(
  p_target_user_id uuid,
  p_points_change integer,
  p_description_ar text DEFAULT 'تعديل من الإدارة',
  p_description_en text DEFAULT 'Admin adjustment'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  
  -- Insert or update loyalty points
  INSERT INTO loyalty_points (user_id, points, total_earned, total_redeemed)
  VALUES (
    p_target_user_id, 
    GREATEST(0, p_points_change), 
    CASE WHEN p_points_change > 0 THEN p_points_change ELSE 0 END,
    CASE WHEN p_points_change < 0 THEN ABS(p_points_change) ELSE 0 END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = GREATEST(0, loyalty_points.points + p_points_change),
    total_earned = CASE WHEN p_points_change > 0 THEN loyalty_points.total_earned + p_points_change ELSE loyalty_points.total_earned END,
    total_redeemed = CASE WHEN p_points_change < 0 THEN loyalty_points.total_redeemed + ABS(p_points_change) ELSE loyalty_points.total_redeemed END,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO points_transactions (user_id, points, transaction_type, description_ar, description_en)
  VALUES (
    p_target_user_id, 
    p_points_change, 
    CASE WHEN p_points_change > 0 THEN 'admin_add' ELSE 'admin_deduct' END,
    p_description_ar,
    p_description_en
  );
  
  RETURN true;
END;
$$;

-- Create function to blacklist user
CREATE OR REPLACE FUNCTION public.set_user_blacklist(
  p_target_user_id uuid,
  p_is_blacklisted boolean,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  
  UPDATE profiles 
  SET 
    is_blacklisted = p_is_blacklisted,
    blacklist_reason = p_reason,
    updated_at = now()
  WHERE user_id = p_target_user_id;
  
  RETURN true;
END;
$$;

-- Create function to update user profile by admin
CREATE OR REPLACE FUNCTION public.admin_update_user_profile(
  p_target_user_id uuid,
  p_full_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  
  UPDATE profiles 
  SET 
    full_name = COALESCE(p_full_name, full_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE user_id = p_target_user_id;
  
  RETURN true;
END;
$$;

-- Create function to get full user details for admin
CREATE OR REPLACE FUNCTION public.get_user_details_for_admin(p_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamptz,
  full_name text,
  avatar_url text,
  is_admin boolean,
  is_blacklisted boolean,
  blacklist_reason text,
  loyalty_points integer,
  total_earned integer,
  total_redeemed integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    p.full_name,
    p.avatar_url,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = au.id AND ur.role = 'admin') as is_admin,
    COALESCE(p.is_blacklisted, false) as is_blacklisted,
    p.blacklist_reason,
    COALESCE(lp.points, 0) as loyalty_points,
    COALESCE(lp.total_earned, 0) as total_earned,
    COALESCE(lp.total_redeemed, 0) as total_redeemed
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN loyalty_points lp ON lp.user_id = au.id
  WHERE au.id = p_user_id
$$;

-- Create function to search users
CREATE OR REPLACE FUNCTION public.search_users_for_admin(p_search_term text DEFAULT NULL)
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamptz,
  full_name text,
  avatar_url text,
  is_admin boolean,
  is_blacklisted boolean,
  loyalty_points integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    p.full_name,
    p.avatar_url,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = au.id AND ur.role = 'admin') as is_admin,
    COALESCE(p.is_blacklisted, false) as is_blacklisted,
    COALESCE(lp.points, 0) as loyalty_points
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN loyalty_points lp ON lp.user_id = au.id
  WHERE 
    p_search_term IS NULL 
    OR p_search_term = ''
    OR au.email ILIKE '%' || p_search_term || '%'
    OR p.full_name ILIKE '%' || p_search_term || '%'
    OR au.id::text ILIKE '%' || p_search_term || '%'
  ORDER BY au.created_at DESC
$$;

-- Create function to create personal coupon for user
CREATE OR REPLACE FUNCTION public.create_personal_coupon(
  p_target_user_id uuid,
  p_code text,
  p_discount_percent integer,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_coupon_id uuid;
BEGIN
  -- Only admins can call this
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO coupons (code, discount_percent, user_id, is_personal, expires_at, is_active)
  VALUES (p_code, p_discount_percent, p_target_user_id, true, p_expires_at, true)
  RETURNING id INTO new_coupon_id;
  
  RETURN new_coupon_id;
END;
$$;

-- Create function to get user's personal coupons
CREATE OR REPLACE FUNCTION public.get_user_personal_coupons(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  code text,
  discount_percent integer,
  expires_at timestamptz,
  is_active boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, code, discount_percent, expires_at, is_active, created_at
  FROM coupons
  WHERE user_id = p_user_id AND is_personal = true
  ORDER BY created_at DESC
$$;

-- Update validate_coupon to check personal coupons
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code text, p_user_id uuid DEFAULT NULL)
RETURNS TABLE(is_valid boolean, discount_percent integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_valid,
    c.discount_percent
  FROM public.coupons c
  WHERE c.code = coupon_code
    AND c.is_active = true
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (
      c.is_personal = false 
      OR (c.is_personal = true AND c.user_id = p_user_id)
    );
  
  -- If no rows returned, return invalid result
  IF NOT FOUND THEN
    RETURN QUERY SELECT false as is_valid, 0 as discount_percent;
  END IF;
END;
$$;

-- Create function to delete user account
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  
  -- Don't allow deleting yourself
  IF p_target_user_id = auth.uid() THEN
    RETURN false;
  END IF;
  
  -- Delete from auth.users (this will cascade to profiles, etc.)
  DELETE FROM auth.users WHERE id = p_target_user_id;
  
  RETURN true;
END;
$$;
