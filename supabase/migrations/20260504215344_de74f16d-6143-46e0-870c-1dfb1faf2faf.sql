
CREATE TABLE public.streamer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio_ar text,
  bio_en text,
  avatar_url text,
  banner_url text,
  social_links jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.streamer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active streamer profiles"
ON public.streamer_profiles FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage streamer profiles"
ON public.streamer_profiles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE TRIGGER trg_streamer_profiles_updated_at
BEFORE UPDATE ON public.streamer_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.streamer_portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id uuid NOT NULL REFERENCES public.streamer_profiles(id) ON DELETE CASCADE,
  portfolio_item_id uuid NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(streamer_id, portfolio_item_id)
);

ALTER TABLE public.streamer_portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view streamer portfolio links"
ON public.streamer_portfolio_items FOR SELECT USING (true);

CREATE POLICY "Admins can manage streamer portfolio links"
ON public.streamer_portfolio_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE INDEX idx_streamer_portfolio_streamer ON public.streamer_portfolio_items(streamer_id);
CREATE INDEX idx_streamer_profiles_slug ON public.streamer_profiles(slug);
