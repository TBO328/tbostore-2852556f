-- Function to get all users with their roles (admin only)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  is_admin boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = au.id AND ur.role = 'admin'
    ) as is_admin
  FROM auth.users au
  ORDER BY au.created_at DESC
$$;

-- Function to set/remove admin role (admin only)
CREATE OR REPLACE FUNCTION public.set_admin_role(_target_user_id uuid, _make_admin boolean)
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
  
  IF _make_admin THEN
    -- Add admin role if not exists
    INSERT INTO user_roles (user_id, role)
    VALUES (_target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Remove admin role (but don't allow removing own admin role)
    IF _target_user_id = auth.uid() THEN
      RETURN false;
    END IF;
    
    DELETE FROM user_roles 
    WHERE user_id = _target_user_id AND role = 'admin';
  END IF;
  
  RETURN true;
END;
$$;