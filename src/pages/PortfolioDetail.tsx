import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Image as ImageIcon, Video, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MediaFile {
  url: string;
  type: 'image' | 'video' | 'gif';
}

interface PortfolioItem {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  media_files: MediaFile[];
  display_order: number;
}

const MediaDisplay: React.FC<{ file: MediaFile; title: string; className?: string }> = ({ file, title, className = '' }) => {
  if (file.type === 'video') {
    return (
      <video
        src={file.url}
        className={`w-full object-contain ${className}`}
        controls
      />
    );
  }
  return (
    <img
      src={file.url}
      alt={title}
      className={`w-full object-contain ${className}`}
    />
  );
};

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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
        const rawFiles = Array.isArray(data.media_files) ? data.media_files : [];
        setItem({
          ...data,
          media_files: rawFiles.map((f: unknown) => f as MediaFile),
        });
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16" />
        <Footer />
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

  // Build all media files: main media + extra files
  const allFiles: MediaFile[] = [
    { url: item.media_url, type: item.media_type as MediaFile['type'] },
    ...item.media_files,
  ].filter(f => f.url);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevFile = () => setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : allFiles.length - 1));
  const nextFile = () => setLightboxIndex(i => (i !== null && i < allFiles.length - 1 ? i + 1 : 0));

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
            <Button variant="ghost" onClick={() => navigate('/portfolio')} className="gap-2">
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {isRtl ? 'العودة للأعمال' : 'Back to Portfolio'}
            </Button>
          </motion.div>

          {/* Title & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="flex items-center gap-1.5 text-sm">
                {item.media_type === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                {allFiles.length} {isRtl ? 'ملف' : 'file(s)'}
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

          {/* Files Grid */}
          {allFiles.length === 1 ? (
            /* Single file — full width */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl overflow-hidden border border-border shadow-xl bg-card cursor-zoom-in"
              onClick={() => openLightbox(0)}
            >
              <MediaDisplay file={allFiles[0]} title={isRtl ? item.title_ar : item.title_en} className="max-h-[80vh]" />
            </motion.div>
          ) : (
            /* Multiple files — masonry-like grid */
            <div className="columns-1 sm:columns-2 gap-4 space-y-4">
              {allFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.07 }}
                  className="break-inside-avoid rounded-2xl overflow-hidden border border-border shadow-lg bg-card cursor-zoom-in group relative"
                  onClick={() => openLightbox(index)}
                >
                  <MediaDisplay file={file} title={`${isRtl ? item.title_ar : item.title_en} — ${index + 1}`} className="max-h-[600px]" />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
                      {isRtl ? 'عرض' : 'View'}
                    </span>
                  </div>
                  {/* Index badge */}
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1} / {allFiles.length}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-white/10 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {allFiles.length}
            </div>

            {/* Prev */}
            {allFiles.length > 1 && (
              <button
                className="absolute left-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
                onClick={(e) => { e.stopPropagation(); prevFile(); }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Media */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="max-w-5xl max-h-[90vh] w-full px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <MediaDisplay
                file={allFiles[lightboxIndex]}
                title={isRtl ? item.title_ar : item.title_en}
                className="max-h-[85vh] rounded-xl shadow-2xl"
              />
            </motion.div>

            {/* Next */}
            {allFiles.length > 1 && (
              <button
                className="absolute right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
                onClick={(e) => { e.stopPropagation(); nextFile(); }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Thumbnail strip */}
            {allFiles.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-xl overflow-x-auto px-4">
                {allFiles.map((f, i) => (
                  <div
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      i === lightboxIndex ? 'border-primary scale-110' : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {f.type === 'video' ? (
                      <video src={f.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={f.url} className="w-full h-full object-cover" alt="" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default PortfolioDetail;
