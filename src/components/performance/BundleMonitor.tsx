'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

interface BundleInfo {
  name: string;
  size: number;
  gzippedSize?: number;
  lastModified: Date;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
}

interface BundleStats {
  totalSize: number;
  totalGzippedSize: number;
  bundleCount: number;
  largestBundle: BundleInfo | null;
  averageSize: number;
  performanceScore: number;
}

const BundleMonitor: React.FC = () => {
  const [bundles, setBundles] = useState<BundleInfo[]>([]);
  const [stats, setStats] = useState<BundleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBundleData();
  }, []);

  const loadBundleData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate bundle data - in real implementation, this would come from webpack stats
      const mockBundles: BundleInfo[] = [
        {
          name: 'main.js',
          size: 245760, // 240KB
          gzippedSize: 61440, // 60KB
          lastModified: new Date(),
          type: 'js'
        },
        {
          name: 'vendor.js',
          size: 512000, // 500KB
          gzippedSize: 128000, // 125KB
          lastModified: new Date(),
          type: 'js'
        },
        {
          name: 'styles.css',
          size: 51200, // 50KB
          gzippedSize: 12800, // 12.5KB
          lastModified: new Date(),
          type: 'css'
        },
        {
          name: 'images',
          size: 1024000, // 1MB
          lastModified: new Date(),
          type: 'image'
        },
        {
          name: 'fonts',
          size: 256000, // 250KB
          lastModified: new Date(),
          type: 'font'
        }
      ];

      setBundles(mockBundles);

      // Calculate stats
      const totalSize = mockBundles.reduce((sum, bundle) => sum + bundle.size, 0);
      const totalGzippedSize = mockBundles.reduce((sum, bundle) => sum + (bundle.gzippedSize || bundle.size), 0);
      const largestBundle = mockBundles.reduce((largest, bundle) => 
        bundle.size > largest.size ? bundle : largest, mockBundles[0]
      );
      const averageSize = totalSize / mockBundles.length;
      
      // Calculate performance score based on bundle size
      const performanceScore = Math.max(0, 100 - (totalSize / 1024 / 1024) * 10); // Penalty for MB

      setStats({
        totalSize,
        totalGzippedSize,
        bundleCount: mockBundles.length,
        largestBundle,
        averageSize,
        performanceScore
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bundle data');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBundleTypeColor = (type: string) => {
    switch (type) {
      case 'js': return 'text-terminal-cyan';
      case 'css': return 'text-terminal-purple';
      case 'image': return 'text-terminal-green';
      case 'font': return 'text-terminal-yellow';
      default: return 'text-terminal-cyan';
    }
  };

  const getBundleTypeIcon = (type: string) => {
    switch (type) {
      case 'js': return '📦';
      case 'css': return '🎨';
      case 'image': return '🖼️';
      case 'font': return '🔤';
      default: return '📁';
    }
  };

  const getPerformanceScoreColor = (score: number) => {
    if (score >= 90) return 'text-terminal-green';
    if (score >= 70) return 'text-terminal-yellow';
    return 'text-terminal-red';
  };

  const getPerformanceScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-terminal-green text-black';
    if (score >= 70) return 'bg-terminal-yellow text-black';
    return 'bg-terminal-red text-white';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-terminal-cyan">Loading Bundle Data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-terminal-red text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Error: {error}</p>
          <Button 
            onClick={loadBundleData}
            className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">Bundle Size Monitor</h1>
        <Button 
          onClick={loadBundleData}
          className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Bundle Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="terminal-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-terminal-green">Total Size</p>
                  <p className="text-2xl font-bold text-terminal-cyan">{formatBytes(stats.totalSize)}</p>
                </div>
                <Package className="h-8 w-8 text-terminal-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-terminal-green">Gzipped Size</p>
                  <p className="text-2xl font-bold text-terminal-cyan">{formatBytes(stats.totalGzippedSize)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-terminal-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-terminal-green">Bundle Count</p>
                  <p className="text-2xl font-bold text-terminal-cyan">{stats.bundleCount}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-terminal-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-terminal-green">Performance Score</p>
                  <p className="text-2xl font-bold text-terminal-cyan">{stats.performanceScore.toFixed(0)}</p>
                </div>
                <Badge className={getPerformanceScoreBadge(stats.performanceScore)}>
                  {stats.performanceScore >= 90 ? 'Excellent' : 
                   stats.performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bundle Details */}
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-lg text-terminal-cyan flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Bundle Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bundles.map((bundle, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-matrix-darker rounded-md">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getBundleTypeIcon(bundle.type)}</span>
                  <div>
                    <div className="text-terminal-green font-semibold">{bundle.name}</div>
                    <div className="text-sm text-terminal-cyan">
                      {bundle.type.toUpperCase()} • Modified: {bundle.lastModified.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-terminal-purple font-semibold">
                    {formatBytes(bundle.size)}
                  </div>
                  {bundle.gzippedSize && (
                    <div className="text-sm text-terminal-cyan">
                      Gzipped: {formatBytes(bundle.gzippedSize)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-lg text-terminal-cyan flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats && stats.totalSize > 1024 * 1024 && (
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-4 w-4 text-terminal-yellow mt-1 flex-shrink-0" />
                <div>
                  <div className="text-terminal-yellow font-semibold">Large Bundle Size</div>
                  <div className="text-sm text-terminal-cyan">
                    Consider code splitting and lazy loading to reduce initial bundle size
                  </div>
                </div>
              </div>
            )}
            
            {stats && stats.largestBundle && stats.largestBundle.size > 512 * 1024 && (
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-4 w-4 text-terminal-yellow mt-1 flex-shrink-0" />
                <div>
                  <div className="text-terminal-yellow font-semibold">Large Individual Bundle</div>
                  <div className="text-sm text-terminal-cyan">
                    {stats.largestBundle.name} is {formatBytes(stats.largestBundle.size)}. Consider splitting it further.
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Enable Compression</div>
                <div className="text-sm text-terminal-cyan">
                  Use gzip compression to reduce bundle sizes by up to 70%
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Tree Shaking</div>
                <div className="text-sm text-terminal-cyan">
                  Remove unused code to reduce bundle size
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BundleMonitor;
