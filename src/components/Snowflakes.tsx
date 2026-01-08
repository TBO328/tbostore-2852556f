import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface Snowflake {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  velocityX: number;
  velocityY: number;
}

const Snowflakes: React.FC = () => {
  const { winterMode } = useTheme();
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!winterMode) {
      setSnowflakes([]);
      return;
    }

    const flakes: Snowflake[] = [];
    for (let i = 0; i < 40; i++) {
      flakes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * -100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        size: 10 + Math.random() * 14,
        opacity: 0.4 + Math.random() * 0.4,
        velocityX: 0,
        velocityY: 0,
      });
    }
    setSnowflakes(flakes);
  }, [winterMode]);

  // Track mouse position
  useEffect(() => {
    if (!winterMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [winterMode]);

  // Handle cursor interaction with snowflakes
  const handleSnowflakeInteraction = useCallback((flakeId: number, flakeRef: HTMLDivElement | null) => {
    if (!flakeRef || mousePos.x === -1000) return;

    const rect = flakeRef.getBoundingClientRect();
    const flakeCenterX = rect.left + rect.width / 2;
    const flakeCenterY = rect.top + rect.height / 2;

    const dx = flakeCenterX - mousePos.x;
    const dy = flakeCenterY - mousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If cursor is close to the snowflake, push it away
    if (distance < 80) {
      const force = (80 - distance) / 80;
      const angle = Math.atan2(dy, dx);
      const pushX = Math.cos(angle) * force * 30;
      const pushY = Math.sin(angle) * force * 30;

      flakeRef.style.transform = `translate(${pushX}px, ${pushY}px)`;
      flakeRef.style.transition = 'transform 0.2s ease-out';
    } else {
      flakeRef.style.transform = '';
      flakeRef.style.transition = 'transform 0.5s ease-out';
    }
  }, [mousePos]);

  if (!winterMode || snowflakes.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          ref={(ref) => {
            if (ref) {
              // Check interaction on each frame
              const checkInteraction = () => {
                handleSnowflakeInteraction(flake.id, ref);
                requestAnimationFrame(checkInteraction);
              };
              // Only start if not already running
              if (!ref.dataset.animating) {
                ref.dataset.animating = 'true';
                checkInteraction();
              }
            }
          }}
          className="absolute select-none"
          style={{
            left: `${flake.x}%`,
            top: -30,
            fontSize: flake.size,
            opacity: flake.opacity,
            color: 'white',
            textShadow: '0 0 5px rgba(255,255,255,0.5)',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.sin(flake.id * 0.5) * 40, Math.sin(flake.id * 0.5 + 2) * -40, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: 'linear',
            x: {
              duration: flake.duration / 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
};

export default Snowflakes;
