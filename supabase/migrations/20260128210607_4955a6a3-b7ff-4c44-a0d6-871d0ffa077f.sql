-- Add images array column to products table for multiple product images
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Update existing products to include main image in images array
UPDATE public.products 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);