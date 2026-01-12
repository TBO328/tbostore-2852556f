-- Add category column to streamer_packages for grouping packages by type
ALTER TABLE public.streamer_packages ADD COLUMN IF NOT EXISTS category text DEFAULT 'streamers';
ALTER TABLE public.streamer_packages ADD COLUMN IF NOT EXISTS category_ar text DEFAULT 'باقات الستريمرز';

-- Create categories table for dynamic category management
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value text NOT NULL UNIQUE,
  label_en text NOT NULL,
  label_ar text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default categories
INSERT INTO public.categories (value, label_en, label_ar, display_order) VALUES
  ('Subscriptions', 'Subscriptions', 'اشتراكات', 1),
  ('Designs', 'Designs', 'تصاميم', 2),
  ('Engagement', 'Engagement', 'تفاعل', 3),
  ('Discord', 'Discord', 'ديسكورد', 4)
ON CONFLICT (value) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();