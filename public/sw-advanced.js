/**
 * Advanced Service Worker for Revolution Network
 * Implements sophisticated caching strategies and performance optimizations
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`🚀 Advanced Workbox Service Worker loaded!`);

  // Configure Workbox
  workbox.setConfig({
    debug: false,
    clientsClaim: true,
    skipWaiting: true
  });

  // Advanced Precaching Strategy
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {
    cleanupOutdatedCaches: true,
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
  });

  // Cache Strategy Configuration
  const CACHE_STRATEGIES = {
    // Static Assets - Cache First (Long Term)
    staticAssets: new workbox.strategies.CacheFirst({
      cacheName: 'revolution-static-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          maxEntries: 1000,
          purgeOnQuotaError: true
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    }),

    // API Responses - Stale While Revalidate (Short Term)
    apiResponses: new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'revolution-api-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 5 * 60, // 5 minutes
          maxEntries: 100,
          purgeOnQuotaError: true
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    }),

    // Images - Cache First with Fallback
    images: new workbox.strategies.CacheFirst({
      cacheName: 'revolution-images-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          maxEntries: 500,
          purgeOnQuotaError: true
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    }),

    // Fonts - Cache First (Long Term)
    fonts: new workbox.strategies.CacheFirst({
      cacheName: 'revolution-fonts-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          maxEntries: 50,
          purgeOnQuotaError: true
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    }),

    // Pages - Network First with Fallback
    pages: new workbox.strategies.NetworkFirst({
      cacheName: 'revolution-pages-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
          maxEntries: 50,
          purgeOnQuotaError: true
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    }),

    // Critical Resources - Cache Only
    critical: new workbox.strategies.CacheOnly({
      cacheName: 'revolution-critical-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          maxEntries: 20,
          purgeOnQuotaError: true
        })
      ]
    })
  };

  // Route Registration with Advanced Matching

  // Static Assets (JS, CSS, Images)
  workbox.routing.registerRoute(
    ({ request }) => 
      request.destination === 'script' ||
      request.destination === 'style' ||
      (request.destination === 'image' && !request.url.includes('/api/')),
    CACHE_STRATEGIES.staticAssets
  );

  // API Routes
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    CACHE_STRATEGIES.apiResponses
  );

  // Images (Excluding API)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    CACHE_STRATEGIES.images
  );

  // Fonts
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'font',
    CACHE_STRATEGIES.fonts
  );

  // Navigation Requests (Pages)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    CACHE_STRATEGIES.pages
  );

  // Critical Resources
  workbox.routing.registerRoute(
    ({ url }) => {
      const criticalPaths = [
        '/manifest.json',
        '/sw.js',
        '/offline',
        '/_next/static/'
      ];
      return criticalPaths.some(path => url.pathname.startsWith(path));
    },
    CACHE_STRATEGIES.critical
  );

  // Background Sync for Offline Actions
  workbox.backgroundSync.register('offline-actions', {
    maxRetentionTime: 24 * 60 // Retry for up to 24 hours
  });

  // Background Sync for Donations
  workbox.backgroundSync.register('offline-donations', {
    maxRetentionTime: 48 * 60 // Retry for up to 48 hours
  });

  // Advanced Cache Management
  class AdvancedCacheManager {
    constructor() {
      this.cacheNames = [
        'revolution-static-v1',
        'revolution-api-v1',
        'revolution-images-v1',
        'revolution-fonts-v1',
        'revolution-pages-v1',
        'revolution-critical-v1'
      ];
    }

    async cleanup() {
      const cacheNames = await caches.keys();
      const validCaches = this.cacheNames;
      
      const deletePromises = cacheNames
        .filter(cacheName => !validCaches.includes(cacheName))
        .map(cacheName => caches.delete(cacheName));
      
      await Promise.all(deletePromises);
      console.log('🧹 Cache cleanup completed');
    }

    async getCacheStats() {
      const stats = {};
      
      for (const cacheName of this.cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
      }
      
      return stats;
    }

    async clearAllCaches() {
      const deletePromises = this.cacheNames.map(cacheName => 
        caches.delete(cacheName)
      );
      
      await Promise.all(deletePromises);
      console.log('🗑️ All caches cleared');
    }
  }

  const cacheManager = new AdvancedCacheManager();

  // Performance Monitoring
  class PerformanceMonitor {
    constructor() {
      this.metrics = {
        cacheHits: 0,
        cacheMisses: 0,
        networkRequests: 0,
        offlineRequests: 0
      };
    }

    recordCacheHit() {
      this.metrics.cacheHits++;
    }

    recordCacheMiss() {
      this.metrics.cacheMisses++;
    }

    recordNetworkRequest() {
      this.metrics.networkRequests++;
    }

    recordOfflineRequest() {
      this.metrics.offlineRequests++;
    }

    getMetrics() {
      return {
        ...this.metrics,
        cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100
      };
    }
  }

  const performanceMonitor = new PerformanceMonitor();

  // Enhanced Request Interception
  workbox.routing.registerRoute(
    ({ request }) => true,
    async ({ request, event }) => {
      try {
        // Record network request
        performanceMonitor.recordNetworkRequest();
        
        // Check if offline
        if (!navigator.onLine) {
          performanceMonitor.recordOfflineRequest();
          
          // Handle offline scenarios
          if (request.destination === 'document') {
            return caches.match('/offline');
          }
          
          if (request.url.includes('/api/')) {
            // Queue for background sync
            await workbox.backgroundSync.queue('offline-actions', request);
            return new Response('Queued for offline sync', { status: 202 });
          }
        }
        
        // Try to get from cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          performanceMonitor.recordCacheHit();
          return cachedResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        performanceMonitor.recordCacheMiss();
        
        return networkResponse;
      } catch (error) {
        console.error('Service Worker Error:', error);
        
        // Return offline fallback
        if (request.destination === 'document') {
          return caches.match('/offline');
        }
        
        return new Response('Service Unavailable', { status: 503 });
      }
    }
  );

  // Push Notifications
  self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const title = data.title || 'Revolution Network';
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      image: data.image,
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });

  // Notification Click Handling
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const clickedNotification = event.notification.data;
    const urlToOpen = clickedNotification?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no existing window, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  });

  // Message Handling for Cache Management
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'GET_CACHE_STATS':
          event.waitUntil(
            cacheManager.getCacheStats().then(stats => {
              event.ports[0].postMessage(stats);
            })
          );
          break;
          
        case 'CLEAR_CACHE':
          event.waitUntil(
            cacheManager.clearAllCaches().then(() => {
              event.ports[0].postMessage({ success: true });
            })
          );
          break;
          
        case 'GET_PERFORMANCE_METRICS':
          event.ports[0].postMessage(performanceMonitor.getMetrics());
          break;
          
        case 'SKIP_WAITING':
          self.skipWaiting();
          break;
          
        default:
          console.log('Unknown message type:', event.data.type);
      }
    }
  });

  // Periodic Cache Cleanup
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-cleanup') {
      event.waitUntil(cacheManager.cleanup());
    }
  });

  // Service Worker Lifecycle Events
  self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(
      Promise.all([
        self.clients.claim(),
        cacheManager.cleanup()
      ])
    );
  });

  // Error Handling
  self.addEventListener('error', (event) => {
    console.error('Service Worker Error:', event.error);
  });

  self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker Unhandled Rejection:', event.reason);
  });

  // Performance Optimization Hooks
  self.addEventListener('fetch', (event) => {
    // Log performance metrics
    const startTime = performance.now();
    
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          const endTime = performance.now();
          
          // Log slow requests
          if (endTime - startTime > 1000) {
            console.warn(`Slow request: ${event.request.url} took ${endTime - startTime}ms`);
          }
          
          return response;
        } catch (error) {
          console.error('Fetch error:', error);
          throw error;
        }
      })()
    );
  });

  // Cache Versioning and Updates
  const CACHE_VERSION = 'v1.0.0';
  
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
      event.waitUntil(
        fetch('/api/version')
          .then(response => response.json())
          .then(data => {
            if (data.version !== CACHE_VERSION) {
              event.ports[0].postMessage({ updateAvailable: true, version: data.version });
            } else {
              event.ports[0].postMessage({ updateAvailable: false });
            }
          })
          .catch(() => {
            event.ports[0].postMessage({ updateAvailable: false });
          })
      );
    }
  });

  console.log('🎯 Advanced Service Worker fully configured and ready!');
} else {
  console.error('❌ Workbox failed to load');
}