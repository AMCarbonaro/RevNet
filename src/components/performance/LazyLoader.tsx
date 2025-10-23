'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback = <Spinner className="h-8 w-8 text-terminal-cyan" />,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  className = '',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isVisible && !isLoaded && !hasError) {
      try {
        setIsLoaded(true);
        onLoad?.();
      } catch (error) {
        setHasError(true);
        onError?.(error as Error);
      }
    }
  }, [isVisible, isLoaded, hasError, onLoad, onError]);

  return (
    <div
      ref={elementRef}
      className={`lazy-loader ${className}`}
      style={style}
    >
      {isLoaded ? (
        children
      ) : hasError ? (
        <div className="flex items-center justify-center p-4 text-terminal-red">
          <span>Failed to load content</span>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4">
          {fallback}
        </div>
      )}
    </div>
  );
};

export default LazyLoader;
