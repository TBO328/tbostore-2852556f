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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section className="py-12 overflow-hidden relative">
      <div className="container mx-auto px-4">
        <motion.h3 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-2xl md:text-3xl font-bold text-center text-foreground mb-10"
        >
          {language === 'en' ? 'Our Partners' : 'شركاؤنا'}
        </motion.h3>
        
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.1,
                transition: { type: 'spring', stiffness: 300 }
              }}
              className="relative group"
            >
              {/* Neon glow effect on hover */}
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/30 group-hover:border-primary/50 transition-all duration-300">
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="h-16 md:h-20 max-w-[160px] md:max-w-[200px] object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              
              {/* Separator dash - only show between items on larger screens */}
              {index < partners.length - 1 && (
                <span className="hidden lg:block absolute -right-6 md:-right-8 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground/30 font-light select-none">
                  —
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersStrip;
