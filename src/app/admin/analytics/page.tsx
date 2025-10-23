'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FolderOpen, 
  DollarSign,
  Activity,
  Eye,
  Clock,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalDonations: number;
  totalRevenue: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  projectGrowth: number;
  donationGrowth: number;
  revenueGrowth: number;
  userActivity: Array<{
    date: string;
    users: number;
    projects: number;
    donations: number;
    revenue: number;
  }>;
  projectCategories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  userTypes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  topProjects: Array<{
    title: string;
    creator: string;
    funding: number;
    goal: number;
    backers: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
    user: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchAnalytics();
  }, [session, status, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?range=${timeRange}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <p className="text-terminal-red">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const COLORS = ['#39FF14', '#00DDEB', '#8B5CF6', '#FF10F0', '#FF8C00', '#FF6B6B'];

  return (
    <div className="min-h-screen bg-matrix-darker text-terminal-green p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold neon-glow mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-terminal-cyan">
                Platform performance and user insights
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-terminal-cyan" />
                <h3 className="text-terminal-cyan font-semibold">Total Users</h3>
              </div>
              <div className="flex items-center gap-1">
                {analytics.userGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4 text-terminal-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-terminal-red" />
                )}
                <span className={`text-sm ${analytics.userGrowth > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {analytics.userGrowth > 0 ? '+' : ''}{analytics.userGrowth}%
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-terminal-green mb-2">
              {analytics.totalUsers.toLocaleString()}
            </div>
            <p className="text-terminal-cyan text-sm">
              {analytics.newUsers} new this period
            </p>
          </div>

          <div className="card-holographic p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-terminal-purple" />
                <h3 className="text-terminal-purple font-semibold">Projects</h3>
              </div>
              <div className="flex items-center gap-1">
                {analytics.projectGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4 text-terminal-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-terminal-red" />
                )}
                <span className={`text-sm ${analytics.projectGrowth > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {analytics.projectGrowth > 0 ? '+' : ''}{analytics.projectGrowth}%
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-terminal-purple mb-2">
              {analytics.totalProjects.toLocaleString()}
            </div>
            <p className="text-terminal-cyan text-sm">
              {analytics.activeUsers} active creators
            </p>
          </div>

          <div className="card-holographic p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-terminal-orange" />
                <h3 className="text-terminal-orange font-semibold">Revenue</h3>
              </div>
              <div className="flex items-center gap-1">
                {analytics.revenueGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4 text-terminal-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-terminal-red" />
                )}
                <span className={`text-sm ${analytics.revenueGrowth > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {analytics.revenueGrowth > 0 ? '+' : ''}{analytics.revenueGrowth}%
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-terminal-orange mb-2">
              ${analytics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-terminal-cyan text-sm">
              {analytics.totalDonations} total donations
            </p>
          </div>

          <div className="card-holographic p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-terminal-pink" />
                <h3 className="text-terminal-pink font-semibold">Active Users</h3>
              </div>
            </div>
            <div className="text-3xl font-bold text-terminal-pink mb-2">
              {analytics.activeUsers.toLocaleString()}
            </div>
            <p className="text-terminal-cyan text-sm">
              Last 24 hours
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Activity Chart */}
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              User Activity Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.userActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#39FF1440" />
                <XAxis dataKey="date" stroke="#39FF14" />
                <YAxis stroke="#39FF14" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #39FF14', color: '#39FF14' }}
                  itemStyle={{ color: '#39FF14' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#00DDEB"
                  fill="#00DDEB40"
                />
                <Area
                  type="monotone"
                  dataKey="projects"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="#8B5CF640"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Project Categories */}
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              Project Categories
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={analytics.projectCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.projectCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #39FF14', color: '#39FF14' }}
                  itemStyle={{ color: '#39FF14' }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Projects */}
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              Top Projects
            </h2>
            <div className="space-y-4">
              {analytics.topProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-terminal-green/20 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-terminal-green">{project.title}</h3>
                    <p className="text-terminal-cyan text-sm">by {project.creator}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-terminal-cyan">
                      <span>{project.backers} backers</span>
                      <span>${project.funding.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-terminal-green font-semibold">
                      {Math.round((project.funding / project.goal) * 100)}%
                    </div>
                    <div className="text-terminal-cyan text-sm">
                      of ${project.goal.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-holographic p-6">
            <h2 className="text-2xl font-bold text-terminal-green mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-terminal-green rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-terminal-cyan text-sm">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-terminal-green text-xs">{activity.user}</span>
                      <span className="text-terminal-cyan text-xs">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
