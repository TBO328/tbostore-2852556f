-- Create table to store OTP codes for password reset
CREATE TABLE public.password_reset_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Only admins can access OTP codes
CREATE POLICY "Admins can manage OTP codes"
ON public.password_reset_otps
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate and store OTP
CREATE OR REPLACE FUNCTION public.generate_password_reset_otp(p_user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp TEXT;
  v_user_id UUID;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can generate OTP codes';
  END IF;

  -- Get user_id from email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Generate 6-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

  -- Delete any existing unused OTPs for this user
  DELETE FROM public.password_reset_otps WHERE user_email = p_user_email AND used = false;

  -- Insert new OTP
  INSERT INTO public.password_reset_otps (user_id, user_email, otp_code)
  VALUES (v_user_id, p_user_email, v_otp);

  RETURN v_otp;
END;
$$;

-- Function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_password_reset_otp(p_user_email TEXT, p_otp TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can verify OTP codes';
  END IF;

  -- Check if OTP is valid
  SELECT EXISTS(
    SELECT 1 FROM public.password_reset_otps
    WHERE user_email = p_user_email
      AND otp_code = p_otp
      AND used = false
      AND expires_at > now()
  ) INTO v_valid;

  IF v_valid THEN
    -- Mark OTP as used
    UPDATE public.password_reset_otps
    SET used = true
    WHERE user_email = p_user_email AND otp_code = p_otp;
  END IF;

  RETURN v_valid;
END;
$$;