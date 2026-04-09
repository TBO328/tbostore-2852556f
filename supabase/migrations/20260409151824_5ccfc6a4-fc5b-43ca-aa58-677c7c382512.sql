
-- Affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  affiliate_code TEXT NOT NULL UNIQUE,
  commission_percent NUMERIC NOT NULL DEFAULT 10,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  channel_name TEXT,
  channel_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own affiliate data"
ON public.affiliates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliates"
ON public.affiliates FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

CREATE POLICY "Admins can insert affiliates"
ON public.affiliates FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

CREATE POLICY "Admins can update affiliates"
ON public.affiliates FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

CREATE POLICY "Admins can delete affiliates"
ON public.affiliates FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

-- Affiliate orders tracking
CREATE TABLE public.affiliate_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_amount NUMERIC NOT NULL DEFAULT 0,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own orders"
ON public.affiliate_orders FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_id AND user_id = auth.uid())
);

CREATE POLICY "Admins can manage affiliate orders"
ON public.affiliate_orders FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

-- Function to process affiliate order
CREATE OR REPLACE FUNCTION public.process_affiliate_order(
  p_affiliate_code TEXT,
  p_order_id UUID,
  p_order_amount NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affiliate_id UUID;
  v_commission_percent NUMERIC;
  v_commission NUMERIC;
BEGIN
  SELECT id, commission_percent INTO v_affiliate_id, v_commission_percent
  FROM public.affiliates
  WHERE affiliate_code = p_affiliate_code AND is_active = true;

  IF v_affiliate_id IS NULL THEN
    RETURN false;
  END IF;

  v_commission := p_order_amount * (v_commission_percent / 100);

  INSERT INTO public.affiliate_orders (affiliate_id, order_id, order_amount, commission_amount)
  VALUES (v_affiliate_id, p_order_id, p_order_amount, v_commission);

  UPDATE public.affiliates
  SET total_earnings = total_earnings + v_commission,
      total_orders = total_orders + 1,
      updated_at = now()
  WHERE id = v_affiliate_id;

  RETURN true;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for affiliates
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_orders;
