-- Add pricing_options column to products table for variable pricing
-- This will store options like: [{ "label_en": "1 Month", "label_ar": "شهر واحد", "price": 50 }, { "label_en": "4 Months", "label_ar": "4 أشهر", "price": 150 }]
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS pricing_options jsonb DEFAULT NULL;

-- Add has_pricing_options boolean to quickly check if product has variable pricing
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS has_pricing_options boolean DEFAULT false;