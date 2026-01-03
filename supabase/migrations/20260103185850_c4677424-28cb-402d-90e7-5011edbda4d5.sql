-- Fix payment_settings RLS: Change public SELECT to admin only
DROP POLICY IF EXISTS "Authenticated users can view payment settings" ON public.payment_settings;

CREATE POLICY "Only admins can view payment settings" 
ON public.payment_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));