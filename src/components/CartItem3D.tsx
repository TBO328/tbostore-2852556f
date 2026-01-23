import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CartItemProps {
  item: {
    id: string | number;
    name: string;
    nameAr: string;
    price: number;
    quantity: number;
    image: string;
  };
  index: number;
  onUpdateQuantity: (id: string | number, quantity: number) => void;
  onRemove: (id: string | number) => void;
}

const CartItem3D: React.FC<CartItemProps> = ({ item, index, onUpdateQuantity, onRemove }) => {
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animations
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  // Glare effect position
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });

  // Dynamic shadow
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });

  // Pre-compute transforms at top level
  const dynamicShadow = useTransform(
    [shadowX, shadowY],
    ([x, y]) => `${x}px ${y}px 30px -5px hsl(var(--primary) / 0.2), 0 10px 40px -10px hsl(var(--primary) / 0.15)`
  );
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, hsl(var(--primary) / 0.1), transparent 50%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        perspective: '1000px',
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
        boxShadow: isHovered ? dynamicShadow : '0 4px 20px -5px hsl(var(--primary) / 0.05)',
      }}
      className="bg-gradient-card rounded-xl border border-border p-4 flex gap-4 transition-all duration-300"
    >
      {/* Glare Effect */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: glareBackground,
        }}
      />

      {/* Product Image with 3D depth */}
      <Link to={`/product/${item.id}`} className="shrink-0 relative">
        <motion.div
          className="relative overflow-hidden rounded-lg"
          style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)' }}
        >
          <motion.img
            src={item.image}
            alt={language === 'ar' ? item.nameAr : item.name}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg transition-transform duration-300"
            whileHover={{ scale: 1.05 }}
          />
          {/* Image glow on hover */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg pointer-events-none"
            />
          )}
        </motion.div>
      </Link>

      {/* Product Details with 3D depth */}
      <motion.div 
        className="flex-1 flex flex-col justify-between relative z-20"
        style={{ transform: isHovered ? 'translateZ(15px)' : 'translateZ(0)' }}
      >
        <div>
          <Link to={`/product/${item.id}`}>
            <h3 className="font-display font-semibold text-foreground hover:text-primary transition-colors">
              {language === 'ar' ? item.nameAr : item.name}
            </h3>
          </Link>
          <p className="text-primary font-bold mt-1">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Quantity & Actions */}
        <div className="flex items-center justify-between mt-4">
          {/* Quantity Controls */}
          <motion.div 
            className="flex items-center gap-2 bg-muted rounded-lg p-1"
            style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0)' }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-bold text-foreground">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Item Total & Remove */}
          <motion.div 
            className="flex items-center gap-4"
            style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0)' }}
          >
            <span className="font-display font-bold text-foreground">
              {formatPrice(item.price * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CartItem3D;