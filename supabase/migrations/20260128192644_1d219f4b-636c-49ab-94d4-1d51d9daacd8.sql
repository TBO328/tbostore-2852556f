-- Create payment_receipts table for storing transfer receipts
CREATE TABLE public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  receipt_url TEXT NOT NULL,
  customer_note TEXT,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for customers uploading receipts)
CREATE POLICY "Anyone can insert receipts"
ON public.payment_receipts
FOR INSERT
WITH CHECK (true);

-- Allow admins to view and update receipts
CREATE POLICY "Admins can view all receipts"
ON public.payment_receipts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Admins can update receipts"
ON public.payment_receipts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'owner')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_receipts_updated_at
BEFORE UPDATE ON public.payment_receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for receipts bucket
CREATE POLICY "Anyone can upload receipts"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Anyone can view receipts"
ON storage.objects
FOR SELECT
USING (bucket_id = 'receipts');