import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
}

const PartnersStrip = () => {
  const { language } = useLanguage();

  const { data: partners = [] } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Partner[];
    }
  });

  if (partners.length === 0) return null;

  return (
    <section className="py-10 overflow-hidden relative">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div className="mb-6">
        <h3 className="font-display text-2xl md:text-3xl font-bold text-center text-foreground">
          {language === 'en' ? 'Our Partners' : 'شركاؤنا'}
        </h3>
      </div>
      
      <div className="flex overflow-hidden">
        <div 
          className="flex items-center gap-12 animate-marquee"
          style={{
            animationDirection: language === 'ar' ? 'reverse' : 'normal',
            animationDuration: `${partners.length * 8}s`
          }}
        >
          {/* First set */}
          {partners.map((partner) => (
            <div key={`first-${partner.id}`} className="flex items-center gap-12 shrink-0">
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="h-20 max-w-[200px] object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              />
              <span className="text-4xl text-muted-foreground/30 font-light select-none">—</span>
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {partners.map((partner) => (
            <div key={`second-${partner.id}`} className="flex items-center gap-12 shrink-0">
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="h-20 max-w-[200px] object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              />
              <span className="text-4xl text-muted-foreground/30 font-light select-none">—</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;
