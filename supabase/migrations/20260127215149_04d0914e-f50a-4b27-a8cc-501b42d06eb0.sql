-- Create phone_otps table for SMS verification
CREATE TABLE public.phone_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_phone_otps_phone ON public.phone_otps(phone);
CREATE INDEX idx_phone_otps_expires_at ON public.phone_otps(expires_at);

-- Policy: Allow service role to manage OTPs (edge functions use service role)
CREATE POLICY "Service role can manage phone OTPs" 
ON public.phone_otps 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Auto-delete expired OTPs (cleanup function)
CREATE OR REPLACE FUNCTION public.cleanup_expired_phone_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.phone_otps WHERE expires_at < now();
END;
$$;