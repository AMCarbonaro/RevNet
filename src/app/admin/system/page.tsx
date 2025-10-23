'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Database, 
  Server, 
  Mail, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastUpdated: Date;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime: number;
  lastCheck: Date;
  description: string;
}

interface SystemMetrics {
  requestsPerMinute: number;
  activeUsers: number;
  errorCount: number;
  averageResponseTime: number;
  databaseConnections: number;
  queueSize: number;
}

export default function SystemMonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchSystemData();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session, status, router, autoRefresh]);

  const fetchSystemData = async () => {
    try {
      const [healthResponse, servicesResponse, metricsResponse] = await Promise.all([
        fetch('/api/admin/system/health'),
        fetch('/api/admin/system/services'),
        fetch('/api/admin/system/metrics')
      ]);

      if (!healthResponse.ok || !servicesResponse.ok || !metricsResponse.ok) {
        throw new Error('Failed to fetch system data');
      }

      const [healthData, servicesData, metricsData] = await Promise.all([
        healthResponse.json(),
        servicesResponse.json(),
        metricsResponse.json()
      ]);

      setSystemHealth(healthData);
      setServices(servicesData);
      setMetrics(metricsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-terminal-green" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-terminal-yellow" />;
      case 'error': return <XCircle className="w-5 h-5 text-terminal-red" />;
      default: return <Minus className="w-5 h-5 text-terminal-cyan" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-terminal-green';
      case 'warning': return 'text-terminal-yellow';
      case 'error': return 'text-terminal-red';
      default: return 'text-terminal-cyan';
    }
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold) return <TrendingUp className="w-4 h-4 text-terminal-red" />;
    if (value < threshold) return <TrendingDown className="w-4 h-4 text-terminal-green" />;
    return <Minus className="w-4 h-4 text-terminal-cyan" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matrix-darker text-terminal-green p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold neon-glow mb-2">
                System Monitoring
              </h1>
              <p className="text-terminal-cyan">
                Monitor system health and performance
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-terminal-cyan">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                Auto Refresh
              </label>
              
              <button
                onClick={fetchSystemData}
                className="flex items-center gap-2 px-4 py-2 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-holographic p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-terminal-green" />
                  <h3 className="text-terminal-green font-semibold">System Status</h3>
                </div>
                {getStatusIcon(systemHealth.status)}
              </div>
              <div className="text-2xl font-bold text-terminal-green mb-2">
                {systemHealth.status.toUpperCase()}
              </div>
              <p className="text-terminal-cyan text-sm">
                Uptime: {Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m
              </p>
            </div>

            <div className="card-holographic p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-terminal-cyan" />
                  <h3 className="text-terminal-cyan font-semibold">Response Time</h3>
                </div>
                {getTrendIcon(systemHealth.responseTime, 1000)}
              </div>
              <div className="text-2xl font-bold text-terminal-cyan mb-2">
                {systemHealth.responseTime}ms
              </div>
              <p className="text-terminal-green text-sm">
                Average response time
              </p>
            </div>

            <div className="card-holographic p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-terminal-red" />
                  <h3 className="text-terminal-red font-semibold">Error Rate</h3>
                </div>
                {getTrendIcon(systemHealth.errorRate, 5)}
              </div>
              <div className="text-2xl font-bold text-terminal-red mb-2">
                {systemHealth.errorRate}%
              </div>
              <p className="text-terminal-cyan text-sm">
                Error rate in last hour
              </p>
            </div>

            <div className="card-holographic p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-6 h-6 text-terminal-purple" />
                  <h3 className="text-terminal-purple font-semibold">Memory Usage</h3>
                </div>
                {getTrendIcon(systemHealth.memoryUsage, 80)}
              </div>
              <div className="text-2xl font-bold text-terminal-purple mb-2">
                {systemHealth.memoryUsage}%
              </div>
              <p className="text-terminal-cyan text-sm">
                Memory utilization
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services Status */}
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              Services Status
            </h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-terminal-green/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-semibold text-terminal-green">{service.name}</h3>
                      <p className="text-terminal-cyan text-sm">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${getStatusColor(service.status)}`}>
                      {service.responseTime}ms
                    </div>
                    <div className="text-xs text-terminal-cyan">
                      {new Date(service.lastCheck).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Metrics */}
          {metrics && (
            <div className="card-holographic p-6">
              <h2 className="text-2xl font-bold text-terminal-green mb-6">
                Real-time Metrics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">Requests/min</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metrics.requestsPerMinute, 1000)}
                    <span className="text-terminal-green font-semibold">
                      {metrics.requestsPerMinute}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">Active Users</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metrics.activeUsers, 500)}
                    <span className="text-terminal-green font-semibold">
                      {metrics.activeUsers}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">Error Count</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metrics.errorCount, 10)}
                    <span className="text-terminal-red font-semibold">
                      {metrics.errorCount}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">Avg Response Time</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metrics.averageResponseTime, 1000)}
                    <span className="text-terminal-cyan font-semibold">
                      {metrics.averageResponseTime}ms
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">DB Connections</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metrics.databaseConnections, 50)}
                    <span className="text-terminal-purple font-semibold">
                      {metrics.databaseConnections}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">Queue Size</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metrics.queueSize, 100)}
                    <span className="text-terminal-orange font-semibold">
                      {metrics.queueSize}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Logs */}
        <div className="card-holographic p-6 mt-8">
          <h2 className="text-2xl font-bold text-terminal-green mb-6">
            Recent System Logs
          </h2>
          <div className="bg-black/20 border border-terminal-green/20 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-2 text-sm font-mono">
              <div className="text-terminal-green">[2024-01-15 10:30:15] INFO: System health check passed</div>
              <div className="text-terminal-cyan">[2024-01-15 10:29:45] INFO: Database connection pool healthy</div>
              <div className="text-terminal-green">[2024-01-15 10:29:30] INFO: Cache hit rate: 94.2%</div>
              <div className="text-terminal-yellow">[2024-01-15 10:29:15] WARN: High memory usage detected</div>
              <div className="text-terminal-green">[2024-01-15 10:29:00] INFO: User authentication service healthy</div>
              <div className="text-terminal-cyan">[2024-01-15 10:28:45] INFO: Payment processing service operational</div>
              <div className="text-terminal-green">[2024-01-15 10:28:30] INFO: Email service queue processed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
