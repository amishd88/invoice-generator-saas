import React from 'react';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'medium', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-20 w-20'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/favicon.svg" 
        alt="Invoice Generator" 
        className={sizeClasses[size]}
      />
      {showText && (
        <span className={`font-semibold text-primary-700 ml-2 ${size === 'large' ? 'text-2xl' : 'text-lg'}`}>
          Invoice Generator
        </span>
      )}
    </div>
  );
};

export default AppLogo;
