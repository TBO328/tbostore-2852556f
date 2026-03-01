import React from 'react';

interface MaterialIconProps {
  name: string;
  size?: number;
  className?: string;
  variant?: 'outlined' | 'rounded';
}

const MaterialIcon: React.FC<MaterialIconProps> = ({ 
  name, 
  size = 24, 
  className = '', 
  variant = 'outlined' 
}) => {
  const fontFamily = variant === 'rounded' ? 'Material Symbols Rounded' : 'Material Symbols Outlined';
  
  return (
    <span
      className={`material-icon ${className}`}
      style={{
        fontFamily,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontSize: size,
        lineHeight: 1,
        letterSpacing: 'normal',
        textTransform: 'none',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
        direction: 'ltr',
        fontFeatureSettings: '"liga"',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
