'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AuditLog {
  _id: string;
  action: string;
  userId: string;
  userName: string;
  userEmail: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failure' | 'warning'>('all');
  const [filterAction, setFilterAction] = useState<'all' | 'login' | 'logout' | 'create' | 'update' | 'delete' | 'admin'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchAuditLogs();
  }, [session, status, router, dateRange]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end,
        severity: filterSeverity,
        status: filterStatus,
        action: filterAction,
        search: searchQuery
      });

      const response = await fetch(`/api/admin/audit?${params}`);
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end,
        severity: filterSeverity,
        status: filterStatus,
        action: filterAction,
        search: searchQuery,
        format: 'csv'
      });

      const response = await fetch(`/api/admin/audit/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${dateRange.start}-to-${dateRange.end}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesAction;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-terminal-red';
      case 'high': return 'text-terminal-orange';
      case 'medium': return 'text-terminal-yellow';
      case 'low': return 'text-terminal-green';
      default: return 'text-terminal-cyan';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-terminal-green" />;
      case 'failure': return <XCircle className="w-4 h-4 text-terminal-red" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-terminal-yellow" />;
      default: return <Activity className="w-4 h-4 text-terminal-cyan" />;
    }
  };

  if (loading) {
    return (
      <div className="生产-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matrix-darker text-terminal-green p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-glow mb-2">
            Audit Logs
          </h1>
          <p className="text-terminal-cyan">
            Monitor system activities and security events
          </p>
        </div>

        {/* Filters */}
        <div className="card-holographic p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-terminal-cyan text-sm mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-terminal-cyan" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green placeholder-terminal-cyan focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-terminal-cyan text-sm mb-2">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
                className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-terminal-cyan text-sm mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            <div>
              <label className="block text-terminal-cyan text-sm mb-2">Action</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as any)}
                className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-terminal-cyan text-sm mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              />
            </div>

            <div>
              <label className="block text-terminal-cyan text-sm mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={fetchAuditLogs}
              className="px-4 py-2 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 transition-colors"
            >
              Apply Filters
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="card-holographic overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Timestamp</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Action</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Resource</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Severity</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-green/20">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-black/10">
                    <td className="px-6 py-4 text-terminal-cyan text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-terminal-green">{log.userName}</div>
                        <div className="text-terminal-cyan text-sm">{log.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-terminal-cyan">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-terminal-cyan">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className={log.status === 'success' ? 'text-terminal-green' : 
                                         log.status === 'failure' ? 'text-terminal-red' : 
                                         'text-terminal-yellow'}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-terminal-cyan text-sm">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-terminal-cyan text-sm">
            Showing {filteredLogs.length} of {logs.length} audit logs
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
