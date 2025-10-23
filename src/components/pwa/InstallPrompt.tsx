'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { isPWA, isMobile, isIOS, isAndroid, pwaManager } from '@/lib/pwa';

interface InstallPromptProps {
  onClose?: () => void;
  autoShow?: boolean;
  delay?: number;
}

export default function InstallPrompt({ onClose, autoShow = true, delay = 5000 }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    if (!autoShow) return;

    const timer = setTimeout(() => {
      if (!isPWA() && pwaManager.isInstallable()) {
        setDeviceType(isMobile() ? 'mobile' : 'desktop');
        setIsVisible(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [autoShow, delay]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await pwaManager.showInstallPrompt();
      setIsVisible(false);
      onClose?.();
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-matrix-dark border border-terminal-green rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-terminal-cyan hover:text-terminal-green transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mb-4">
            {deviceType === 'mobile' ? (
              <Smartphone className="w-16 h-16 text-terminal-green mx-auto" />
            ) : (
              <Monitor className="w-16 h-16 text-terminal-green mx-auto" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-terminal-green mb-2">
            Install Revolution Network
          </h2>
          
          <p className="text-terminal-cyan">
            Get the full experience with our Progressive Web App
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-terminal-green">
            <div className="w-2 h-2 bg-terminal-green rounded-full"></div>
            <span className="text-sm">Access from your home screen</span>
          </div>
          
          <div className="flex items-center gap-3 text-terminal-green">
            <div className="w-2 h-2 bg-terminal-green rounded-full"></div>
            <span className="text-sm">Works offline</span>
          </div>
          
          <div className="flex items-center gap-3 text-terminal-green">
            <div className="w-2 h-2 bg-terminal-green rounded-full"></div>
            <span className="text-sm">Faster loading</span>
          </div>
          
          <div className="flex items-center gap-3 text-terminal-green">
            <div className="w-2 h-2 bg-terminal-green rounded-full"></div>
            <span className="text-sm">Push notifications</span>
          </div>
        </div>

        {isIOS() && (
          <div className="mb-4 p-3 bg-terminal-green/10 border border-terminal-green/20 rounded">
            <p className="text-terminal-cyan text-sm">
              <strong>iOS Users:</strong> Tap the share button{' '}
              <span className="inline-block w-4 h-4 bg-terminal-green rounded text-black text-xs flex items-center justify-center">↗</span>
              {' '}and select "Add to Home Screen"
            </p>
          </div>
        )}

        {isAndroid() && (
          <div className="mb-4 p-3 bg-terminal-green/10 border border-terminal-green/20 rounded">
            <p className="text-terminal-cyan text-sm">
              <strong>Android Users:</strong> Tap the menu button{' '}
              <span className="inline-block w-4 h-4 bg-terminal-green rounded text-black text-xs flex items-center justify-center">⋮</span>
              {' '}and select "Add to Home Screen"
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            {isInstalling ? 'Installing...' : 'Install App'}
          </button>
          
          <button
            onClick={handleClose}
            className="px-4 py-3 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors"
          >
            Maybe Later
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-terminal-cyan">
            No download required • Works in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
