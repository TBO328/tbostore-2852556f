import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Snowflake {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

const Snowflakes: React.FC = () => {
  const { winterMode } = useTheme();
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!winterMode) {
      setSnowflakes([]);
      return;
    }

    const flakes: Snowflake[] = [];
    for (let i = 0; i < 12; i++) {
      flakes.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 8,
        size: 12 + Math.random() * 10,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }
    setSnowflakes(flakes);
  }, [winterMode]);

  // Handle mouse interaction with CSS transforms only
  useEffect(() => {
    if (!winterMode || !containerRef.current) return;

    let mouseX = -1000;
    let mouseY = -1000;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updateSnowflakes = () => {
      if (!containerRef.current) return;
      
      const flakeElements = containerRef.current.querySelectorAll('.snowflake');
      flakeElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const flakeCenterX = rect.left + rect.width / 2;
        const flakeCenterY = rect.top + rect.height / 2;

        const dx = flakeCenterX - mouseX;
        const dy = flakeCenterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 60) {
          const force = (60 - distance) / 60;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * 25;
          const pushY = Math.sin(angle) * force * 25;
          (el as HTMLElement).style.setProperty('--push-x', `${pushX}px`);
          (el as HTMLElement).style.setProperty('--push-y', `${pushY}px`);
        } else {
          (el as HTMLElement).style.setProperty('--push-x', '0px');
          (el as HTMLElement).style.setProperty('--push-y', '0px');
        }
      });

      rafId = requestAnimationFrame(updateSnowflakes);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateSnowflakes);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [winterMode, snowflakes.length]);

  if (!winterMode || snowflakes.length === 0) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-30px) translateX(var(--push-x, 0px)) rotate(0deg);
          }
          25% {
            transform: translateY(27.5vh) translateX(calc(20px + var(--push-x, 0px))) rotate(90deg);
          }
          50% {
            transform: translateY(55vh) translateX(calc(-20px + var(--push-x, 0px))) rotate(180deg);
          }
          75% {
            transform: translateY(82.5vh) translateX(calc(10px + var(--push-x, 0px))) rotate(270deg);
          }
          100% {
            transform: translateY(110vh) translateX(var(--push-x, 0px)) rotate(360deg);
          }
        }
        .snowflake {
          --push-x: 0px;
          --push-y: 0px;
          will-change: transform;
          animation: snowfall var(--duration) linear infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake absolute select-none"
          style={{
            left: `${flake.x}%`,
            top: -30,
            fontSize: flake.size,
            opacity: flake.opacity,
            color: 'white',
            textShadow: '0 0 5px rgba(255,255,255,0.5)',
            ['--duration' as string]: `${flake.duration}s`,
            ['--delay' as string]: `${flake.delay}s`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default Snowflakes;