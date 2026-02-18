
-- Add tracking column to user_carts to know if abandoned cart coupon was sent
ALTER TABLE public.user_carts 
ADD COLUMN IF NOT EXISTS abandoned_coupon_sent_at timestamp with time zone DEFAULT NULL;

-- Create a table to track abandoned cart coupon records
CREATE TABLE IF NOT EXISTS public.abandoned_cart_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  coupon_id uuid NOT NULL,
  coupon_code text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.abandoned_cart_coupons ENABLE ROW LEVEL SECURITY;

-- Admins can view all
CREATE POLICY "Admins can view abandoned cart coupons"
ON public.abandoned_cart_coupons
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own
CREATE POLICY "Users can view their own abandoned cart coupons"
ON public.abandoned_cart_coupons
FOR SELECT
USING (auth.uid() = user_id);
