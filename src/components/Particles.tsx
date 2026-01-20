import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

const COLORS = ['#13414c', '#6db1c3'];

const Particles: React.FC = () => {
  const { particlesMode } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [pageHeight, setPageHeight] = useState(0);

  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const count = Math.min(50, Math.floor((width * height) / 30000));
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    if (!particlesMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      setPageHeight(docHeight);
      canvas.width = window.innerWidth;
      canvas.height = docHeight;
      particlesRef.current = createParticles(canvas.width, canvas.height);
      drawParticles();
    };

    const drawParticles = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineOpacity = (1 - dist / 150) * 0.2;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = lineOpacity;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    };

    // Initial draw
    setTimeout(updateSize, 100);
    
    window.addEventListener('resize', updateSize);
    
    // Observe DOM changes for dynamic content
    const observer = new MutationObserver(() => {
      setTimeout(updateSize, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [particlesMode, createParticles]);

  if (!particlesMode) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        minHeight: pageHeight || '100vh',
      }}
    />
  );
};

export default Particles;
