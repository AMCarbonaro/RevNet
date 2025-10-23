'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { pwaManager } from '@/lib/pwa';

interface OfflineIndicatorProps {
  className?: string;
}

export default function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      setShowIndicator(true);
      
      // Hide indicator after 3 seconds
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    // Set initial state
    setIsOnline(navigator.onLine);
    
    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection status periodically
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (!response.ok && isOnline) {
          setIsOnline(false);
          setShowIndicator(true);
        } else if (response.ok && !isOnline) {
          setIsOnline(true);
          setIsReconnecting(false);
          setShowIndicator(true);
          
          setTimeout(() => {
            setShowIndicator(false);
          }, 3000);
        }
      } catch (error) {
        if (isOnline) {
          setIsOnline(false);
          setShowIndicator(true);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const handleRetry = async () => {
    setIsReconnecting(true);
    
    try {
      // Try to sync pending actions
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_PENDING_ACTIONS'
        });
      }
      
      // Wait a moment for sync to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if we're back online
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setIsOnline(true);
        setIsReconnecting(false);
        setShowIndicator(true);
        
        setTimeout(() => {
          setShowIndicator(false);
        }, 3000);
      } else {
        setIsReconnecting(false);
      }
    } catch (error) {
      setIsReconnecting(false);
    }
  };

  if (!showIndicator) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm
        ${isOnline 
          ? 'bg-terminal-green/20 border-terminal-green text-terminal-green' 
          : 'bg-terminal-red/20 border-terminal-red text-terminal-red'
        }
      `}>
        {isOnline ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Back Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">Offline Mode</span>
            
            <button
              onClick={handleRetry}
              disabled={isReconnecting}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-50"
              title="Retry connection"
            >
              <RefreshCw className={`w-4 h-4 ${isReconnecting ? 'animate-spin' : ''}`} />
            </button>
          </>
        )}
      </div>

      {!isOnline && (
        <div className="mt-2 p-3 bg-matrix-dark border border-terminal-red rounded-lg max-w-sm">
          <div className="flex items-start gap-2">
            <WifiOff className="w-4 h-4 text-terminal-red mt-0.5 flex-shrink-0" />
            <div className="text-xs text-terminal-cyan">
              <p className="font-medium mb-1">You're offline</p>
              <p className="mb-2">
                Some features may be limited. Your actions will sync when you're back online.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  disabled={isReconnecting}
                  className="text-xs px-2 py-1 bg-terminal-red/20 text-terminal-red rounded hover:bg-terminal-red/30 transition-colors disabled:opacity-50"
                >
                  {isReconnecting ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact offline indicator for mobile
export function CompactOfflineIndicator({ className = '' }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true);

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

  if (isOnline) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-terminal-red/90 text-white rounded-full text-sm backdrop-blur-sm">
        <WifiOff className="w-4 h-4" />
        <span>Offline</span>
      </div>
    </div>
  );
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    
    // Get connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
}
