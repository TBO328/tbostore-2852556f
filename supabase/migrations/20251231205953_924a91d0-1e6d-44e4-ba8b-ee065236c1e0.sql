-- Fix payment_settings: Restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view payment settings" ON public.payment_settings;

CREATE POLICY "Authenticated users can view payment settings"
ON public.payment_settings
FOR SELECT
TO authenticated
USING (true);

-- Add explicit SELECT policy for orders (admin only)
CREATE POLICY "Only admins can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix products storage: Add proper admin-only upload policies
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Restrict generate_order_number to authenticated users only
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;

-- Add rate limiting for orders based on phone number
CREATE OR REPLACE FUNCTION public.check_order_rate_limit(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- Count recent orders from this phone in last hour
  SELECT COUNT(*) INTO v_count
  FROM orders
  WHERE customer_phone = p_phone
    AND created_at > now() - interval '1 hour';
  
  -- Allow max 5 orders per hour per phone
  RETURN v_count < 5;
END;
$$;

-- Update order insert policy with rate limiting
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Rate limited order creation"
ON public.orders
FOR INSERT
WITH CHECK (check_order_rate_limit(customer_phone));