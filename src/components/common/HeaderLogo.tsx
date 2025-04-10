import React from 'react';
import { Link } from 'react-router-dom';
import AppLogo from './AppLogo';

interface HeaderLogoProps {
  className?: string;
}

const HeaderLogo: React.FC<HeaderLogoProps> = ({ className = '' }) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <AppLogo size="medium" />
    </Link>
  );
};

export default HeaderLogo;
