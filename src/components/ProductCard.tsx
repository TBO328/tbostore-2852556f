import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import PriceDisplay from '@/components/PriceDisplay';
import ProductPointsBadge from '@/components/ProductPointsBadge';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { language, t } = useLanguage();
  const { addToCart, triggerFlyAnimation, cartIconRef } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });
  const glareX = useTransform(mouseX, [-0.5, 0.5], [100, 0]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [100, 0]);
  
  // Dynamic shadow that follows tilt
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), { stiffness: 300, damping: 30 });
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), { stiffness: 300, damping: 30 });
  
  // Pre-compute the dynamic shadow transform (must be at top level, not conditional)
  const dynamicShadow = useTransform(
    [shadowX, shadowY],
    ([x, y]) => `${x}px ${y}px 30px -5px hsl(var(--primary) / 0.3), 0 10px 40px -10px hsl(var(--primary) / 0.2)`
  );
  
  // Pre-compute the glare background
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, hsl(var(--primary) / 0.15), transparent 50%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const isLiked = isFavorite(String(product.id));

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    if (imageRef.current && cartIconRef.current) {
      const imageRect = imageRef.current.getBoundingClientRect();
      triggerFlyAnimation(
        { x: imageRect.left + imageRect.width / 2, y: imageRect.top + imageRect.height / 2 },
        product.image
      );
    }

    addToCart({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
    });
    
    toast.success(t('addedToCart'));
    
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(String(product.id));
  };

  return (
    <Link to={`/product/${product.id}`} className="block" style={{ perspective: '1000px' }}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered ? dynamicShadow : '0 4px 20px -5px hsl(var(--primary) / 0.1)',
        }}
        whileHover={{ y: -8, z: 50 }}
        className="group relative bg-card rounded-2xl overflow-hidden border border-border transition-all duration-500 hover:border-primary/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 3D Glare Effect */}
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: glareBackground,
          }}
        />
        {/* Animated Background Gradient */}
        <motion.div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--secondary) / 0.05))',
          }}
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <AnimatePresence>
            {product.isNew && (
              <motion.span 
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                className="px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold rounded-full shadow-neon-cyan flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                NEW
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {product.isBestSeller && (
              <motion.span 
                initial={{ scale: 0, rotate: 12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 }}
                className="px-3 py-1.5 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground text-xs font-bold rounded-full shadow-neon-magenta flex items-center gap-1"
              >
                <Star className="w-3 h-3 fill-current" />
                BEST
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {discount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="px-3 py-1.5 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground text-xs font-bold rounded-full"
              >
                -{discount}%
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3, delay: 0 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
              isLiked 
                ? 'bg-destructive/90 text-white shadow-lg shadow-destructive/30' 
                : 'bg-background/80 text-muted-foreground hover:bg-destructive/90 hover:text-white'
            }`}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.div>
          </motion.button>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Link 
              to={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-11 h-11 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Image Container */}
        <div className="relative h-56 sm:h-64 overflow-hidden">
          {/* Gradient Overlay */}
          <motion.div 
            className="absolute inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'linear-gradient(to top, hsl(var(--background) / 0.8), transparent 50%)',
            }}
          />
          
          {/* Product Image */}
          <motion.img
            ref={imageRef}
            src={product.image}
            alt={language === 'ar' ? product.nameAr : product.name}
            className="w-full h-full object-cover"
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              filter: isHovered ? 'brightness(1.05)' : 'brightness(1)'
            }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          
          {/* Shimmer Effect on Hover */}
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ 
              x: isHovered ? '100%' : '-100%',
              opacity: isHovered ? [0, 0.3, 0] : 0
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2), transparent)',
            }}
          />

          {/* Bottom Glow Effect */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-32 z-5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'radial-gradient(ellipse at center bottom, hsl(var(--primary) / 0.25), transparent 70%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="p-5 relative z-10">
          {/* Category */}
          <motion.span 
            className="inline-block text-xs text-primary font-semibold uppercase tracking-widest mb-2"
            animate={{ opacity: isHovered ? 1 : 0.8 }}
          >
            {language === 'ar' ? product.categoryAr : product.category}
          </motion.span>

          {/* Product Name */}
          <h3 className="font-display text-lg font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {language === 'ar' ? product.nameAr : product.name}
          </h3>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${star <= Math.floor(product.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({(product.rating || 0).toFixed(1)}) • {product.reviewsCount || 0}
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            <PriceDisplay 
              price={product.price} 
              originalPrice={product.originalPrice} 
              size="lg" 
            />
          </div>

          {/* Points Badge */}
          <div className="mb-4">
            <ProductPointsBadge price={product.price} />
          </div>

          {/* Add to Cart Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="neon" 
              className="w-full group/btn overflow-hidden relative" 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <motion.span
                className="flex items-center justify-center gap-2"
                animate={isAddingToCart ? { y: -30, opacity: 0 } : { y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ShoppingCart className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                {t('addToCart')}
              </motion.span>
              <motion.span
                className="absolute inset-0 flex items-center justify-center"
                initial={{ y: 30, opacity: 0 }}
                animate={isAddingToCart ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ {t('addedToCart')}
              </motion.span>
            </Button>
          </motion.div>
        </div>

        {/* Corner Accent */}
        <div className="absolute bottom-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at bottom right, hsl(var(--primary) / 0.15), transparent 70%)',
            }}
          />
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
