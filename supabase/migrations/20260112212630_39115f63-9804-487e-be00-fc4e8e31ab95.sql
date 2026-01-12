-- Create streamer_packages table
CREATE TABLE public.streamer_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.streamer_packages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active packages" 
ON public.streamer_packages 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage packages" 
ON public.streamer_packages 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_streamer_packages_updated_at
BEFORE UPDATE ON public.streamer_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default packages (prices in SAR)
INSERT INTO public.streamer_packages (name_ar, name_en, price, display_order) VALUES
('الباقة المخصصة', 'Custom Package', 0, 1),
('باقة TBO+', 'TBO+ Package', 45, 2),
('الباقة العادية', 'Standard Package', 15, 3);