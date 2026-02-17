ALTER TABLE public.portfolio_items 
ADD COLUMN IF NOT EXISTS media_files jsonb DEFAULT '[]'::jsonb;