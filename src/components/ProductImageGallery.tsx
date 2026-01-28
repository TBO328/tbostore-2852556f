import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  discount,
  isNew,
  isBestSeller,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Ensure we have at least one image
  const galleryImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-card border border-border group">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {isNew && (
            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-neon-cyan">
              NEW
            </span>
          )}
          {isBestSeller && (
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full shadow-neon-magenta">
              BEST
            </span>
          )}
          {discount && discount > 0 && (
            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}

        {/* Zoom Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>

        {/* Image Counter */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 left-4 z-20 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-sm text-foreground">
            {currentIndex + 1} / {galleryImages.length}
          </div>
        )}

        {/* Main Image with Animation */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={galleryImages[currentIndex]}
            alt={`${productName} - ${currentIndex + 1}`}
            className="w-full aspect-square object-cover cursor-zoom-in"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsZoomed(true)}
          />
        </AnimatePresence>

        {/* Neon Glow Effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center bottom, hsl(var(--neon-cyan) / 0.15), transparent 60%)',
        }} />
      </div>

      {/* Thumbnail Strip */}
      {galleryImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {galleryImages.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => goToIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300",
                index === currentIndex
                  ? "border-primary shadow-neon-cyan"
                  : "border-border hover:border-primary/50"
              )}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.button
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>

            {/* Navigation in Fullscreen */}
            {galleryImages.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </motion.button>
              </>
            )}

            <motion.img
              key={`zoom-${currentIndex}`}
              src={galleryImages[currentIndex]}
              alt={productName}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Thumbnail Strip in Fullscreen */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goToIndex(index); }}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      index === currentIndex
                        ? "bg-primary w-8"
                        : "bg-muted hover:bg-primary/50"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductImageGallery;
