'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3, 
  PieChart,
  Activity,
  Zap,
  Eye,
  Clock
} from 'lucide-react';
import { mlModelManager } from '@/lib/ml/models';
import { predictionEngine } from '@/lib/ml/predictions';
import { userSegmentationEngine } from '@/lib/analytics/segmentation';
import { analyticsTracker } from '@/lib/analytics/tracking';

interface MLInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'anomaly' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: Date;
  data: any;
}

interface PredictionResult {
  projectId: string;
  successProbability: number;
  confidence: number;
  factors: any;
  recommendations: string[];
}

interface SegmentData {
  segmentId: string;
  name: string;
  size: number;
  characteristics: any;
  growthRate: number;
  engagementScore: number;
}

const MLInsights: React.FC = () => {
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'predictions' | 'segments' | 'recommendations'>('insights');

  useEffect(() => {
    loadMLData();
  }, []);

  const loadMLData = async () => {
    setLoading(true);
    try {
      // Load insights
      const insightsData = await generateInsights();
      setInsights(insightsData);

      // Load predictions
      const predictionsData = await loadProjectPredictions();
      setPredictions(predictionsData);

      // Load segments
      const segmentsData = await loadUserSegments();
      setSegments(segmentsData);

      // Track analytics
      analyticsTracker.track('ml_insights_viewed', {
        insightsCount: insightsData.length,
        predictionsCount: predictionsData.length,
        segmentsCount: segmentsData.length
      });
    } catch (error) {
      console.error('Error loading ML data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (): Promise<MLInsight[]> => {
    // Mock data - in real implementation, this would call the prediction engine
    return [
      {
        id: '1',
        type: 'trend',
        title: 'User Engagement Trending Up',
        description: 'User engagement has increased by 15% over the past week, driven by new project launches.',
        confidence: 0.92,
        impact: 'high',
        category: 'Engagement',
        timestamp: new Date(),
        data: { trend: 'up', percentage: 15 }
      },
      {
        id: '2',
        type: 'prediction',
        title: 'High Churn Risk Detected',
        description: '23 users are at high risk of churning based on recent activity patterns.',
        confidence: 0.87,
        impact: 'high',
        category: 'Retention',
        timestamp: new Date(),
        data: { riskUsers: 23, totalUsers: 150 }
      },
      {
        id: '3',
        type: 'recommendation',
        title: 'Optimize Project Descriptions',
        description: 'Projects with detailed descriptions have 40% higher success rates.',
        confidence: 0.84,
        impact: 'medium',
        category: 'Optimization',
        timestamp: new Date(),
        data: { improvement: 40 }
      },
      {
        id: '4',
        type: 'anomaly',
        title: 'Unusual Donation Pattern',
        description: 'Detected unusual donation pattern in the Political Campaign category.',
        confidence: 0.76,
        impact: 'medium',
        category: 'Anomaly',
        timestamp: new Date(),
        data: { category: 'Political Campaign', anomaly: 'spike' }
      }
    ];
  };

  const loadProjectPredictions = async (): Promise<PredictionResult[]> => {
    // Mock data - in real implementation, this would call the prediction engine
    return [
      {
        projectId: 'proj1',
        successProbability: 0.85,
        confidence: 0.92,
        factors: {
          fundingGoal: 0.8,
          creatorExperience: 0.9,
          categoryPopularity: 0.7,
          timingScore: 0.8,
          descriptionQuality: 0.9
        },
        recommendations: [
          'Consider adjusting your funding goal to be more achievable',
          'Improve your project description with more details and media'
        ]
      },
      {
        projectId: 'proj2',
        successProbability: 0.65,
        confidence: 0.78,
        factors: {
          fundingGoal: 0.6,
          creatorExperience: 0.7,
          categoryPopularity: 0.8,
          timingScore: 0.5,
          descriptionQuality: 0.7
        },
        recommendations: [
          'Consider adjusting your campaign timeline',
          'Highlight unique aspects of your project category'
        ]
      }
    ];
  };

  const loadUserSegments = async (): Promise<SegmentData[]> => {
    const allSegments = userSegmentationEngine.getAllSegments();
    return allSegments.map(segment => ({
      segmentId: segment.segmentId,
      name: segment.name,
      size: segment.size,
      characteristics: segment.characteristics,
      growthRate: Math.random() * 0.2 - 0.1, // Random growth between -10% and +10%
      engagementScore: segment.characteristics.engagementScore
    }));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Brain className="h-5 w-5" />;
      case 'recommendation': return <Target className="h-5 w-5" />;
      case 'anomaly': return <AlertTriangle className="h-5 w-5" />;
      case 'trend': return <TrendingUp className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'anomaly') return 'text-terminal-red';
    if (impact === 'high') return 'text-terminal-green';
    if (impact === 'medium') return 'text-terminal-yellow';
    return 'text-terminal-cyan';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-terminal-green';
    if (confidence >= 0.6) return 'text-terminal-yellow';
    return 'text-terminal-red';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-terminal-cyan">Loading ML Insights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">ML Insights Dashboard</h1>
        <Button 
          onClick={loadMLData}
          className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
        >
          <Zap className="h-4 w-4 mr-2" />
          Refresh Insights
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-terminal-green/30">
        {[
          { id: 'insights', label: 'Insights', icon: <Eye className="h-4 w-4" /> },
          { id: 'predictions', label: 'Predictions', icon: <Brain className="h-4 w-4" /> },
          { id: 'segments', label: 'Segments', icon: <Users className="h-4 w-4" /> },
          { id: 'recommendations', label: 'Recommendations', icon: <Target className="h-4 w-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-terminal-cyan text-terminal-cyan'
                : 'border-transparent text-terminal-green hover:text-terminal-cyan'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Insights Tab */}
      {selectedTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map(insight => (
            <Card key={insight.id} className="terminal-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-terminal-cyan">
                    {getInsightIcon(insight.type)}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${getInsightColor(insight.type, insight.impact)} border-current`}
                  >
                    {insight.impact}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-md font-semibold text-terminal-green mb-2">
                  {insight.title}
                </h3>
                <p className="text-sm text-terminal-cyan mb-4">
                  {insight.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-terminal-green">Confidence:</span>
                    <span className={getConfidenceColor(insight.confidence)}>
                      {(insight.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={insight.confidence * 100} 
                    className="h-2 bg-matrix-dark"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-terminal-green">Category:</span>
                    <span className="text-terminal-purple">{insight.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-terminal-green">Time:</span>
                    <span className="text-terminal-cyan">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {insight.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Predictions Tab */}
      {selectedTab === 'predictions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map(prediction => (
              <Card key={prediction.projectId} className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-lg text-terminal-cyan">
                    Project Success Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-terminal-green">Success Probability:</span>
                      <span className="text-2xl font-bold text-terminal-cyan">
                        {(prediction.successProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={prediction.successProbability * 100} 
                      className="h-3 bg-matrix-dark"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-terminal-green">Confidence:</span>
                      <span className={getConfidenceColor(prediction.confidence)}>
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-md font-semibold text-terminal-green">Key Factors:</h4>
                      {Object.entries(prediction.factors).map(([factor, score]) => (
                        <div key={factor} className="flex justify-between text-sm">
                          <span className="text-terminal-cyan capitalize">
                            {factor.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-terminal-purple">
                            {(score as number * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-md font-semibold text-terminal-green">Recommendations:</h4>
                      <ul className="space-y-1">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-terminal-cyan flex items-start">
                            <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-terminal-green flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Segments Tab */}
      {selectedTab === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map(segment => (
              <Card key={segment.segmentId} className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-lg text-terminal-cyan">
                    <Users className="h-5 w-5 inline mr-2" />
                    {segment.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-terminal-green">Size:</span>
                      <span className="text-2xl font-bold text-terminal-cyan">
                        {segment.size}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-terminal-green">Growth Rate:</span>
                        <span className={`${segment.growthRate >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                          {segment.growthRate >= 0 ? '+' : ''}{(segment.growthRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-terminal-green">Engagement:</span>
                        <span className="text-terminal-purple">
                          {(segment.engagementScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-terminal-green">Avg Donation:</span>
                        <span className="text-terminal-cyan">
                          ${segment.characteristics.avgDonationAmount.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-terminal-green">Preferred Categories:</h4>
                      <div className="flex flex-wrap gap-1">
                        {segment.characteristics.preferredCategories.map((category: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs text-terminal-purple border-terminal-purple">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {selectedTab === 'recommendations' && (
        <div className="space-y-6">
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan">
                <Target className="h-5 w-5 inline mr-2" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-terminal-green">Project Optimization</h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-terminal-cyan flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-terminal-green flex-shrink-0" />
                      Improve project descriptions to increase success rates by 40%
                    </li>
                    <li className="text-sm text-terminal-cyan flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-terminal-green flex-shrink-0" />
                      Optimize funding goals for better completion rates
                    </li>
                    <li className="text-sm text-terminal-cyan flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-terminal-green flex-shrink-0" />
                      Add video content to increase engagement by 25%
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-terminal-green">User Engagement</h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-terminal-cyan flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-terminal-green flex-shrink-0" />
                      Send re-engagement emails to 23 high-risk users
                    </li>
                    <li className="text-sm text-terminal-cyan flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-terminal-green flex-shrink-0" />
                      Showcase trending projects to new users
                    </li>
                    <li className="text-sm text-terminal-cyan flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-terminal-green flex-shrink-0" />
                      Implement personalized project recommendations
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MLInsights;
