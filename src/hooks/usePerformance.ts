'use client';

import { useState, useEffect, useCallback } from 'react';
import { performanceMonitor } from '@/lib/performance';
import { cacheManager } from '@/lib/cache-strategies';

interface PerformanceData {
  metrics: any;
  score: number;
  alerts: any[];
  cacheStats: any[];
  memoryUsage: any;
  networkInfo: any;
}

interface UsePerformanceResult {
  data: PerformanceData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheStats: () => Promise<any>;
  getMemoryUsage: () => any;
  getNetworkInfo: () => any;
}

export const usePerformance = (): UsePerformanceResult => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize performance monitoring
      performanceMonitor.initialize();

      // Get metrics
      const metrics = performanceMonitor.getMetrics();
      const score = performanceMonitor.getPerformanceScore();
      const alerts = performanceMonitor.getAlerts();

      // Get cache stats
      const cacheStats = await cacheManager.getCacheStats();

      // Get memory usage
      const memoryUsage = performanceMonitor.getMemoryUsage();

      // Get network info
      const networkInfo = performanceMonitor.getNetworkInfo();

      setData({
        metrics,
        score,
        alerts,
        cacheStats,
        memoryUsage,
        networkInfo
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadPerformanceData();
  }, [loadPerformanceData]);

  const clearCache = useCallback(async () => {
    try {
      await cacheManager.clearAllCaches();
      await loadPerformanceData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    }
  }, [loadPerformanceData]);

  const getCacheStats = useCallback(async () => {
    try {
      return await cacheManager.getCacheStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get cache stats');
      return null;
    }
  }, []);

  const getMemoryUsage = useCallback(() => {
    return performanceMonitor.getMemoryUsage();
  }, []);

  const getNetworkInfo = useCallback(() => {
    return performanceMonitor.getNetworkInfo();
  }, []);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    getCacheStats,
    getMemoryUsage,
    getNetworkInfo
  };
};
