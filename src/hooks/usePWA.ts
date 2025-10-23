import { useState, useEffect, useCallback } from 'react';
import { pwaManager, pushNotificationManager, backgroundSyncManager } from '@/lib/pwa';

// Hook for PWA installation
export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const checkInstallStatus = () => {
      setIsInstallable(pwaManager.isInstallable());
      setIsInstalled(pwaManager.isPWAInstalled());
    };

    checkInstallStatus();

    // Check periodically
    const interval = setInterval(checkInstallStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const install = useCallback(async () => {
    if (!isInstallable || isInstalling) return;

    setIsInstalling(true);
    try {
      await pwaManager.showInstallPrompt();
      setIsInstalled(true);
      setIsInstallable(false);
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  }, [isInstallable, isInstalling]);

  return {
    isInstallable,
    isInstalled,
    isInstalling,
    install,
  };
}

// Hook for network status
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

// Hook for push notifications
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported(pushNotificationManager.isSupported());
    setPermission(pushNotificationManager.hasPermission() ? 'granted' : 'default');
    
    // Check if already subscribed
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }
  };

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const newPermission = await pushNotificationManager.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'denied';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      throw new Error('Push notifications not supported or permission not granted');
    }

    setIsLoading(true);
    try {
      const subscription = await pushNotificationManager.subscribeToPush();
      setIsSubscribed(!!subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await pushNotificationManager.unsubscribeFromPush();
      setIsSubscribed(!success);
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
  };
}

// Hook for background sync
export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false);
  const [pendingActions, setPendingActions] = useState<any[]>([]);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype);
    loadPendingActions();
  }, []);

  const loadPendingActions = async () => {
    // Load pending actions from IndexedDB
    try {
      // Implementation would load from IndexedDB
      setPendingActions([]);
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const registerSync = useCallback(async (tag: string) => {
    if (!isSupported) {
      throw new Error('Background sync not supported');
    }

    try {
      const success = await backgroundSyncManager.registerBackgroundSync(tag);
      return success;
    } catch (error) {
      console.error('Error registering background sync:', error);
      return false;
    }
  }, [isSupported]);

  const storeForSync = useCallback(async (key: string, data: any) => {
    try {
      await backgroundSyncManager.storeForBackgroundSync(key, data);
      loadPendingActions(); // Reload pending actions
    } catch (error) {
      console.error('Error storing data for sync:', error);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_PENDING_ACTIONS'
      });
    }
  }, []);

  return {
    isSupported,
    pendingActions,
    registerSync,
    storeForSync,
    syncNow,
    loadPendingActions,
  };
}

// Hook for service worker updates
export function useServiceWorkerUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          setHasUpdate(true);
        }
      });
    }
  }, []);

  const update = useCallback(async () => {
    setIsUpdating(true);
    try {
      await pwaManager.updateServiceWorker();
      setHasUpdate(false);
    } catch (error) {
      console.error('Error updating service worker:', error);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const skipWaiting = useCallback(() => {
    pwaManager.skipWaitingAndReload();
  }, []);

  return {
    hasUpdate,
    isUpdating,
    update,
    skipWaiting,
  };
}

// Hook for app version
export function useAppVersion() {
  const [version, setVersion] = useState<string>('unknown');

  useEffect(() => {
    const getVersion = async () => {
      try {
        const appVersion = await pwaManager.getAppVersion();
        setVersion(appVersion);
      } catch (error) {
        console.error('Error getting app version:', error);
      }
    };

    getVersion();
  }, []);

  return version;
}

// Hook for PWA status
export function usePWAStatus() {
  const [isPWA, setIsPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [displayMode, setDisplayMode] = useState<string>('browser');

  useEffect(() => {
    const checkPWAStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isStandaloneMode = (window.navigator as any).standalone === true;
      
      setIsPWA(standalone || isStandaloneMode);
      setIsStandalone(standalone || isStandaloneMode);
      
      if (standalone || isStandaloneMode) {
        setDisplayMode('standalone');
      } else {
        setDisplayMode('browser');
      }
    };

    checkPWAStatus();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);

    return () => {
      mediaQuery.removeEventListener('change', checkPWAStatus);
    };
  }, []);

  return {
    isPWA,
    isStandalone,
    displayMode,
  };
}

// Hook for offline storage
export function useOfflineStorage() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [quota, setQuota] = useState<number | null>(null);
  const [usage, setUsage] = useState<number | null>(null);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      setIsAvailable(true);
      checkStorageQuota();
    }
  }, []);

  const checkStorageQuota = async () => {
    try {
      const estimate = await navigator.storage.estimate();
      setQuota(estimate.quota || null);
      setUsage(estimate.usage || null);
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
  };

  const clearStorage = async () => {
    try {
      if ('storage' in navigator && 'clear' in navigator.storage) {
        await navigator.storage.clear();
        await checkStorageQuota();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  return {
    isAvailable,
    quota,
    usage,
    checkStorageQuota,
    clearStorage,
  };
}

export default {
  usePWAInstall,
  useNetworkStatus,
  usePushNotifications,
  useBackgroundSync,
  useServiceWorkerUpdate,
  useAppVersion,
  usePWAStatus,
  useOfflineStorage,
};
