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

  // Duplicate partners for infinite scroll effect
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-16 overflow-hidden relative bg-muted/30">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 mb-8">
        <motion.h3 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-2xl md:text-3xl font-bold text-center text-foreground"
        >
          {language === 'en' ? 'Our Trusted Partners' : 'شركاؤنا الموثوقون'}
        </motion.h3>
        <p className="text-muted-foreground text-center mt-2">
          {language === 'en' 
            ? 'Working with the best in the industry' 
            : 'نعمل مع الأفضل في المجال'
          }
        </p>
      </div>
      
      {/* Infinite scroll container */}
      <div className="relative">
        <motion.div 
          className="flex gap-12 items-center"
          animate={{
            x: [0, -50 * partners.length * 12],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: partners.length * 5,
              ease: "linear",
            },
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <motion.div
              key={`${partner.id}-${index}`}
              whileHover={{ 
                scale: 1.15,
                transition: { type: 'spring', stiffness: 300 }
              }}
              className="relative group shrink-0"
            >
              {/* Neon glow effect on hover */}
              <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border/50 group-hover:border-primary/60 transition-all duration-300 shadow-lg group-hover:shadow-primary/20">
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="h-14 md:h-16 w-auto max-w-[140px] md:max-w-[180px] object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersStrip;
