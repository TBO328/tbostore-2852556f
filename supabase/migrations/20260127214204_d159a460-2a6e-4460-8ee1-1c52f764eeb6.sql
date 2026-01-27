-- Drop existing functions first
DROP FUNCTION IF EXISTS public.search_users_for_admin(text);
DROP FUNCTION IF EXISTS public.get_user_details_for_admin(uuid);

-- Create function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'owner'
  )
$$;

-- Update set_admin_role to only allow owners to manage admin roles
CREATE OR REPLACE FUNCTION public.set_admin_role(_target_user_id uuid, _make_admin boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only owners can call this
  IF NOT is_owner(auth.uid()) THEN
    RETURN false;
  END IF;
  
  IF _make_admin THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (_target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    IF _target_user_id = auth.uid() THEN
      RETURN false;
    END IF;
    
    DELETE FROM user_roles 
    WHERE user_id = _target_user_id AND role = 'admin';
  END IF;
  
  RETURN true;
END;
$function$;

-- Insert owner role for the specified email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::app_role
FROM auth.users 
WHERE email = 'mxt.hamadh@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Recreate search_users_for_admin with is_owner
CREATE FUNCTION public.search_users_for_admin(p_search_term text DEFAULT NULL::text)
 RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone, full_name text, avatar_url text, is_admin boolean, is_owner boolean, is_blacklisted boolean, loyalty_points integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    p.full_name,
    p.avatar_url,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = au.id AND ur.role = 'admin') as is_admin,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = au.id AND ur.role = 'owner') as is_owner,
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
$function$;

-- Recreate get_user_details_for_admin with is_owner
CREATE FUNCTION public.get_user_details_for_admin(p_user_id uuid)
 RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone, full_name text, avatar_url text, is_admin boolean, is_owner boolean, is_blacklisted boolean, blacklist_reason text, loyalty_points integer, total_earned integer, total_redeemed integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    p.full_name,
    p.avatar_url,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = au.id AND ur.role = 'admin') as is_admin,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = au.id AND ur.role = 'owner') as is_owner,
    COALESCE(p.is_blacklisted, false) as is_blacklisted,
    p.blacklist_reason,
    COALESCE(lp.points, 0) as loyalty_points,
    COALESCE(lp.total_earned, 0) as total_earned,
    COALESCE(lp.total_redeemed, 0) as total_redeemed
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN loyalty_points lp ON lp.user_id = au.id
  WHERE au.id = p_user_id
$function$;