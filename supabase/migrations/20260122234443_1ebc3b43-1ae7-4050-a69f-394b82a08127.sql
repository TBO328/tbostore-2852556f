-- Create function to send password reset email (admin only)
CREATE OR REPLACE FUNCTION public.admin_send_password_reset(p_target_user_email text)
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
  
  -- The actual password reset will be done via Supabase Auth API
  -- This function just validates admin access
  RETURN true;
END;
$$;