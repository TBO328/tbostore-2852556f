
DROP FUNCTION IF EXISTS public.get_user_details_for_admin(uuid);

CREATE OR REPLACE FUNCTION public.get_user_details_for_admin(p_user_id uuid)
 RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone, full_name text, avatar_url text, is_admin boolean, is_owner boolean, is_blacklisted boolean, blacklist_reason text, loyalty_points integer, total_earned integer, total_redeemed integer, auth_phone text)
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
    COALESCE(lp.total_redeemed, 0) as total_redeemed,
    au.phone as auth_phone
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN loyalty_points lp ON lp.user_id = au.id
  WHERE au.id = p_user_id
$function$
