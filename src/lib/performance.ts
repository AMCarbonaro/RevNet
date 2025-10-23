import { logInfo, logError } from './logger';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  
  // Additional Metrics
  fmp: number; // First Meaningful Paint
  si: number; // Speed Index
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
  
  // Custom Metrics
  pageLoadTime: number;
  domContentLoaded: number;
  resourceLoadTime: number;
  cacheHitRate: number;
  networkRequests: number;
  offlineRequests: number;
}

export interface PerformanceThresholds {
  lcp: number; // 2.5s
  fid: number; // 100ms
  cls: number; // 0.1
  fcp: number; // 1.8s
  ttfb: number; // 600ms
  fmp: number; // 1.8s
  si: number; // 3.4s
  tti: number; // 3.8s
  tbt: number; // 200ms
}

export interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'error' | 'critical';
  timestamp: Date;
  url: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    this.metrics = {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      fmp: 0,
      si: 0,
      tti: 0,
      tbt: 0,
      pageLoadTime: 0,
      domContentLoaded: 0,
      resourceLoadTime: 0,
      cacheHitRate: 0,
      networkRequests: 0,
      offlineRequests: 0
    };

    this.thresholds = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      ttfb: 600,
      fmp: 1800,
      si: 3400,
      tti: 3800,
      tbt: 200
    };
  }

  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      this.setupPerformanceObservers();
      this.setupResourceTiming();
      this.setupNavigationTiming();
      this.setupCustomMetrics();
      this.setupServiceWorkerMetrics();
      
      this.isInitialized = true;
      logInfo('Performance monitoring initialized');
    } catch (error) {
      logError(error as Error, { context: 'performance_monitoring_init' });
    }
  }

  private setupPerformanceObservers(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.checkThreshold('lcp', this.metrics.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.checkThreshold('fid', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.checkThreshold('cls', this.metrics.cls);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fcp = entry.startTime;
            this.checkThreshold('fcp', this.metrics.fcp);
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }
    }
  }

  private setupResourceTiming(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      let totalResourceTime = 0;
      let resourceCount = 0;

      resources.forEach((resource: any) => {
        totalResourceTime += resource.duration;
        resourceCount++;
      });

      this.metrics.resourceLoadTime = totalResourceTime / resourceCount;
    });
  }

  private setupNavigationTiming(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.fetchStart;
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        
        this.checkThreshold('ttfb', this.metrics.ttfb);
        this.checkThreshold('pageLoadTime', this.metrics.pageLoadTime);
      }
    });
  }

  private setupCustomMetrics(): void {
    if (typeof window === 'undefined') return;

    // Track network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      this.metrics.networkRequests++;
      return originalFetch.apply(this, args);
    };

    // Track offline requests
    window.addEventListener('online', () => {
      this.metrics.offlineRequests = 0;
    });

    window.addEventListener('offline', () => {
      this.metrics.offlineRequests++;
    });
  }

  private setupServiceWorkerMetrics(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Get service worker metrics
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
        const swMetrics = event.data.metrics;
        this.metrics.cacheHitRate = swMetrics.cacheHitRate || 0;
        this.metrics.networkRequests = swMetrics.networkRequests || 0;
        this.metrics.offlineRequests = swMetrics.offlineRequests || 0;
      }
    });
  }

  private checkThreshold(metric: string, value: number): void {
    const threshold = this.thresholds[metric as keyof PerformanceThresholds];
    
    if (threshold && value > threshold) {
      const severity = this.getSeverity(metric, value, threshold);
      const alert: PerformanceAlert = {
        metric,
        value,
        threshold,
        severity,
        timestamp: new Date(),
        url: window.location.href
      };
      
      this.alerts.push(alert);
      this.sendAlert(alert);
    }
  }

  private getSeverity(metric: string, value: number, threshold: number): 'warning' | 'error' | 'critical' {
    const ratio = value / threshold;
    
    if (ratio >= 2) return 'critical';
    if (ratio >= 1.5) return 'error';
    return 'warning';
  }

  private sendAlert(alert: PerformanceAlert): void {
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_alert', {
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        severity: alert.severity
      });
    }

    // Send to custom analytics
    this.sendToAnalytics('performance_alert', {
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      severity: alert.severity,
      url: alert.url,
      timestamp: alert.timestamp
    });

    logError(new Error(`Performance threshold exceeded: ${alert.metric} = ${alert.value}ms (threshold: ${alert.threshold}ms)`), {
      context: 'performance_threshold',
      severity: alert.severity
    });
  }

  private sendToAnalytics(event: string, data: any): void {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        properties: data,
        sessionId: this.getSessionId(),
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Failed to send performance analytics:', error);
    });
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  // Public Methods
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    logInfo('Performance thresholds updated', { thresholds: newThresholds });
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  getPerformanceScore(): number {
    const scores = {
      lcp: this.getScore('lcp', this.metrics.lcp),
      fid: this.getScore('fid', this.metrics.fid),
      cls: this.getScore('cls', this.metrics.cls),
      fcp: this.getScore('fcp', this.metrics.fcp),
      ttfb: this.getScore('ttfb', this.metrics.ttfb)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return Math.round(totalScore / Object.keys(scores).length);
  }

  private getScore(metric: string, value: number): number {
    const threshold = this.thresholds[metric as keyof PerformanceThresholds];
    if (!threshold) return 100;
    
    const ratio = value / threshold;
    if (ratio <= 0.5) return 100;
    if (ratio <= 1) return 90;
    if (ratio <= 1.5) return 70;
    if (ratio <= 2) return 50;
    return 0;
  }

  // Bundle Size Monitoring
  async getBundleSize(): Promise<{ [key: string]: number }> {
    const bundleSizes: { [key: string]: number } = {};
    
    try {
      const resources = performance.getEntriesByType('resource') as any[];
      const jsResources = resources.filter(resource => 
        resource.name.includes('_next/static') && resource.name.endsWith('.js')
      );
      
      for (const resource of jsResources) {
        const response = await fetch(resource.name, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          bundleSizes[resource.name] = parseInt(contentLength);
        }
      }
    } catch (error) {
      logError(error as Error, { context: 'bundle_size_monitoring' });
    }
    
    return bundleSizes;
  }

  // Memory Usage Monitoring
  getMemoryUsage(): any {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }
    
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }

  // Network Information
  getNetworkInfo(): any {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
      return null;
    }
    
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  // Performance Budget Monitoring
  checkPerformanceBudget(): { [key: string]: boolean } {
    const budget = {
      lcp: this.metrics.lcp <= this.thresholds.lcp,
      fid: this.metrics.fid <= this.thresholds.fid,
      cls: this.metrics.cls <= this.thresholds.cls,
      fcp: this.metrics.fcp <= this.thresholds.fcp,
      ttfb: this.metrics.ttfb <= this.thresholds.ttfb,
      pageLoadTime: this.metrics.pageLoadTime <= 3000, // 3 seconds
      bundleSize: true, // Will be checked separately
      memoryUsage: true // Will be checked separately
    };
    
    return budget;
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();