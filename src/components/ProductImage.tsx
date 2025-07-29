'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  productImage?: string;
  productName: string;
  className?: string;
}

export default function ProductImage({ productImage, productName, className = "w-full h-full object-cover" }: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState(productImage || '/api/placeholder/400/400');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageSrc(productImage || '/api/placeholder/400/400');
    setImageError(false);
    setIsLoading(true);
  }, [productImage]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc('/api/placeholder/400/400');
    }
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // If it's a placeholder, show text
  if (imageSrc === '/api/placeholder/200/200' || imageSrc === '/api/placeholder/400/400') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <span className="text-gray-500 text-sm">Product Image</span>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="animate-pulse bg-gray-300 w-full h-full"></div>
      </div>
    );
  }

  // For external URLs, use Next.js Image with unoptimized
  if (imageSrc.startsWith('http')) {
    return (
      <Image 
        src={imageSrc}
        alt={productName}
        fill
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  }

  // For internal URLs, use Next.js Image
  return (
    <Image 
      src={imageSrc}
      alt={productName}
      fill
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
} 