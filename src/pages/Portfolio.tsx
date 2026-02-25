import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, FileImage, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';

interface PortfolioItem {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  display_order: number;
}

const Portfolio: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.media_type === filter);

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'gif':
        return <FileImage className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <AnimatedSection>
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                {language === 'ar' ? 'أعمالنا' : 'Our Works'}
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {language === 'ar'
                  ? 'استعرض مجموعة من أفضل أعمالنا وتصاميمنا المميزة'
                  : 'Browse through our collection of best works and distinguished designs'
                }
              </p>
            </div>
          </AnimatedSection>

          {/* Filter Tabs */}
          <AnimatedSection delay={0.1}>
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {[
                { value: 'all', label: language === 'ar' ? 'الكل' : 'All' },
                { value: 'image', label: language === 'ar' ? 'صور' : 'Images' },
                { value: 'video', label: language === 'ar' ? 'فيديوهات' : 'Videos' },
                { value: 'gif', label: 'GIFs' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-full transition-all ${
                    filter === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </AnimatedSection>

          {/* Loading */}
          {filteredItems.length === 0 && !loading ? (
            <div className="text-center py-16">
              <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                {language === 'ar' ? 'لا توجد أعمال في هذه الفئة' : 'No works in this category'}
              </p>
            </div>
          ) : (
            /* Gallery Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <AnimatedSection key={item.id} delay={index * 0.05}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -8 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/portfolio/${item.id}`)}
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                        <AspectRatio ratio={16 / 9}>
                          {/* Show thumbnail if available, otherwise show media */}
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                              alt={language === 'ar' ? item.title_ar : item.title_en}
                            />
                          ) : item.media_type === 'video' ? (
                            <video
                              src={item.media_url}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                          ) : (
                            <img
                              src={item.media_url}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                              alt={language === 'ar' ? item.title_ar : item.title_en}
                            />
                          )}
                        </AspectRatio>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <Badge variant="secondary" className="mb-2 flex items-center gap-1 w-fit">
                              {getMediaTypeIcon(item.media_type)}
                              {item.media_type}
                            </Badge>
                            <h3 className="text-white font-semibold text-lg">
                              {language === 'ar' ? item.title_ar : item.title_en}
                            </h3>
                            {(item.description_en || item.description_ar) && (
                              <p className="text-white/80 text-sm line-clamp-2 mt-1">
                                {language === 'ar' ? item.description_ar : item.description_en}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Media Type Badge */}
                        <Badge
                          className="absolute top-3 right-3 flex items-center gap-1"
                          variant="secondary"
                        >
                          {getMediaTypeIcon(item.media_type)}
                        </Badge>
                      </div>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Portfolio;
