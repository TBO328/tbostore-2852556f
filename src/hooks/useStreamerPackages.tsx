import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

import packageCustom from '@/assets/package-custom.png';
import packageTboPlus from '@/assets/package-tbo-plus.png';
import packageStandard from '@/assets/package-standard.png';

export interface StreamerPackage {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

// Default images mapping
const defaultImages: Record<string, string> = {
  'Custom Package': packageCustom,
  'الباقة المخصصة': packageCustom,
  'TBO+ Package': packageTboPlus,
  'باقة TBO+': packageTboPlus,
  'Standard Package': packageStandard,
  'الباقة العادية': packageStandard,
};

export const useStreamerPackages = () => {
  const [packages, setPackages] = useState<StreamerPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const previousPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('streamer_packages')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Map default images for packages without images
          const packagesWithImages = data.map(pkg => ({
            ...pkg,
            image_url: pkg.image_url || defaultImages[pkg.name_en] || defaultImages[pkg.name_ar] || null
          }));
          
          // Track previous prices for animation
          const newPrices: Record<string, number> = {};
          packagesWithImages.forEach(pkg => {
            newPrices[pkg.id] = pkg.price;
          });
          previousPrices.current = newPrices;
          
          setPackages(packagesWithImages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('streamer_packages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streamer_packages'
        },
        () => {
          fetchPackages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPreviousPrice = (packageId: string): number | undefined => {
    return previousPrices.current[packageId];
  };

  return { packages, loading, getPreviousPrice };
};
