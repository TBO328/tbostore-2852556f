import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const GlobalCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const { customCursor } = useTheme();

  useEffect(() => {
    if (!customCursor) {
      // Remove custom cursor styles if disabled
      document.body.style.cursor = '';
      const existingStyle = document.getElementById('global-cursor-style');
      if (existingStyle) {
        existingStyle.remove();
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Add global style to hide cursor on all elements
    const style = document.createElement('style');
    style.id = 'global-cursor-style';
    style.textContent = '* { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = '';
      const existingStyle = document.getElementById('global-cursor-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [customCursor]);

  if (!customCursor || !isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100000]"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer circle */}
      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center bg-transparent transition-transform duration-100">
        {/* Inner dot */}
        <div className="w-1 h-1 rounded-full bg-primary" />
      </div>
    </div>
  );
};

export default GlobalCursor;
