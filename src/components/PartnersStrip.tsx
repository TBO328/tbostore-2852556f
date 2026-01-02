import { motion } from 'framer-motion';
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

  // Duplicate partners array for seamless loop
  const duplicatedPartners = [...partners, ...partners, ...partners];

  return (
    <section className="py-12 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h3 className="font-display text-2xl md:text-3xl font-bold text-center text-foreground">
          {language === 'en' ? 'Our Partners' : 'شركاؤنا'}
        </h3>
      </div>
      
      <div className="relative">
        <motion.div
          className="flex items-center gap-8"
          animate={{
            x: language === 'ar' ? ['0%', '33.33%'] : ['-33.33%', '0%']
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: partners.length * 5,
              ease: 'linear'
            }
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div key={`${partner.id}-${index}`} className="flex items-center gap-8 shrink-0">
              <div className="flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl p-4 min-w-[150px] h-[80px] border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="max-h-12 max-w-[120px] object-contain"
                />
              </div>
              {index < duplicatedPartners.length - 1 && (
                <span className="text-3xl text-muted-foreground/50 font-light">—</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersStrip;
