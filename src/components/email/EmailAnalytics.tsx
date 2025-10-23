'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Mail, 
  Send, 
  Eye, 
  MousePointer, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { emailAutomationManager } from '@/lib/email-automation';

interface EmailAnalyticsProps {
  campaignId?: string;
  dateRange?: { start: Date; end: Date };
}

interface AnalyticsData {
  campaigns: any[];
  templates: any[];
  automations: any[];
  metrics: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  };
  trends: {
    daily: Array<{ date: string; sent: number; opened: number; clicked: number }>;
    weekly: Array<{ week: string; sent: number; opened: number; clicked: number }>;
    monthly: Array<{ month: string; sent: number; opened: number; clicked: number }>;
  };
  topTemplates: Array<{ template: string; sent: number; openRate: number; clickRate: number }>;
  topCampaigns: Array<{ campaign: string; sent: number; openRate: number; clickRate: number }>;
}

const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({
  campaignId,
  dateRange
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMetric, setSelectedMetric] = useState<'sent' | 'opened' | 'clicked'>('sent');

  useEffect(() => {
    loadAnalytics();
  }, [campaignId, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data - in real implementation, this would come from the API
      const mockData: AnalyticsData = {
        campaigns: emailAutomationManager.getAllCampaigns(),
        templates: emailAutomationManager.getAllTemplates(),
        automations: emailAutomationManager.getAllAutomations(),
        metrics: {
          totalSent: 12543,
          totalDelivered: 11892,
          totalOpened: 8923,
          totalClicked: 3456,
          totalBounced: 651,
          totalUnsubscribed: 234,
          deliveryRate: 94.8,
          openRate: 75.0,
          clickRate: 29.1,
          bounceRate: 5.2,
          unsubscribeRate: 2.0
        },
        trends: {
          daily: [
            { date: '2024-01-01', sent: 120, opened: 90, clicked: 35 },
            { date: '2024-01-02', sent: 150, opened: 115, clicked: 42 },
            { date: '2024-01-03', sent: 180, opened: 135, clicked: 52 },
            { date: '2024-01-04', sent: 200, opened: 150, clicked: 58 },
            { date: '2024-01-05', sent: 220, opened: 165, clicked: 65 },
            { date: '2024-01-06', sent: 190, opened: 142, clicked: 55 },
            { date: '2024-01-07', sent: 160, opened: 120, clicked: 45 }
          ],
          weekly: [
            { week: 'Week 1', sent: 850, opened: 640, clicked: 245 },
            { week: 'Week 2', sent: 920, opened: 690, clicked: 265 },
            { week: 'Week 3', sent: 1050, opened: 790, clicked: 305 },
            { week: 'Week 4', sent: 980, opened: 735, clicked: 285 }
          ],
          monthly: [
            { month: 'Jan', sent: 3800, opened: 2850, clicked: 1100 },
            { month: 'Feb', sent: 4200, opened: 3150, clicked: 1220 },
            { month: 'Mar', sent: 4500, opened: 3375, clicked: 1305 }
          ]
        },
        topTemplates: [
          { template: 'Welcome Email', sent: 2500, openRate: 78.5, clickRate: 32.1 },
          { template: 'Project Update', sent: 1800, openRate: 72.3, clickRate: 28.7 },
          { template: 'Newsletter', sent: 1500, openRate: 68.9, clickRate: 25.4 },
          { template: 'Donation Receipt', sent: 1200, openRate: 82.1, clickRate: 35.2 }
        ],
        topCampaigns: [
          { campaign: 'Welcome Series', sent: 3000, openRate: 76.2, clickRate: 30.8 },
          { campaign: 'Project Updates', sent: 2200, openRate: 71.5, clickRate: 27.9 },
          { campaign: 'Newsletter', sent: 1800, openRate: 69.3, clickRate: 26.1 },
          { campaign: 'Security Alerts', sent: 1500, openRate: 85.7, clickRate: 38.4 }
        ]
      };

      setAnalytics(mockData);
    } catch (error) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value: number, type: 'rate' | 'count') => {
    if (type === 'rate') {
      if (value >= 80) return 'text-terminal-green';
      if (value >= 60) return 'text-terminal-yellow';
      return 'text-terminal-red';
    } else {
      return 'text-terminal-cyan';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'sent': return <Send className="h-4 w-4" />;
      case 'opened': return <Eye className="h-4 w-4" />;
      case 'clicked': return <MousePointer className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const downloadReport = () => {
    if (!analytics) return;

    const report = `Email Analytics Report

Generated: ${new Date().toLocaleString()}
Period: ${selectedPeriod}

Overall Metrics:
- Total Sent: ${analytics.metrics.totalSent}
- Total Delivered: ${analytics.metrics.totalDelivered}
- Total Opened: ${analytics.metrics.totalOpened}
- Total Clicked: ${analytics.metrics.totalClicked}
- Delivery Rate: ${analytics.metrics.deliveryRate}%
- Open Rate: ${analytics.metrics.openRate}%
- Click Rate: ${analytics.metrics.clickRate}%
- Bounce Rate: ${analytics.metrics.bounceRate}%
- Unsubscribe Rate: ${analytics.metrics.unsubscribeRate}%

Top Templates:
${analytics.topTemplates.map(t => `- ${t.template}: ${t.sent} sent, ${t.openRate}% open rate, ${t.clickRate}% click rate`).join('\n')}

Top Campaigns:
${analytics.topCampaigns.map(c => `- ${c.campaign}: ${c.sent} sent, ${c.openRate}% open rate, ${c.clickRate}% click rate`).join('\n')}`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-analytics-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-terminal-cyan">Loading Analytics...</div>
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
            onClick={loadAnalytics}
            className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const currentTrendData = analytics.trends[selectedPeriod];
  const pieData = [
    { name: 'Opened', value: analytics.metrics.totalOpened, color: '#39FF14' },
    { name: 'Clicked', value: analytics.metrics.totalClicked, color: '#00FF00' },
    { name: 'Bounced', value: analytics.metrics.totalBounced, color: '#FF4444' },
    { name: 'Unsubscribed', value: analytics.metrics.totalUnsubscribed, color: '#FFAA00' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">Email Analytics</h1>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={loadAnalytics}
            className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={downloadReport}
            className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Total Sent</p>
                <p className={`text-2xl font-bold ${getMetricColor(analytics.metrics.totalSent, 'count')}`}>
                  {analytics.metrics.totalSent.toLocaleString()}
                </p>
              </div>
              <Send className="h-8 w-8 text-terminal-purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Open Rate</p>
                <p className={`text-2xl font-bold ${getMetricColor(analytics.metrics.openRate, 'rate')}`}>
                  {analytics.metrics.openRate}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-terminal-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Click Rate</p>
                <p className={`text-2xl font-bold ${getMetricColor(analytics.metrics.clickRate, 'rate')}`}>
                  {analytics.metrics.clickRate}%
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-terminal-yellow" />
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Delivery Rate</p>
                <p className={`text-2xl font-bold ${getMetricColor(analytics.metrics.deliveryRate, 'rate')}`}>
                  {analytics.metrics.deliveryRate}%
                </p>
              </div>
              <Mail className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Card className="terminal-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Email Trends
              </CardTitle>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="p-2 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="p-2 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded text-sm"
                >
                  <option value="sent">Sent</option>
                  <option value="opened">Opened</option>
                  <option value="clicked">Clicked</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey={selectedPeriod === 'daily' ? 'date' : selectedPeriod === 'weekly' ? 'week' : 'month'}
                  stroke="#39FF14"
                  fontSize={12}
                />
                <YAxis stroke="#39FF14" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid #39FF14',
                    color: '#39FF14'
                  }}
                />
                <Bar 
                  dataKey={selectedMetric} 
                  fill="#39FF14" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Email Distribution */}
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Email Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid #39FF14',
                    color: '#39FF14'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Templates and Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Templates */}
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Top Performing Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topTemplates.map((template, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-matrix-darker rounded-md">
                  <div>
                    <div className="text-terminal-green font-semibold">{template.template}</div>
                    <div className="text-sm text-terminal-cyan">
                      {template.sent.toLocaleString()} sent
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-terminal-purple font-semibold">
                      {template.openRate}% open rate
                    </div>
                    <div className="text-sm text-terminal-cyan">
                      {template.clickRate}% click rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Performing Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-matrix-darker rounded-md">
                  <div>
                    <div className="text-terminal-green font-semibold">{campaign.campaign}</div>
                    <div className="text-sm text-terminal-cyan">
                      {campaign.sent.toLocaleString()} sent
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-terminal-purple font-semibold">
                      {campaign.openRate}% open rate
                    </div>
                    <div className="text-sm text-terminal-cyan">
                      {campaign.clickRate}% click rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-lg text-terminal-cyan flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-terminal-green">
                {analytics.metrics.openRate > 70 ? 'Excellent' : analytics.metrics.openRate > 50 ? 'Good' : 'Needs Improvement'}
              </div>
              <div className="text-sm text-terminal-cyan">Open Rate Performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-terminal-blue">
                {analytics.metrics.clickRate > 25 ? 'Excellent' : analytics.metrics.clickRate > 15 ? 'Good' : 'Needs Improvement'}
              </div>
              <div className="text-sm text-terminal-cyan">Click Rate Performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-terminal-purple">
                {analytics.metrics.bounceRate < 5 ? 'Excellent' : analytics.metrics.bounceRate < 10 ? 'Good' : 'Needs Improvement'}
              </div>
              <div className="text-sm text-terminal-cyan">Bounce Rate Performance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalytics;
