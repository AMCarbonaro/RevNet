import { logInfo, logError } from './logger';

export interface CacheConfig {
  name: string;
  maxAge: number; // in seconds
  maxEntries: number;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';
  version: string;
  patterns: string[];
}

export interface CacheStats {
  name: string;
  size: number;
  hitRate: number;
  missRate: number;
  lastUpdated: Date;
  version: string;
}

export interface CacheStrategy {
  name: string;
  description: string;
  config: CacheConfig;
  getCacheKey: (request: Request) => string;
  shouldCache: (request: Request, response: Response) => boolean;
  getExpirationTime: (request: Request) => number;
}

export class CacheManager {
  private static instance: CacheManager;
  private strategies: Map<string, CacheStrategy> = new Map();
  private stats: Map<string, CacheStats> = new Map();
  private isInitialized = false;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  constructor() {
    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies(): void {
    // Static Assets Strategy
    this.addStrategy({
      name: 'static-assets',
      description: 'Cache first strategy for static assets (JS, CSS, images)',
      config: {
        name: 'revolution-static-v1',
        maxAge: 365 * 24 * 60 * 60, // 1 year
        maxEntries: 1000,
        strategy: 'cache-first',
        version: 'v1.0.0',
        patterns: ['_next/static', '/static', '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2']
      },
      getCacheKey: (request) => request.url,
      shouldCache: (request, response) => {
        return response.status === 200 && 
               (request.destination === 'script' || 
                request.destination === 'style' || 
                request.destination === 'image' || 
                request.destination === 'font');
      },
      getExpirationTime: (request) => 365 * 24 * 60 * 60 // 1 year
    });

    // API Responses Strategy
    this.addStrategy({
      name: 'api-responses',
      description: 'Stale while revalidate strategy for API responses',
      config: {
        name: 'revolution-api-v1',
        maxAge: 5 * 60, // 5 minutes
        maxEntries: 100,
        strategy: 'stale-while-revalidate',
        version: 'v1.0.0',
        patterns: ['/api/']
      },
      getCacheKey: (request) => {
        const url = new URL(request.url);
        return `${url.pathname}${url.search}`;
      },
      shouldCache: (request, response) => {
        return response.status === 200 && 
               request.url.includes('/api/') &&
               !request.url.includes('/api/auth/') &&
               !request.url.includes('/api/admin/');
      },
      getExpirationTime: (request) => 5 * 60 // 5 minutes
    });

    // Images Strategy
    this.addStrategy({
      name: 'images',
      description: 'Cache first strategy for images with fallback',
      config: {
        name: 'revolution-images-v1',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        maxEntries: 500,
        strategy: 'cache-first',
        version: 'v1.0.0',
        patterns: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
      },
      getCacheKey: (request) => request.url,
      shouldCache: (request, response) => {
        return response.status === 200 && 
               request.destination === 'image' &&
               !request.url.includes('/api/');
      },
      getExpirationTime: (request) => 30 * 24 * 60 * 60 // 30 days
    });

    // Fonts Strategy
    this.addStrategy({
      name: 'fonts',
      description: 'Cache first strategy for fonts',
      config: {
        name: 'revolution-fonts-v1',
        maxAge: 365 * 24 * 60 * 60, // 1 year
        maxEntries: 50,
        strategy: 'cache-first',
        version: 'v1.0.0',
        patterns: ['.woff', '.woff2', '.ttf', '.otf']
      },
      getCacheKey: (request) => request.url,
      shouldCache: (request, response) => {
        return response.status === 200 && request.destination === 'font';
      },
      getExpirationTime: (request) => 365 * 24 * 60 * 60 // 1 year
    });

    // Pages Strategy
    this.addStrategy({
      name: 'pages',
      description: 'Network first strategy for pages with fallback',
      config: {
        name: 'revolution-pages-v1',
        maxAge: 24 * 60 * 60, // 24 hours
        maxEntries: 50,
        strategy: 'network-first',
        version: 'v1.0.0',
        patterns: ['/']
      },
      getCacheKey: (request) => request.url,
      shouldCache: (request, response) => {
        return response.status === 200 && request.mode === 'navigate';
      },
      getExpirationTime: (request) => 24 * 60 * 60 // 24 hours
    });

    // Critical Resources Strategy
    this.addStrategy({
      name: 'critical',
      description: 'Cache only strategy for critical resources',
      config: {
        name: 'revolution-critical-v1',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        maxEntries: 20,
        strategy: 'cache-only',
        version: 'v1.0.0',
        patterns: ['/manifest.json', '/sw.js', '/offline']
      },
      getCacheKey: (request) => request.url,
      shouldCache: (request, response) => {
        return response.status === 200;
      },
      getExpirationTime: (request) => 7 * 24 * 60 * 60 // 7 days
    });
  }

  addStrategy(strategy: CacheStrategy): void {
    this.strategies.set(strategy.name, strategy);
    logInfo('Cache strategy added', { name: strategy.name });
  }

  getStrategy(name: string): CacheStrategy | undefined {
    return this.strategies.get(name);
  }

  getAllStrategies(): CacheStrategy[] {
    return Array.from(this.strategies.values());
  }

  getMatchingStrategy(request: Request): CacheStrategy | null {
    for (const strategy of this.strategies.values()) {
      if (this.matchesPattern(request, strategy.config.patterns)) {
        return strategy;
      }
    }
    return null;
  }

  private matchesPattern(request: Request, patterns: string[]): boolean {
    const url = request.url;
    return patterns.some(pattern => {
      if (pattern.startsWith('/')) {
        return url.includes(pattern);
      }
      return url.includes(pattern);
    });
  }

  // Cache Operations
  async getCacheStats(): Promise<CacheStats[]> {
    const stats: CacheStats[] = [];
    
    for (const strategy of this.strategies.values()) {
      try {
        const cache = await caches.open(strategy.config.name);
        const keys = await cache.keys();
        const stat: CacheStats = {
          name: strategy.config.name,
          size: keys.length,
          hitRate: 0, // Will be updated by service worker
          missRate: 0, // Will be updated by service worker
          lastUpdated: new Date(),
          version: strategy.config.version
        };
        stats.push(stat);
      } catch (error) {
        logError(error as Error, { context: 'cache_stats', cacheName: strategy.config.name });
      }
    }
    
    return stats;
  }

  async clearCache(name: string): Promise<boolean> {
    try {
      const strategy = this.strategies.get(name);
      if (!strategy) return false;
      
      await caches.delete(strategy.config.name);
      logInfo('Cache cleared', { name: strategy.config.name });
      return true;
    } catch (error) {
      logError(error as Error, { context: 'cache_clear', cacheName: name });
      return false;
    }
  }

  async clearAllCaches(): Promise<void> {
    const clearPromises = Array.from(this.strategies.keys()).map(name => 
      this.clearCache(name)
    );
    
    await Promise.all(clearPromises);
    logInfo('All caches cleared');
  }

  async updateCacheVersion(version: string): Promise<void> {
    for (const strategy of this.strategies.values()) {
      strategy.config.version = version;
      strategy.config.name = strategy.config.name.replace(/v\d+\.\d+\.\d+/, version);
    }
    
    logInfo('Cache version updated', { version });
  }

  // Cache Invalidation
  async invalidateCache(name: string, pattern?: string): Promise<void> {
    try {
      const strategy = this.strategies.get(name);
      if (!strategy) return;
      
      const cache = await caches.open(strategy.config.name);
      const keys = await cache.keys();
      
      const keysToDelete = pattern 
        ? keys.filter(key => key.url.includes(pattern))
        : keys;
      
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
      
      logInfo('Cache invalidated', { 
        name: strategy.config.name, 
        pattern, 
        deletedCount: keysToDelete.length 
      });
    } catch (error) {
      logError(error as Error, { context: 'cache_invalidation', cacheName: name });
    }
  }

  // Cache Warming
  async warmCache(urls: string[], strategyName?: string): Promise<void> {
    const strategy = strategyName ? this.strategies.get(strategyName) : null;
    
    if (!strategy) {
      logError(new Error('Strategy not found'), { context: 'cache_warming', strategyName });
      return;
    }
    
    try {
      const cache = await caches.open(strategy.config.name);
      
      for (const url of urls) {
        try {
          const response = await fetch(url);
          if (response.ok && strategy.shouldCache(new Request(url), response)) {
            await cache.put(url, response);
          }
        } catch (error) {
          logError(error as Error, { context: 'cache_warming', url });
        }
      }
      
      logInfo('Cache warmed', { strategyName, urlCount: urls.length });
    } catch (error) {
      logError(error as Error, { context: 'cache_warming' });
    }
  }

  // Cache Optimization
  async optimizeCache(): Promise<void> {
    for (const strategy of this.strategies.values()) {
      try {
        const cache = await caches.open(strategy.config.name);
        const keys = await cache.keys();
        
        // Remove expired entries
        const now = Date.now();
        const expiredKeys = [];
        
        for (const key of keys) {
          const response = await cache.match(key);
          if (response) {
            const cacheTime = response.headers.get('sw-cache-time');
            if (cacheTime) {
              const age = now - parseInt(cacheTime);
              if (age > strategy.config.maxAge * 1000) {
                expiredKeys.push(key);
              }
            }
          }
        }
        
        await Promise.all(expiredKeys.map(key => cache.delete(key)));
        
        // Remove excess entries if over limit
        if (keys.length > strategy.config.maxEntries) {
          const excessCount = keys.length - strategy.config.maxEntries;
          const keysToRemove = keys.slice(0, excessCount);
          await Promise.all(keysToRemove.map(key => cache.delete(key)));
        }
        
        logInfo('Cache optimized', { 
          name: strategy.config.name, 
          expiredRemoved: expiredKeys.length,
          excessRemoved: Math.max(0, keys.length - strategy.config.maxEntries)
        });
      } catch (error) {
        logError(error as Error, { context: 'cache_optimization', cacheName: strategy.config.name });
      }
    }
  }

  // Cache Analytics
  async getCacheAnalytics(): Promise<{ [key: string]: any }> {
    const analytics: { [key: string]: any } = {};
    
    for (const strategy of this.strategies.values()) {
      try {
        const cache = await caches.open(strategy.config.name);
        const keys = await cache.keys();
        
        let totalSize = 0;
        let oldestEntry = Date.now();
        let newestEntry = 0;
        
        for (const key of keys) {
          const response = await cache.match(key);
          if (response) {
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
              totalSize += parseInt(contentLength);
            }
            
            const cacheTime = response.headers.get('sw-cache-time');
            if (cacheTime) {
              const time = parseInt(cacheTime);
              oldestEntry = Math.min(oldestEntry, time);
              newestEntry = Math.max(newwestEntry, time);
            }
          }
        }
        
        analytics[strategy.config.name] = {
          entryCount: keys.length,
          totalSize,
          averageSize: keys.length > 0 ? totalSize / keys.length : 0,
          oldestEntry: oldestEntry === Date.now() ? null : new Date(oldestEntry),
          newestEntry: newestEntry === 0 ? null : new Date(newestEntry),
          strategy: strategy.config.strategy,
          maxAge: strategy.config.maxAge,
          maxEntries: strategy.config.maxEntries
        };
      } catch (error) {
        logError(error as Error, { context: 'cache_analytics', cacheName: strategy.config.name });
      }
    }
    
    return analytics;
  }

  // Service Worker Communication
  async sendMessageToServiceWorker(message: any): Promise<any> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }
    
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      navigator.serviceWorker.controller?.postMessage(message, [messageChannel.port2]);
      
      setTimeout(() => {
        reject(new Error('Service Worker message timeout'));
      }, 5000);
    });
  }

  async getServiceWorkerCacheStats(): Promise<any> {
    try {
      return await this.sendMessageToServiceWorker({ type: 'GET_CACHE_STATS' });
    } catch (error) {
      logError(error as Error, { context: 'service_worker_cache_stats' });
      return null;
    }
  }

  async clearServiceWorkerCache(): Promise<boolean> {
    try {
      const result = await this.sendMessageToServiceWorker({ type: 'CLEAR_CACHE' });
      return result.success;
    } catch (error) {
      logError(error as Error, { context: 'service_worker_cache_clear' });
      return false;
    }
  }

  async getServiceWorkerPerformanceMetrics(): Promise<any> {
    try {
      return await this.sendMessageToServiceWorker({ type: 'GET_PERFORMANCE_METRICS' });
    } catch (error) {
      logError(error as Error, { context: 'service_worker_performance_metrics' });
      return null;
    }
  }

  // Initialize
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Warm critical caches
      const criticalUrls = [
        '/manifest.json',
        '/offline',
        '/_next/static/css/',
        '/_next/static/js/'
      ];
      
      await this.warmCache(criticalUrls, 'critical');
      this.isInitialized = true;
      
      logInfo('Cache manager initialized');
    } catch (error) {
      logError(error as Error, { context: 'cache_manager_init' });
    }
  }
}

export const cacheManager = CacheManager.getInstance();