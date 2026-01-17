import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  winterMode: boolean;
  setWinterMode: (enabled: boolean) => void;
  customCursor: boolean;
  setCustomCursor: (enabled: boolean) => void;
  particlesMode: boolean;
  setParticlesMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  const [winterMode, setWinterMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('winterMode');
    return saved ? saved === 'true' : true;
  });

  const [customCursor, setCustomCursor] = useState<boolean>(() => {
    const saved = localStorage.getItem('customCursor');
    return saved ? saved === 'true' : true;
  });

  const [particlesMode, setParticlesMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('particlesMode');
    return saved ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('winterMode', String(winterMode));
  }, [winterMode]);

  useEffect(() => {
    localStorage.setItem('customCursor', String(customCursor));
  }, [customCursor]);

  useEffect(() => {
    localStorage.setItem('particlesMode', String(particlesMode));
  }, [particlesMode]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, toggleTheme, 
      winterMode, setWinterMode, 
      customCursor, setCustomCursor,
      particlesMode, setParticlesMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
