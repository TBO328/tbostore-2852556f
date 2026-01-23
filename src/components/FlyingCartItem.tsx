import React from 'react';
import { motion } from 'framer-motion';

interface FlyingCartItemProps {
  image: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}

const FlyingCartItem: React.FC<FlyingCartItemProps> = ({ image, startPosition, endPosition }) => {
  // Calculate arc path for more dynamic movement
  const midX = (startPosition.x + endPosition.x) / 2;
  const midY = Math.min(startPosition.y, endPosition.y) - 100; // Arc upward

  return (
    <>
      {/* Particle trail effect */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed z-[99] pointer-events-none"
          initial={{
            x: startPosition.x,
            y: startPosition.y,
            scale: 0.3,
            opacity: 0.8,
          }}
          animate={{
            x: [startPosition.x, midX, endPosition.x],
            y: [startPosition.y, midY, endPosition.y],
            scale: [0.3, 0.2, 0],
            opacity: [0.8, 0.4, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: i * 0.03,
          }}
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
              boxShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5)',
            }}
          />
        </motion.div>
      ))}

      {/* Main flying item with 3D effect */}
      <motion.div
        className="fixed z-[100] pointer-events-none"
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
        initial={{
          x: startPosition.x - 40, // Center the item
          y: startPosition.y - 40,
          scale: 1,
          opacity: 1,
        }}
        animate={{
          x: [startPosition.x - 40, midX - 30, endPosition.x],
          y: [startPosition.y - 40, midY - 30, endPosition.y],
          scale: [1, 1.2, 0.1],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {/* 3D rotating container */}
        <motion.div
          className="relative"
          initial={{
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
          }}
          animate={{
            rotateX: [0, -15, 10, 0],
            rotateY: [0, 360, 720],
            rotateZ: [0, -10, 5, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Glow ring effect */}
          <motion.div
            className="absolute inset-[-8px] rounded-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1.1, 1.2, 1.5],
            }}
            transition={{ duration: 0.8 }}
            style={{
              background: 'transparent',
              border: '2px solid hsl(var(--primary))',
              boxShadow: `
                0 0 20px hsl(var(--primary) / 0.6),
                0 0 40px hsl(var(--primary) / 0.4),
                inset 0 0 20px hsl(var(--primary) / 0.2)
              `,
            }}
          />

          {/* Secondary glow ring */}
          <motion.div
            className="absolute inset-[-16px] rounded-3xl"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ 
              opacity: [0, 0.5, 0.5, 0],
              scale: [0.6, 1.2, 1.4, 2],
            }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              background: 'transparent',
              border: '1px solid hsl(var(--primary) / 0.5)',
              boxShadow: '0 0 30px hsl(var(--primary) / 0.3)',
            }}
          />

          {/* Product image with 3D depth */}
          <motion.div
            className="relative"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'translateZ(20px)',
            }}
          >
            <img
              src={image}
              alt="Flying item"
              className="w-20 h-20 object-cover rounded-xl"
              style={{
                boxShadow: `
                  0 10px 30px -5px hsl(var(--primary) / 0.4),
                  0 0 20px hsl(var(--primary) / 0.3),
                  inset 0 0 0 1px hsl(var(--primary) / 0.2)
                `,
              }}
            />
            
            {/* Shine overlay */}
            <motion.div
              className="absolute inset-0 rounded-xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, transparent 30%, hsl(var(--primary) / 0.4) 50%, transparent 70%)',
                }}
              />
            </motion.div>
          </motion.div>

          {/* Back face reflection (3D depth) */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              transform: 'translateZ(-10px)',
              background: 'hsl(var(--primary) / 0.1)',
              filter: 'blur(5px)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Impact burst at destination */}
      <motion.div
        className="fixed z-[98] pointer-events-none"
        initial={{
          x: endPosition.x - 30,
          y: endPosition.y - 30,
          scale: 0,
          opacity: 0,
        }}
        animate={{
          scale: [0, 1.5, 2],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 0.4,
          delay: 0.6,
          ease: "easeOut",
        }}
      >
        <div 
          className="w-16 h-16 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            boxShadow: '0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary) / 0.5)',
          }}
        />
      </motion.div>

      {/* Sparkles at destination */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="fixed z-[97] pointer-events-none"
          initial={{
            x: endPosition.x,
            y: endPosition.y,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: endPosition.x + Math.cos((i / 6) * Math.PI * 2) * 40,
            y: endPosition.y + Math.sin((i / 6) * Math.PI * 2) * 40,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.5,
            delay: 0.65,
            ease: "easeOut",
          }}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 8px hsl(var(--primary))',
            }}
          />
        </motion.div>
      ))}
    </>
  );
};

export default FlyingCartItem;
