'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Trash2
} from 'lucide-react';
import { performanceMonitor } from '@/lib/performance';
import { cacheManager } from '@/lib/cache-strategies';

interface WebVitalsData {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  pageLoadTime: number;
  domContentLoaded: number;
  resourceLoadTime: number;
  cacheHitRate: number;
  networkRequests: number;
  offlineRequests: number;
  performanceScore: number;
}

interface CacheStats {
  name: string;
  size: number;
  hitRate: number;
  missRate: number;
  lastUpdated: Date;
  version: string;
}

interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

const WebVitals: React.FC = () => {
  const [webVitals, setWebVitals] = useState<WebVitalsData | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializePerformanceMonitoring();
    loadPerformanceData();
  }, []);

  const initializePerformanceMonitoring = () => {
    performanceMonitor.initialize();
  };

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Load Web Vitals
      const metrics = performanceMonitor.getMetrics();
      const performanceScore = performanceMonitor.getPerformanceScore();
      
      setWebVitals({
        ...metrics,
        performanceScore
      });

      // Load Cache Stats
      const cacheStatsData = await cacheManager.getCacheStats();
      setCacheStats(cacheStatsData);

      // Load Memory Usage
      const memory = performanceMonitor.getMemoryUsage();
      setMemoryUsage(memory);

      // Load Network Info
      const network = performanceMonitor.getNetworkInfo();
      setNetworkInfo(network);

      // Load Alerts
      const performanceAlerts = performanceMonitor.getAlerts();
      setAlerts(performanceAlerts);

    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
  };

  const clearCache = async () => {
    try {
      await cacheManager.clearAllCaches();
      await loadPerformanceData();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-terminal-green';
    if (score >= 70) return 'text-terminal-yellow';
    return 'text-terminal-red';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-terminal-green text-black';
    if (score >= 70) return 'bg-terminal-yellow text-black';
    return 'bg-terminal-red text-white';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-terminal-cyan">Loading Performance Data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">Performance Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={refreshData}
            disabled={refreshing}
            className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={clearCache}
            className="btn-neon bg-terminal-red border-terminal-red hover:bg-terminal-red hover:text-black"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      {webVitals && (
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-terminal-cyan">
                {webVitals.performanceScore}
              </div>
              <Badge className={getScoreBadgeColor(webVitals.performanceScore)}>
                {webVitals.performanceScore >= 90 ? 'Excellent' : 
                 webVitals.performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <Progress 
              value={webVitals.performanceScore} 
              className="h-3 bg-matrix-dark mt-4"
            />
          </CardContent>
        </Card>
      )}

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webVitals && [
          { label: 'Largest Contentful Paint', value: webVitals.lcp, threshold: 2500, unit: 'ms', icon: <Clock className="h-4 w-4" /> },
          { label: 'First Input Delay', value: webVitals.fid, threshold: 100, unit: 'ms', icon: <Zap className="h-4 w-4" /> },
          { label: 'Cumulative Layout Shift', value: webVitals.cls, threshold: 0.1, unit: '', icon: <TrendingUp className="h-4 w-4" /> },
          { label: 'First Contentful Paint', value: webVitals.fcp, threshold: 1800, unit: 'ms', icon: <Activity className="h-4 w-4" /> },
          { label: 'Time to First Byte', value: webVitals.ttfb, threshold: 600, unit: 'ms', icon: <Wifi className="h-4 w-4" /> },
          { label: 'Page Load Time', value: webVitals.pageLoadTime, threshold: 3000, unit: 'ms', icon: <Clock className="h-4 w-4" /> }
        ].map((metric, index) => (
          <Card key={index} className="terminal-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-terminal-cyan flex items-center">
                {metric.icon}
                <span className="ml-2">{metric.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-terminal-green">
                    {metric.unit === 'ms' ? formatTime(metric.value) : metric.value.toFixed(3)}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${metric.value <= metric.threshold ? 'text-terminal-green border-terminal-green' : 'text-terminal-red border-terminal-red'}`}
                  >
                    {metric.value <= metric.threshold ? 'Good' : 'Poor'}
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                  className="h-2 bg-matrix-dark"
                />
                <div className="text-xs text-terminal-cyan">
                  Threshold: {metric.unit === 'ms' ? formatTime(metric.threshold) : metric.threshold}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cache Statistics */}
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-lg text-terminal-cyan flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Cache Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cacheStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-matrix-darker rounded-md">
                <div>
                  <div className="text-terminal-green font-semibold">{stat.name}</div>
                  <div className="text-sm text-terminal-cyan">
                    {stat.size} entries • Version {stat.version}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-terminal-purple font-semibold">
                    {stat.hitRate.toFixed(1)}% hit rate
                  </div>
                  <div className="text-xs text-terminal-cyan">
                    Updated: {stat.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      {memoryUsage && (
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-terminal-green">Heap Usage:</span>
                <span className="text-terminal-cyan">{formatBytes(memoryUsage.usedJSHeapSize)}</span>
              </div>
              <Progress 
                value={memoryUsage.usagePercentage} 
                className="h-3 bg-matrix-dark"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-terminal-green">Total Heap:</div>
                  <div className="text-terminal-cyan">{formatBytes(memoryUsage.totalJSHeapSize)}</div>
                </div>
                <div>
                  <div className="text-terminal-green">Heap Limit:</div>
                  <div className="text-terminal-cyan">{formatBytes(memoryUsage.jsHeapSizeLimit)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Information */}
      {networkInfo && (
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <Wifi className="h-5 w-5 mr-2" />
              Network Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-terminal-green text-sm">Connection Type:</div>
                <div className="text-terminal-cyan font-semibold">{networkInfo.effectiveType}</div>
              </div>
              <div>
                <div className="text-terminal-green text-sm">Downlink:</div>
                <div className="text-terminal-cyan font-semibold">{networkInfo.downlink} Mbps</div>
              </div>
              <div>
                <div className="text-terminal-green text-sm">RTT:</div>
                <div className="text-terminal-cyan font-semibold">{networkInfo.rtt} ms</div>
              </div>
              <div>
                <div className="text-terminal-green text-sm">Save Data:</div>
                <div className="text-terminal-cyan font-semibold">
                  {networkInfo.saveData ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-md border ${
                  alert.severity === 'critical' ? 'bg-terminal-red/20 border-terminal-red' :
                  alert.severity === 'error' ? 'bg-terminal-yellow/20 border-terminal-yellow' :
                  'bg-terminal-blue/20 border-terminal-blue'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-terminal-green font-semibold">{alert.metric}</div>
                      <div className="text-sm text-terminal-cyan">
                        Value: {alert.value} | Threshold: {alert.threshold}
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`${
                        alert.severity === 'critical' ? 'text-terminal-red border-terminal-red' :
                        alert.severity === 'error' ? 'text-terminal-yellow border-terminal-yellow' :
                        'text-terminal-blue border-terminal-blue'
                      }`}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tips */}
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-lg text-terminal-cyan flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Performance Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Optimize Images</div>
                <div className="text-sm text-terminal-cyan">Use WebP format and lazy loading for better performance</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Enable Compression</div>
                <div className="text-sm text-terminal-cyan">Use gzip compression for text assets</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Minimize JavaScript</div>
                <div className="text-sm text-terminal-cyan">Remove unused code and minimize bundle size</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Use CDN</div>
                <div className="text-sm text-terminal-cyan">Serve static assets from a CDN for faster delivery</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebVitals;