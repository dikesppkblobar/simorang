import React from 'react';

interface LogoLombokBaratProps {
  className?: string;
  size?: number;
}

export const LogoLombokBarat: React.FC<LogoLombokBaratProps> = ({
  className = 'h-10 w-auto object-contain',
  size = 40,
}) => {
  return (
    <img
      src="/logo-lombok-barat.jpeg"
      alt="Lambang Kabupaten Lombok Barat"
      className={className}
      style={{ height: size, width: 'auto' }}
      referrerPolicy="no-referrer"
    />
  );
};
