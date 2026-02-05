
-- =====================
-- Portfolio/Works Table
-- =====================
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image', -- image, video, gif
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active portfolio items"
ON public.portfolio_items FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage portfolio items"
ON public.portfolio_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================
-- Chat Media Support
-- =====================
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT; -- image, voice

-- =====================
-- Product Subscription Fields
-- =====================
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS requires_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_duration TEXT;

-- =====================
-- Enable Realtime for Portfolio
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_items;
