// Service Worker for Revolution Network PWA
const CACHE_NAME = 'revnet-v1.0.0';
const STATIC_CACHE = 'revnet-static-v1.0.0';
const DYNAMIC_CACHE = 'revnet-dynamic-v1.0.0';
const API_CACHE = 'revnet-api-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/letters',
  '/projects',
  '/chat',
  '/auth/signin',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes to cache
const API_ROUTES = [
  '/api/letters',
  '/api/projects',
  '/api/user/profile',
  '/api/search',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with Cache Fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.startsWith('/_next/static/') || 
             url.pathname.startsWith('/icons/') ||
             url.pathname.endsWith('.png') ||
             url.pathname.endsWith('.jpg') ||
             url.pathname.endsWith('.jpeg') ||
             url.pathname.endsWith('.gif') ||
             url.pathname.endsWith('.webp') ||
             url.pathname.endsWith('.svg')) {
    // Static assets - Cache First
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // HTML pages - Network First with Cache Fallback
    event.respondWith(networkFirstStrategy(request));
  }
});

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First Strategy failed:', error);
    return new Response('Offline - Asset not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First Strategy (for API and HTML)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(
        request.url.includes('/api/') ? API_CACHE : DYNAMIC_CACHE
      );
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }

    return new Response('Offline - Content not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await syncAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Open',
          icon: '/icons/open-24x24.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/close-24x24.png'
        }
      ],
      tag: data.tag || 'revnet-notification',
      renotify: true,
      requireInteraction: true,
      silent: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Revolution Network', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Utility functions for IndexedDB operations
async function getPendingActions() {
  // This would integrate with your IndexedDB implementation
  // For now, return empty array
  return [];
}

async function syncAction(action) {
  // Sync pending action with server
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.statusText}`);
  }
  
  return response;
}

async function removePendingAction(actionId) {
  // Remove synced action from IndexedDB
  console.log('Removing pending action:', actionId);
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodic sync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });
}

// Cache cleanup on storage quota exceeded
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanOldCaches());
  }
});

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name !== STATIC_CACHE && 
    name !== DYNAMIC_CACHE && 
    name !== API_CACHE
  );
  
  await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
  
  // Clean up old entries in dynamic cache
  const dynamicCache = await caches.open(DYNAMIC_CACHE);
  const requests = await dynamicCache.keys();
  const oldRequests = requests.slice(0, -50); // Keep only last 50 entries
  
  await Promise.all(oldRequests.map(request => dynamicCache.delete(request)));
}

console.log('Service Worker: Loaded successfully');
