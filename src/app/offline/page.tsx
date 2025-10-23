'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Try to reload the page
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (isOnline) {
    // Redirect to home page when back online
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-matrix-darker flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <WifiOff className="w-24 h-24 text-terminal-red mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold text-terminal-red neon-glow mb-4">
            OFFLINE
          </h1>
          <p className="text-terminal-cyan text-lg">
            The Matrix is temporarily unavailable
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-black/20 border border-terminal-green/20 rounded-lg">
            <h2 className="text-terminal-green font-semibold mb-3">
              What you can do:
            </h2>
            <ul className="text-terminal-cyan text-sm space-y-2 text-left">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-terminal-green rounded-full"></div>
                Check your internet connection
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-terminal-green rounded-full"></div>
                Try refreshing the page
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-terminal-green rounded-full"></div>
                Access cached content (if available)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-terminal-green rounded-full"></div>
                Return when connection is restored
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>

            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-terminal-purple text-terminal-purple rounded-lg hover:bg-terminal-purple hover:text-black transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-terminal-cyan">
          <p>
            Revolution Network is designed to work offline when possible.
            Your data will sync when you're back online.
          </p>
        </div>
      </div>
    </div>
  );
}
