import { Workbox } from 'workbox-window';

// PWA utilities for Revolution Network
class PWAManager {
  private workbox: Workbox | null = null;
  private installPrompt: any = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;

  constructor() {
    this.initializeWorkbox();
    this.setupEventListeners();
    this.checkInstallStatus();
  }

  private async initializeWorkbox() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        this.workbox = new Workbox('/sw.js');
        await this.workbox.register();
        
        this.workbox.addEventListener('installed', () => {
          console.log('Service Worker installed');
          this.showUpdateNotification();
        });

        this.workbox.addEventListener('waiting', () => {
          console.log('Service Worker waiting');
          this.showUpdateNotification();
        });

        this.workbox.addEventListener('controlling', () => {
          console.log('Service Worker controlling');
          window.location.reload();
        });
      } catch (error) {
        console.error('Workbox registration failed:', error);
      }
    }
  }

  private setupEventListeners() {
    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallPrompt();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
      this.hideInstallPrompt();
      console.log('PWA installed successfully');
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.hideOfflineIndicator();
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineIndicator();
    });

    // Visibility change (for background sync)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncPendingActions();
      }
    });
  }

  private checkInstallStatus() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      this.isInstalled = true;
    }
  }

  // Show install prompt
  async showInstallPrompt() {
    if (this.installPrompt && !this.isInstalled) {
      const result = await this.installPrompt.prompt();
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        console.log('User accepted install prompt');
      } else {
        console.log('User dismissed install prompt');
      }
      
      this.installPrompt = null;
    }
  }

  // Hide install prompt
  private hideInstallPrompt() {
    // Implementation would hide the install prompt UI
    console.log('Install prompt hidden');
  }

  // Show update notification
  private showUpdateNotification() {
    // Show notification that an update is available
    console.log('Update available');
  }

  // Show offline indicator
  private showOfflineIndicator() {
    // Show offline indicator in UI
    console.log('Offline mode activated');
  }

  // Hide offline indicator
  private hideOfflineIndicator() {
    // Hide offline indicator in UI
    console.log('Back online');
  }

  // Sync pending actions when back online
  private async syncPendingActions() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_PENDING_ACTIONS'
      });
    }
  }

  // Check if PWA is installable
  public isInstallable(): boolean {
    return this.installPrompt !== null && !this.isInstalled;
  }

  // Check if PWA is installed
  public isPWAInstalled(): boolean {
    return this.isInstalled;
  }

  // Check if online
  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Get app version
  public async getAppVersion(): Promise<string> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version || 'unknown');
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );
      });
    }
    return 'unknown';
  }

  // Update service worker
  public async updateServiceWorker() {
    if (this.workbox) {
      await this.workbox.update();
    }
  }

  // Skip waiting and reload
  public skipWaitingAndReload() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

// Push notification utilities
export class PushNotificationManager {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.permission = Notification.permission;
  }

  // Request notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission;
    }
    return 'denied';
  }

  // Check if notifications are supported
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Check if permission is granted
  public hasPermission(): boolean {
    return this.permission === 'granted';
  }

  // Subscribe to push notifications
  public async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.hasPermission()) {
      throw new Error('Notification permission not granted');
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  public async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        return true;
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
    
    return false;
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: PushSubscription) {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  // Convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Background sync utilities
export class BackgroundSyncManager {
  // Register background sync
  public async registerBackgroundSync(tag: string): Promise<boolean> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        return true;
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
    return false;
  }

  // Store data for background sync
  public async storeForBackgroundSync(key: string, data: any): Promise<void> {
    try {
      // Store in IndexedDB for background sync
      const db = await this.openDB();
      const transaction = db.transaction(['backgroundSync'], 'readwrite');
      const store = transaction.objectStore('backgroundSync');
      await store.put({ key, data, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to store data for background sync:', error);
    }
  }

  // Open IndexedDB
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RevNetBackgroundSync', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('backgroundSync')) {
          db.createObjectStore('backgroundSync', { keyPath: 'key' });
        }
      };
    });
  }
}

// Create singleton instances
export const pwaManager = new PWAManager();
export const pushNotificationManager = new PushNotificationManager();
export const backgroundSyncManager = new BackgroundSyncManager();

// Utility functions
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

export const getInstallPrompt = (): any => {
  return pwaManager.isInstallable();
};

export const installPWA = async (): Promise<void> => {
  await pwaManager.showInstallPrompt();
};

export const checkForUpdates = async (): Promise<void> => {
  await pwaManager.updateServiceWorker();
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  return await pushNotificationManager.requestPermission();
};

export const subscribeToNotifications = async (): Promise<PushSubscription | null> => {
  return await pushNotificationManager.subscribeToPush();
};

export default pwaManager;
