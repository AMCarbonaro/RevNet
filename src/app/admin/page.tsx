'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FolderOpen, 
  MessageSquare, 
  Shield, 
  BarChart3, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { User, Project, Letter, Donation } from '@/types';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalDonations: number;
  totalRevenue: number;
  activeUsers: number;
  pendingProjects: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchAdminStats();
  }, [session, status, router]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-terminal-red mx-auto mb-4" />
          <p className="text-terminal-red">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const adminCards = [
    {
      title: 'Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-terminal-cyan',
      bgColor: 'bg-terminal-cyan/10',
      borderColor: 'border-terminal-cyan',
      link: '/admin/users',
      description: 'Total registered users'
    },
    {
      title: 'Projects',
      value: stats.totalProjects.toLocaleString(),
      icon: FolderOpen,
      color: 'text-terminal-purple',
      bgColor: 'bg-terminal-purple/10',
      borderColor: 'border-terminal-purple',
      link: '/admin/projects',
      description: 'Total projects created'
    },
    {
      title: 'Donations',
      value: stats.totalDonations.toLocaleString(),
      icon: MessageSquare,
      color: 'text-terminal-green',
      bgColor: 'bg-terminal-green/10',
      borderColor: 'border-terminal-green',
      link: '/admin/donations',
      description: 'Total donations received'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-terminal-orange',
      bgColor: 'bg-terminal-orange/10',
      borderColor: 'border-terminal-orange',
      link: '/admin/revenue',
      description: 'Total platform revenue'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: Activity,
      color: 'text-terminal-pink',
      bgColor: 'bg-terminal-pink/10',
      borderColor: 'border-terminal-pink',
      link: '/admin/activity',
      description: 'Users active in last 24h'
    },
    {
      title: 'Pending Projects',
      value: stats.pendingProjects.toLocaleString(),
      icon: Clock,
      color: 'text-terminal-red',
      bgColor: 'bg-terminal-red/10',
      borderColor: 'border-terminal-red',
      link: '/admin/moderation',
      description: 'Projects awaiting approval'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      link: '/admin/users',
      color: 'text-terminal-cyan'
    },
    {
      title: 'Content Moderation',
      description: 'Review and approve projects',
      icon: Shield,
      link: '/admin/moderation',
      color: 'text-terminal-red'
    },
    {
      title: 'Analytics',
      description: 'View platform analytics and reports',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'text-terminal-purple'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      link: '/admin/settings',
      color: 'text-terminal-orange'
    }
  ];

  return (
    <div className="min-h-screen bg-matrix-darker text-terminal-green p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-glow mb-2">
            Admin Dashboard
          </h1>
          <p className="text-terminal-cyan">
            Manage and monitor the Revolution Network platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminCards.map((card, index) => (
            <Link
              key={index}
              href={card.link}
              className="group block"
            >
              <div className={`
                card-holographic p-6 hover:shadow-lg transition-all duration-300
                ${card.bgColor} ${card.borderColor}
                group-hover:scale-105
              `}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${card.color}`}>
                      {card.value}
                    </div>
                  </div>
                </div>
                <h3 className={`font-semibold ${card.color} mb-1`}>
                  {card.title}
                </h3>
                <p className="text-terminal-cyan text-sm">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="card-holographic p-6">
              <h2 className="text-2xl font-bold text-terminal-green mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.link}
                    className="block p-4 border border-terminal-green/20 rounded-lg hover:border-terminal-green hover:bg-terminal-green/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                      <h3 className="font-semibold text-terminal-green">
                        {action.title}
                      </h3>
                    </div>
                    <p className="text-terminal-cyan text-sm">
                      {action.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="card-holographic p-6">
              <h2 className="text-2xl font-bold text-terminal-green mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-terminal-green rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-terminal-cyan text-sm">
                          {activity.description}
                        </p>
                        <p className="text-terminal-green text-xs mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-terminal-cyan text-sm">
                    No recent activity
                  </p>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="card-holographic p-6 mt-6">
              <h2 className="text-2xl font-bold text-terminal-green mb-6">
                System Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">Database</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-terminal-green" />
                    <span className="text-terminal-green text-sm">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">API</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-terminal-green" />
                    <span className="text-terminal-green text-sm">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">Payments</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-terminal-green" />
                    <span className="text-terminal-green text-sm">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-terminal-cyan">Email</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-terminal-green" />
                    <span className="text-terminal-green text-sm">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
