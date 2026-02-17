import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Image as ImageIcon, Video } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const isRtl = language === 'ar';

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setItem(data);
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16 text-center">
          <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            {isRtl ? 'العمل غير موجود' : 'Work not found'}
          </p>
          <Button className="mt-6" onClick={() => navigate('/portfolio')}>
            {isRtl ? 'العودة للأعمال' : 'Back to Portfolio'}
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/portfolio')}
              className="gap-2"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {isRtl ? 'العودة للأعمال' : 'Back to Portfolio'}
            </Button>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="flex items-center gap-1.5 text-sm">
                {item.media_type === 'video'
                  ? <Video className="w-4 h-4" />
                  : <ImageIcon className="w-4 h-4" />
                }
                {item.media_type === 'video'
                  ? (isRtl ? 'فيديو' : 'Video')
                  : item.media_type === 'gif'
                    ? 'GIF'
                    : (isRtl ? 'صورة' : 'Image')
                }
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {isRtl ? item.title_ar : item.title_en}
            </h1>
            {(item.description_ar || item.description_en) && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                {isRtl ? item.description_ar : item.description_en}
              </p>
            )}
          </motion.div>

          {/* Thumbnail → full work layout */}
          <div className="space-y-8">

            {/* Thumbnail (if exists and different from main media) */}
            {item.thumbnail_url && item.thumbnail_url !== item.media_url && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  {isRtl ? 'الصورة المصغرة' : 'Thumbnail'}
                </h2>
                <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-card">
                  <img
                    src={item.thumbnail_url}
                    alt={`${isRtl ? item.title_ar : item.title_en} thumbnail`}
                    className="w-full object-contain max-h-80"
                  />
                </div>
              </motion.div>
            )}

            {/* Main Work */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                {item.media_type === 'video'
                  ? <Video className="w-5 h-5 text-primary" />
                  : <ImageIcon className="w-5 h-5 text-primary" />
                }
                {isRtl ? 'العمل الكامل' : 'Full Work'}
              </h2>
              <div className="rounded-2xl overflow-hidden border border-border shadow-xl bg-card">
                {item.media_type === 'video' ? (
                  <video
                    src={item.media_url}
                    className="w-full max-h-[70vh] object-contain"
                    controls
                    autoPlay={false}
                  />
                ) : (
                  <img
                    src={item.media_url}
                    alt={isRtl ? item.title_ar : item.title_en}
                    className="w-full object-contain max-h-[80vh]"
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PortfolioDetail;
