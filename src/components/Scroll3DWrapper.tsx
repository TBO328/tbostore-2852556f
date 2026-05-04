import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
}

/**
 * Wraps children with a scroll-driven 3D tilt + depth effect.
 * Uses framer-motion's useScroll to compute progress relative to the element.
 */
const Scroll3DWrapper: React.FC<Props> = ({ children, intensity = 1, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.5 });
  const rotateX = useTransform(smooth, [0, 0.5, 1], [12 * intensity, 0, -12 * intensity]);
  const scale = useTransform(smooth, [0, 0.5, 1], [0.92, 1, 0.94]);
  const y = useTransform(smooth, [0, 0.5, 1], [60 * intensity, 0, -40 * intensity]);
  const opacity = useTransform(smooth, [0, 0.15, 0.85, 1], [0.5, 1, 1, 0.6]);

  return (
    <div ref={ref} className={className} style={{ perspective: 1400 }}>
      <motion.div
        style={{
          rotateX,
          scale,
          y,
          opacity,
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Scroll3DWrapper;
