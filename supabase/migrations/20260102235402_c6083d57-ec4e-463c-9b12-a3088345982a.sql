-- Create table for managing page content
CREATE TABLE public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  title_en TEXT,
  title_ar TEXT,
  content_en TEXT,
  content_ar TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view page content
CREATE POLICY "Anyone can view page content"
ON public.page_content
FOR SELECT
USING (true);

-- Only admins can manage page content
CREATE POLICY "Admins can manage page content"
ON public.page_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default page content
INSERT INTO public.page_content (page_key, title_en, title_ar, content_en, content_ar) VALUES
  ('hero', 'Hero Section', 'قسم البطل', 'Welcome to TBO Store', 'مرحباً بك في متجر TBO'),
  ('about', 'About Us', 'من نحن', 'About our store', 'عن متجرنا'),
  ('contact', 'Contact Us', 'تواصل معنا', 'Get in touch', 'تواصل معنا'),
  ('footer', 'Footer', 'التذييل', 'Footer content', 'محتوى التذييل');