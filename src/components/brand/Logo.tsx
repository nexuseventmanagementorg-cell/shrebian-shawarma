import Image from 'next/image';
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-14 w-[5.25rem]',
  md: 'h-20 w-[7.5rem]',
  lg: 'h-28 w-[10.5rem]',
  xl: 'h-36 w-[13.5rem]'
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => (
  <span className={`relative inline-block shrink-0 ${sizeMap[size]} ${className}`}>
    <Image
      src="/images/brand/shrebian-logo-transparent.png"
      alt="Shrebian Shawarma — Fresh, Homemade, Delicious"
      fill
      priority
      sizes="216px"
      className="object-contain"
    />
  </span>
);
