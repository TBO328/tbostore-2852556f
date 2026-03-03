
-- Add activation instructions columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS activation_instructions_en text DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS activation_instructions_ar text DEFAULT NULL;
