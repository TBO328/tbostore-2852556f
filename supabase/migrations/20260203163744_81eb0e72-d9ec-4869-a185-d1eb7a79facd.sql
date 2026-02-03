-- Create ranks table for customer tiers with permanent discounts
CREATE TABLE public.ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    discount_percent INTEGER NOT NULL DEFAULT 0,
    badge_color TEXT DEFAULT '#FFD700',
    icon TEXT DEFAULT 'crown',
    properties JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT discount_range CHECK (discount_percent >= 0 AND discount_percent <= 100)
);

-- Add rank_id to profiles table
ALTER TABLE public.profiles ADD COLUMN rank_id UUID REFERENCES public.ranks(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;

-- RLS policies for ranks
CREATE POLICY "Anyone can view active ranks"
ON public.ranks FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage ranks"
ON public.ranks FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to get user's rank discount
CREATE OR REPLACE FUNCTION public.get_user_rank_discount(p_user_id UUID)
RETURNS TABLE(discount_percent INTEGER, rank_name_en TEXT, rank_name_ar TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        COALESCE(r.discount_percent, 0) as discount_percent,
        r.name_en as rank_name_en,
        r.name_ar as rank_name_ar
    FROM profiles p
    LEFT JOIN ranks r ON p.rank_id = r.id AND r.is_active = true
    WHERE p.user_id = p_user_id;
$$;

-- Function to assign rank to user (admin only)
CREATE OR REPLACE FUNCTION public.assign_user_rank(p_target_user_id UUID, p_rank_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only admins can call this
    IF NOT has_role(auth.uid(), 'admin') THEN
        RETURN false;
    END IF;
    
    UPDATE profiles 
    SET rank_id = p_rank_id, updated_at = now()
    WHERE user_id = p_target_user_id;
    
    RETURN true;
END;
$$;

-- Insert default ranks
INSERT INTO public.ranks (name_en, name_ar, description_en, description_ar, discount_percent, badge_color, icon, display_order) VALUES
('Regular Customer', 'عميل عادي', 'Standard customer with no discount', 'عميل عادي بدون خصم', 0, '#808080', 'user', 1),
('VIP Customer', 'عميل مميز', 'VIP customer with 10% permanent discount', 'عميل مميز مع خصم دائم 10%', 10, '#FFD700', 'crown', 2),
('Premium Customer', 'عميل بريميوم', 'Premium customer with 15% permanent discount', 'عميل بريميوم مع خصم دائم 15%', 15, '#C0C0C0', 'star', 3),
('Elite Customer', 'عميل نخبة', 'Elite customer with 20% permanent discount', 'عميل نخبة مع خصم دائم 20%', 20, '#E5E4E2', 'diamond', 4);