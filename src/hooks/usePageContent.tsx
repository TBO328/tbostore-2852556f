import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

interface LocalizedText {
  en?: string;
  ar?: string;
}

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
  const queryClient = useQueryClient();

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
    staleTime: 1000 * 60 * 5,
  });

  // Realtime subscription for automatic updates
  useEffect(() => {
    const channel = supabase
      .channel(`page-content-${pageKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_content',
          filter: `page_key=eq.${pageKey}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageKey, refetch]);

  // Get text content with fallback - supports both formats
  const getText = (key: string, fallback: string = ''): string => {
    if (!data?.metadata) return fallback;
    const metadata = data.metadata as Record<string, unknown>;
    
    // Check if key exists directly in metadata as { en, ar } object
    const textObj = metadata[key] as LocalizedText | undefined;
    if (textObj && typeof textObj === 'object' && (textObj.en || textObj.ar)) {
      return textObj[language] || fallback;
    }
    
    // Fallback to texts sub-object
    if (metadata.texts) {
      const texts = metadata.texts as Record<string, string>;
      const langKey = `${key}_${language}`;
      if (texts[langKey]) return texts[langKey];
      if (texts[key]) return texts[key];
    }
    
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

export const useMultiplePageContent = (pageKeys: string[]) => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['page-content-multiple', pageKeys],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .in('page_key', pageKeys);

      if (error) throw error;
      
      const contentMap: Record<string, PageContent> = {};
      (data as PageContent[])?.forEach(item => {
        contentMap[item.page_key] = item;
      });
      
      return contentMap;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Realtime subscription for automatic updates
  useEffect(() => {
    const channel = supabase
      .channel('page-content-multiple')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_content',
        },
        (payload) => {
          const changedKey = (payload.new as PageContent)?.page_key;
          if (pageKeys.includes(changedKey)) {
            refetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageKeys, refetch]);

  const getText = (pageKey: string, textKey: string, fallback: string = ''): string => {
    const page = data?.[pageKey];
    if (!page?.metadata) return fallback;
    
    const metadata = page.metadata as Record<string, unknown>;
    
    // Check if key exists directly in metadata as { en, ar } object
    const textObj = metadata[textKey] as LocalizedText | undefined;
    if (textObj && typeof textObj === 'object' && (textObj.en || textObj.ar)) {
      return textObj[language] || fallback;
    }
    
    // Fallback to texts sub-object
    if (metadata.texts) {
      const texts = metadata.texts as Record<string, string>;
      const langKey = `${textKey}_${language}`;
      if (texts[langKey]) return texts[langKey];
      if (texts[textKey]) return texts[textKey];
    }
    
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
