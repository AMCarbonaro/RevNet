'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Users, 
  Calendar, 
  BarChart3, 
  Send, 
  Play, 
  Pause, 
  Stop, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  Settings,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { emailAutomationManager } from '@/lib/email-automation';

interface EmailCampaignManagerProps {
  onCampaignSelect?: (campaign: any) => void;
}

interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

const EmailCampaignManager: React.FC<EmailCampaignManagerProps> = ({
  onCampaignSelect
}) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    templateId: '',
    targetAudience: {
      type: 'all' as 'all' | 'segment' | 'custom',
      criteria: {}
    },
    schedule: {
      type: 'immediate' as 'immediate' | 'scheduled' | 'recurring',
      date: new Date(),
      interval: ''
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const campaignData = emailAutomationManager.getAllCampaigns();
      const templateData = emailAutomationManager.getAllTemplates();
      
      setCampaigns(campaignData);
      setTemplates(templateData);
    } catch (error) {
      setError('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      const campaign = emailAutomationManager.createCampaign(newCampaign);
      setCampaigns([...campaigns, campaign]);
      setShowCreateForm(false);
      setNewCampaign({
        name: '',
        description: '',
        templateId: '',
        targetAudience: { type: 'all', criteria: {} },
        schedule: { type: 'immediate', date: new Date(), interval: '' }
      });
    } catch (error) {
      setError('Failed to create campaign');
    }
  };

  const updateCampaignStatus = (campaignId: string, status: string) => {
    emailAutomationManager.updateCampaign(campaignId, { status });
    loadData();
  };

  const deleteCampaign = (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      // In real implementation, add delete method to emailAutomationManager
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-terminal-green text-black';
      case 'sending': return 'bg-terminal-yellow text-black';
      case 'scheduled': return 'bg-terminal-blue text-white';
      case 'paused': return 'bg-terminal-purple text-white';
      case 'cancelled': return 'bg-terminal-red text-white';
      default: return 'bg-matrix-dark text-terminal-cyan';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'sending': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'cancelled': return <Stop className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const calculateMetrics = (metrics: CampaignMetrics) => {
    const deliveryRate = metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0;
    const openRate = metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0;
    const clickRate = metrics.delivered > 0 ? (metrics.clicked / metrics.delivered) * 100 : 0;
    const bounceRate = metrics.sent > 0 ? (metrics.bounced / metrics.sent) * 100 : 0;
    const unsubscribeRate = metrics.delivered > 0 ? (metrics.unsubscribed / metrics.delivered) * 100 : 0;

    return {
      deliveryRate: deliveryRate.toFixed(1),
      openRate: openRate.toFixed(1),
      clickRate: clickRate.toFixed(1),
      bounceRate: bounceRate.toFixed(1),
      unsubscribeRate: unsubscribeRate.toFixed(1)
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-terminal-cyan">Loading Campaigns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">Email Campaign Manager</h1>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="bg-terminal-red/20 border-terminal-red">
          <AlertTriangle className="h-4 w-4 text-terminal-red" />
          <AlertDescription className="text-terminal-red">{error}</AlertDescription>
        </Alert>
      )}

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create New Campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-terminal-green mb-2">
                  Campaign Name
                </label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Enter campaign name"
                  className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-terminal-green mb-2">
                  Template
                </label>
                <select
                  value={newCampaign.templateId}
                  onChange={(e) => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
                  className="w-full p-2 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-terminal-green mb-2">
                Description
              </label>
              <Textarea
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                placeholder="Enter campaign description"
                rows={3}
                className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-terminal-green mb-2">
                  Target Audience
                </label>
                <select
                  value={newCampaign.targetAudience.type}
                  onChange={(e) => setNewCampaign({ 
                    ...newCampaign, 
                    targetAudience: { ...newCampaign.targetAudience, type: e.target.value as any }
                  })}
                  className="w-full p-2 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded"
                >
                  <option value="all">All Users</option>
                  <option value="segment">User Segment</option>
                  <option value="custom">Custom Criteria</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-terminal-green mb-2">
                  Schedule
                </label>
                <select
                  value={newCampaign.schedule.type}
                  onChange={(e) => setNewCampaign({ 
                    ...newCampaign, 
                    schedule: { ...newCampaign.schedule, type: e.target.value as any }
                  })}
                  className="w-full p-2 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded"
                >
                  <option value="immediate">Send Immediately</option>
                  <option value="scheduled">Schedule for Later</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={createCampaign}
                className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
              >
                <Send className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-black"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const metrics = calculateMetrics(campaign.metrics);
          const template = templates.find(t => t.id === campaign.templateId);
          
          return (
            <Card key={campaign.id} className="terminal-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-terminal-cyan flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    {campaign.name}
                  </CardTitle>
                  <Badge className={getStatusColor(campaign.status)}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1">{campaign.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-terminal-cyan text-sm">{campaign.description}</p>
                  <p className="text-terminal-green text-xs mt-1">
                    Template: {template?.name || 'Unknown'}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-terminal-green">{campaign.metrics.sent}</div>
                    <div className="text-xs text-terminal-cyan">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-terminal-blue">{metrics.openRate}%</div>
                    <div className="text-xs text-terminal-cyan">Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-terminal-purple">{metrics.clickRate}%</div>
                    <div className="text-xs text-terminal-cyan">Click Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-terminal-yellow">{metrics.deliveryRate}%</div>
                    <div className="text-xs text-terminal-cyan">Delivery</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-matrix-dark">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCampaign(campaign)}
                      className="text-terminal-blue hover:text-terminal-cyan"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCampaignSelect?.(campaign)}
                      className="text-terminal-green hover:text-terminal-cyan"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCampaign(campaign.id)}
                      className="text-terminal-red hover:text-terminal-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {campaign.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => updateCampaignStatus(campaign.id, 'sending')}
                        className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {campaign.status === 'sending' && (
                      <Button
                        size="sm"
                        onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                        className="btn-neon bg-terminal-yellow border-terminal-yellow hover:bg-terminal-yellow hover:text-black"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => updateCampaignStatus(campaign.id, 'sending')}
                        className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <Card className="terminal-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Campaign Details: {selectedCampaign.name}
              </CardTitle>
              <Button
                onClick={() => setSelectedCampaign(null)}
                variant="ghost"
                className="text-terminal-cyan hover:text-terminal-green"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-terminal-green">{selectedCampaign.metrics.sent}</div>
                <div className="text-sm text-terminal-cyan">Total Sent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-terminal-blue">{selectedCampaign.metrics.opened}</div>
                <div className="text-sm text-terminal-cyan">Opened</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-terminal-purple">{selectedCampaign.metrics.clicked}</div>
                <div className="text-sm text-terminal-cyan">Clicked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-terminal-yellow">{selectedCampaign.metrics.bounced}</div>
                <div className="text-sm text-terminal-cyan">Bounced</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailCampaignManager;
