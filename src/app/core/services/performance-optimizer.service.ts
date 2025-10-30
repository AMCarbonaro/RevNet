import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PerformanceOptimizerService {
  private changeDetectionSubject = new Subject<void>();
  private memoryUsageSubject = new BehaviorSubject<number>(0);
  private performanceMetrics = {
    changeDetectionCycles: 0,
    memoryLeaks: 0,
    slowOperations: 0
  };

  constructor(
    private appRef: ApplicationRef
  ) {
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring(): void {
    // Monitor change detection cycles
    this.changeDetectionSubject.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(() => {
      this.performanceMetrics.changeDetectionCycles++;
      this.checkPerformanceThresholds();
    });

    // Monitor memory usage (Chrome only)
    if ((performance as any).memory) {
      setInterval(() => {
        const memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
        this.memoryUsageSubject.next(memoryUsage);
        
        if (memoryUsage > 100) { // Alert if memory usage > 100MB
          console.warn('High memory usage detected:', memoryUsage, 'MB');
          this.performanceMetrics.memoryLeaks++;
        }
      }, 5000);
    } else {
      // Fallback for browsers without memory API
      setInterval(() => {
        this.memoryUsageSubject.next(0);
      }, 5000);
    }
  }

  /**
   * Optimize change detection by batching updates
   */
  batchChangeDetection(cdr: ChangeDetectorRef, callback: () => void): void {
    callback();
    this.changeDetectionSubject.next();
    cdr.markForCheck();
  }

  /**
   * Debounced change detection for frequent updates
   */
  debouncedChangeDetection(cdr: ChangeDetectorRef, delay: number = 16): void {
    setTimeout(() => {
      cdr.markForCheck();
      this.changeDetectionSubject.next();
    }, delay);
  }

  /**
   * Track slow operations
   */
  trackSlowOperation(operationName: string, threshold: number = 100): (() => void) {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      if (duration > threshold) {
        console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
        this.performanceMetrics.slowOperations++;
      }
    };
  }

  /**
   * Optimize large list rendering with virtual scrolling
   */
  optimizeListRendering<T>(
    items: T[],
    visibleCount: number = 50,
    scrollTop: number = 0,
    itemHeight: number = 40
  ): { visibleItems: T[], startIndex: number, endIndex: number } {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, items.length);
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex
    };
  }

  /**
   * Memory cleanup utility
   */
  cleanupSubscriptions(subscriptions: any[]): void {
    subscriptions.forEach(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    });
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Get memory usage observable
   */
  getMemoryUsage(): Observable<number> {
    return this.memoryUsageSubject.asObservable();
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.performanceMetrics = {
      changeDetectionCycles: 0,
      memoryLeaks: 0,
      slowOperations: 0
    };
  }

  private checkPerformanceThresholds(): void {
    if (this.performanceMetrics.changeDetectionCycles > 1000) {
      console.warn('High change detection cycles detected:', this.performanceMetrics.changeDetectionCycles);
    }
  }

  /**
   * Optimize template expressions by memoizing expensive calculations
   */
  memoize<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
    const cache = new Map();
    
    return (...args: any[]): T => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn(...args);
      cache.set(key, result);
      
      // Limit cache size to prevent memory leaks
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      return result;
    };
  }
}
