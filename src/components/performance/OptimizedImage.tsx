'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LazyLoader } from './LazyLoader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  onLoad,
  onError,
  fallback
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setHasError(true);
    onError?.(error);
  };

  const handleIntersection = () => {
    setIsInView(true);
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-matrix-darker text-terminal-red ${className}`}
        style={style}
      >
        <span>Failed to load image</span>
      </div>
    );
  }

  const imageElement = (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={style}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      sizes={sizes}
      fill={fill}
      onLoad={handleLoad}
      onError={handleError}
    />
  );

  if (priority || isInView) {
    return imageElement;
  }

  return (
    <LazyLoader
      onLoad={handleIntersection}
      fallback={
        <div 
          className={`flex items-center justify-center bg-matrix-darker ${className}`}
          style={style}
        >
          <div className="animate-pulse bg-matrix-dark rounded h-full w-full"></div>
        </div>
      }
    >
      {imageElement}
    </LazyLoader>
  );
};

export default OptimizedImage;
