'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, Target, Download } from 'lucide-react';

interface AnalyticsData {
  userGrowth: Array<{ date: string; users: number; newUsers: number }>;
  fundingTrends: Array<{ date: string; amount: number; projects: number }>;
  projectCategories: Array<{ name: string; value: number; color: string }>;
  letterProgress: Array<{ letter: number; completed: number; percentage: number }>;
  topProjects: Array<{ name: string; funding: number; backers: number }>;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual endpoint
      const mockData: AnalyticsData = {
        userGrowth: generateUserGrowthData(),
        fundingTrends: generateFundingTrendsData(),
        projectCategories: [
          { name: 'Political Campaign', value: 35, color: '#39FF14' },
          { name: 'Community Organization', value: 25, color: '#00DDEB' },
          { name: 'Grassroots Movement', value: 20, color: '#8B5CF6' },
          { name: 'Educational Initiative', value: 12, color: '#FF10F0' },
          { name: 'Media Project', value: 8, color: '#FF8C00' }
        ],
        letterProgress: generateLetterProgressData(),
        topProjects: generateTopProjectsData()
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUserGrowthData = () => {
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 1000) + 5000,
        newUsers: Math.floor(Math.random() * 50) + 20
      });
    }
    return data;
  };

  const generateFundingTrendsData = () => {
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 50000) + 10000,
        projects: Math.floor(Math.random() * 20) + 5
      });
    }
    return data;
  };

  const generateLetterProgressData = () => {
    const data = [];
    for (let i = 1; i <= 30; i++) {
      data.push({
        letter: i,
        completed: Math.floor(Math.random() * 1000) + 100,
        percentage: Math.floor(Math.random() * 100)
      });
    }
    return data;
  };

  const generateTopProjectsData = () => {
    return [
      { name: 'Local Election Campaign', funding: 125000, backers: 450 },
      { name: 'Community Garden Initiative', funding: 89000, backers: 320 },
      { name: 'Youth Education Program', funding: 67000, backers: 280 },
      { name: 'Environmental Protection', funding: 54000, backers: 190 },
      { name: 'Healthcare Access Reform', funding: 42000, backers: 160 }
    ];
  };

  const exportData = (format: 'csv' | 'pdf') => {
    if (!analyticsData) return;
    
    if (format === 'csv') {
      // Generate CSV content
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Metric,Value\n" +
        `Total Users,${analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.users || 0}\n` +
        `Total Funding,${analyticsData.fundingTrends.reduce((sum, item) => sum + item.amount, 0)}\n` +
        `Active Projects,${analyticsData.topProjects.length}`;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "revolution_analytics.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="card-holographic p-6">
        <div className="text-center py-8">
          <div className="text-terminal-green">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="card-holographic p-6">
        <div className="text-center py-8">
          <div className="text-terminal-red">Failed to load analytics data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="card-holographic p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-terminal-green neon-glow">
            Analytics Dashboard
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button
              onClick={() => exportData('csv')}
              className="btn-neon text-sm px-4 py-2 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-holographic p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-terminal-cyan text-sm">Total Users</p>
              <p className="text-2xl font-bold text-terminal-green">
                {analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.users.toLocaleString()}
              </p>
              <p className="text-terminal-cyan text-xs">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12% from last period
              </p>
            </div>
            <Users className="w-8 h-8 text-terminal-green" />
          </div>
        </div>

        <div className="card-holographic p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-terminal-cyan text-sm">Total Funding</p>
              <p className="text-2xl font-bold text-terminal-green">
                ${analyticsData.fundingTrends.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </p>
              <p className="text-terminal-cyan text-xs">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +8% from last period
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-terminal-green" />
          </div>
        </div>

        <div className="card-holographic p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-terminal-cyan text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-terminal-green">
                {analyticsData.topProjects.length}
              </p>
              <p className="text-terminal-cyan text-xs">
                <Target className="w-3 h-3 inline mr-1" />
                {analyticsData.projectCategories.length} categories
              </p>
            </div>
            <Target className="w-8 h-8 text-terminal-green" />
          </div>
        </div>

        <div className="card-holographic p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-terminal-cyan text-sm">Avg. Completion</p>
              <p className="text-2xl font-bold text-terminal-green">
                {Math.round(analyticsData.letterProgress.reduce((sum, item) => sum + item.percentage, 0) / analyticsData.letterProgress.length)}%
              </p>
              <p className="text-terminal-cyan text-xs">
                Letter progress
              </p>
            </div>
            <Calendar className="w-8 h-8 text-terminal-green" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="card-holographic p-6">
          <h3 className="text-lg font-bold text-terminal-green mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#00DDEB"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#00DDEB" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000', 
                  border: '1px solid #39FF14',
                  borderRadius: '8px',
                  color: '#39FF14'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#39FF14" 
                fill="#39FF14" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funding Trends Chart */}
        <div className="card-holographic p-6">
          <h3 className="text-lg font-bold text-terminal-green mb-4">Funding Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.fundingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#00DDEB"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#00DDEB" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000', 
                  border: '1px solid #39FF14',
                  borderRadius: '8px',
                  color: '#39FF14'
                }}
              />
              <Bar dataKey="amount" fill="#39FF14" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Categories Pie Chart */}
        <div className="card-holographic p-6">
          <h3 className="text-lg font-bold text-terminal-green mb-4">Project Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.projectCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.projectCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000', 
                  border: '1px solid #39FF14',
                  borderRadius: '8px',
                  color: '#39FF14'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Projects */}
        <div className="card-holographic p-6">
          <h3 className="text-lg font-bold text-terminal-green mb-4">Top Projects</h3>
          <div className="space-y-3">
            {analyticsData.topProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded border border-terminal-green">
                <div>
                  <p className="text-terminal-green font-semibold">{project.name}</p>
                  <p className="text-terminal-cyan text-sm">{project.backers} backers</p>
                </div>
                <div className="text-right">
                  <p className="text-terminal-green font-bold">
                    ${project.funding.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
