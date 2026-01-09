import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SeasonalTheme = 'default' | 'ramadan' | 'national_day' | 'foundation_day';

interface SeasonalThemeContextType {
  activeTheme: SeasonalTheme;
  setActiveTheme: (theme: SeasonalTheme) => void;
  themeStyles: ThemeStyles;
}

interface ThemeStyles {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundOverlay?: string;
  specialEffects?: boolean;
}

const themeConfigs: Record<SeasonalTheme, ThemeStyles> = {
  default: {},
  ramadan: {
    primaryColor: '48 96% 50%', // Gold
    secondaryColor: '270 50% 40%', // Purple
    accentColor: '45 100% 50%', // Bright gold
    backgroundOverlay: 'linear-gradient(135deg, rgba(128, 0, 128, 0.1), rgba(255, 215, 0, 0.1))',
    specialEffects: true,
  },
  national_day: {
    primaryColor: '120 50% 35%', // Green
    secondaryColor: '0 0% 100%', // White
    accentColor: '120 60% 40%', // Bright green
    backgroundOverlay: 'linear-gradient(135deg, rgba(0, 100, 0, 0.1), rgba(255, 255, 255, 0.05))',
    specialEffects: true,
  },
  foundation_day: {
    primaryColor: '120 50% 30%', // Dark green
    secondaryColor: '48 90% 45%', // Gold/Brown
    accentColor: '35 80% 50%', // Amber
    backgroundOverlay: 'linear-gradient(135deg, rgba(0, 80, 0, 0.1), rgba(139, 69, 19, 0.1))',
    specialEffects: true,
  },
};

const SeasonalThemeContext = createContext<SeasonalThemeContextType | undefined>(undefined);

export const SeasonalThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<SeasonalTheme>(() => {
    const saved = localStorage.getItem('seasonalTheme');
    return (saved as SeasonalTheme) || 'default';
  });

  const themeStyles = themeConfigs[activeTheme];

  useEffect(() => {
    localStorage.setItem('seasonalTheme', activeTheme);
    
    // Apply theme CSS variables
    const root = document.documentElement;
    
    if (activeTheme !== 'default' && themeStyles.primaryColor) {
      root.style.setProperty('--seasonal-primary', themeStyles.primaryColor);
      root.style.setProperty('--seasonal-secondary', themeStyles.secondaryColor || '');
      root.style.setProperty('--seasonal-accent', themeStyles.accentColor || '');
      root.classList.add('seasonal-theme-active', `theme-${activeTheme}`);
    } else {
      root.style.removeProperty('--seasonal-primary');
      root.style.removeProperty('--seasonal-secondary');
      root.style.removeProperty('--seasonal-accent');
      root.classList.remove('seasonal-theme-active', 'theme-ramadan', 'theme-national_day', 'theme-foundation_day');
    }
  }, [activeTheme, themeStyles]);

  return (
    <SeasonalThemeContext.Provider value={{ activeTheme, setActiveTheme, themeStyles }}>
      {children}
    </SeasonalThemeContext.Provider>
  );
};

export const useSeasonalTheme = (): SeasonalThemeContextType => {
  const context = useContext(SeasonalThemeContext);
  if (!context) {
    throw new Error('useSeasonalTheme must be used within a SeasonalThemeProvider');
  }
  return context;
};
