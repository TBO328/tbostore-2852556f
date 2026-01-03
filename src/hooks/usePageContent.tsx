import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageContentMetadata {
  texts?: Record<string, string>;
  images?: Record<string, string>;
  [key: string]: unknown;
}

interface PageContent {
  id: string;
  page_key: string;
  title_en: string | null;
  title_ar: string | null;
  content_en: string | null;
  content_ar: string | null;
  image_url: string | null;
  metadata: PageContentMetadata | null;
  created_at: string;
  updated_at: string;
}

export const usePageContent = (pageKey: string) => {
  const { language } = useLanguage();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['page-content', pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .maybeSingle();

      if (error) throw error;
      return data as PageContent | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get text content with fallback
  const getText = (key: string, fallback: string = ''): string => {
    if (!data?.metadata?.texts) return fallback;
    const texts = data.metadata.texts;
    
    // Try language-specific key first
    const langKey = `${key}_${language}`;
    if (texts[langKey]) return texts[langKey];
    
    // Try generic key
    if (texts[key]) return texts[key];
    
    return fallback;
  };

  // Get image URL with fallback
  const getImage = (key: string, fallback: string = ''): string => {
    if (!data?.metadata?.images) return fallback;
    return data.metadata.images[key] || fallback;
  };

  // Get title based on language
  const getTitle = (fallback: string = ''): string => {
    if (!data) return fallback;
    return language === 'ar' ? (data.title_ar || fallback) : (data.title_en || fallback);
  };

  // Get content based on language
  const getContent = (fallback: string = ''): string => {
    if (!data) return fallback;
    return language === 'ar' ? (data.content_ar || fallback) : (data.content_en || fallback);
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    getText,
    getImage,
    getTitle,
    getContent,
    language,
  };
};

// Hook to fetch multiple pages at once
export const useMultiplePageContent = (pageKeys: string[]) => {
  const { language } = useLanguage();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['page-content-multiple', pageKeys],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .in('page_key', pageKeys);

      if (error) throw error;
      
      // Convert to a map for easy access
      const contentMap: Record<string, PageContent> = {};
      (data as PageContent[])?.forEach(item => {
        contentMap[item.page_key] = item;
      });
      
      return contentMap;
    },
    staleTime: 1000 * 60 * 5,
  });

  const getText = (pageKey: string, textKey: string, fallback: string = ''): string => {
    const page = data?.[pageKey];
    if (!page?.metadata?.texts) return fallback;
    
    const texts = page.metadata.texts;
    const langKey = `${textKey}_${language}`;
    
    if (texts[langKey]) return texts[langKey];
    if (texts[textKey]) return texts[textKey];
    
    return fallback;
  };

  const getImage = (pageKey: string, imageKey: string, fallback: string = ''): string => {
    const page = data?.[pageKey];
    if (!page?.metadata?.images) return fallback;
    return page.metadata.images[imageKey] || fallback;
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    getText,
    getImage,
    language,
  };
};
