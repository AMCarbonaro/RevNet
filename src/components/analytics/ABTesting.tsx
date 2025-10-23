'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FlaskConical, 
  Play, 
  Pause, 
  Stop, 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  hypothesis: string;
  metric: string;
  variants: ABTestVariant[];
  trafficSplit: number;
  startDate?: Date;
  endDate?: Date;
  results?: ABTestResults;
  createdAt: Date;
  updatedAt: Date;
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  configuration: Record<string, any>;
  isControl: boolean;
}

interface ABTestResults {
  totalUsers: number;
  variants: {
    variantId: string;
    users: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
    improvement: number;
  }[];
  statisticalSignificance: number;
  winner?: string;
  recommendation: string;
}

const ABTesting: React.FC = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadABTests();
  }, []);

  const loadABTests = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from API
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Donation Button Color',
          description: 'Test different colors for the donation button to improve conversion rates',
          status: 'running',
          hypothesis: 'Green donation buttons will increase conversion rates by 15%',
          metric: 'conversion_rate',
          trafficSplit: 50,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          variants: [
            {
              id: 'control',
              name: 'Control (Blue)',
              description: 'Original blue donation button',
              trafficPercentage: 50,
              configuration: { color: 'blue' },
              isControl: true
            },
            {
              id: 'variant1',
              name: 'Variant A (Green)',
              description: 'Green donation button',
              trafficPercentage: 50,
              configuration: { color: 'green' },
              isControl: false
            }
          ],
          results: {
            totalUsers: 1250,
            variants: [
              {
                variantId: 'control',
                users: 625,
                conversions: 125,
                conversionRate: 0.20,
                confidence: 0.85,
                improvement: 0
              },
              {
                variantId: 'variant1',
                users: 625,
                conversions: 156,
                conversionRate: 0.25,
                confidence: 0.92,
                improvement: 25
              }
            ],
            statisticalSignificance: 0.95,
            winner: 'variant1',
            recommendation: 'Implement green donation button - shows 25% improvement with 95% confidence'
          },
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Project Description Length',
          description: 'Test shorter vs longer project descriptions for better engagement',
          status: 'completed',
          hypothesis: 'Shorter descriptions will increase user engagement by 20%',
          metric: 'engagement_rate',
          trafficSplit: 50,
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          variants: [
            {
              id: 'control',
              name: 'Control (Long)',
              description: 'Original long project descriptions',
              trafficPercentage: 50,
              configuration: { length: 'long' },
              isControl: true
            },
            {
              id: 'variant1',
              name: 'Variant A (Short)',
              description: 'Shortened project descriptions',
              trafficPercentage: 50,
              configuration: { length: 'short' },
              isControl: false
            }
          ],
          results: {
            totalUsers: 2100,
            variants: [
              {
                variantId: 'control',
                users: 1050,
                conversions: 315,
                conversionRate: 0.30,
                confidence: 0.88,
                improvement: 0
              },
              {
                variantId: 'variant1',
                users: 1050,
                conversions: 378,
                conversionRate: 0.36,
                confidence: 0.94,
                improvement: 20
              }
            ],
            statisticalSignificance: 0.97,
            winner: 'variant1',
            recommendation: 'Implement shorter descriptions - shows 20% improvement with 97% confidence'
          },
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];

      setTests(mockTests);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-terminal-green';
      case 'paused': return 'text-terminal-yellow';
      case 'completed': return 'text-terminal-cyan';
      case 'draft': return 'text-terminal-purple';
      default: return 'text-terminal-red';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'text-terminal-green';
    if (confidence >= 0.90) return 'text-terminal-yellow';
    return 'text-terminal-red';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTestDuration = (test: ABTest) => {
    if (!test.startDate) return 'Not started';
    const endDate = test.endDate || new Date();
    const duration = Math.floor((endDate.getTime() - test.startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${duration} days`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-terminal-cyan">Loading A/B Tests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">A/B Testing Dashboard</h1>
        <Button 
          onClick={() => setIsCreating(true)}
          className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
        >
          <FlaskConical className="h-4 w-4 mr-2" />
          Create New Test
        </Button>
      </div>

      {/* Test Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Total Tests</p>
                <p className="text-2xl font-bold text-terminal-cyan">{tests.length}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-terminal-purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Running Tests</p>
                <p className="text-2xl font-bold text-terminal-cyan">
                  {tests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Completed Tests</p>
                <p className="text-2xl font-bold text-terminal-cyan">
                  {tests.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-terminal-cyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Success Rate</p>
                <p className="text-2xl font-bold text-terminal-cyan">
                  {tests.filter(t => t.status === 'completed' && t.results?.winner).length > 0 
                    ? `${Math.round((tests.filter(t => t.status === 'completed' && t.results?.winner).length / tests.filter(t => t.status === 'completed').length) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map(test => (
          <Card key={test.id} className="terminal-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CardTitle className="text-lg text-terminal-cyan">
                    {test.name}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(test.status)} border-current flex items-center space-x-1`}
                  >
                    {getStatusIcon(test.status)}
                    <span>{test.status}</span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTest(test)}
                    className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-terminal-green">{test.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-terminal-cyan font-semibold">Hypothesis:</p>
                    <p className="text-sm text-terminal-green">{test.hypothesis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-terminal-cyan font-semibold">Duration:</p>
                    <p className="text-sm text-terminal-green">{getTestDuration(test)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-terminal-cyan font-semibold">Traffic Split:</p>
                    <p className="text-sm text-terminal-green">{test.trafficSplit}% / {100 - test.trafficSplit}%</p>
                  </div>
                </div>

                {test.results && (
                  <div className="space-y-3">
                    <h4 className="text-md font-semibold text-terminal-cyan">Results Summary:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-terminal-green">Total Users: {test.results.totalUsers}</p>
                        <p className="text-sm text-terminal-green">Statistical Significance: {(test.results.statisticalSignificance * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        {test.results.winner && (
                          <p className="text-sm text-terminal-green">
                            Winner: {test.variants.find(v => v.id === test.results?.winner)?.name}
                          </p>
                        )}
                        <p className="text-sm text-terminal-green">
                          Recommendation: {test.results.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Results Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-matrix-darker border border-terminal-green/50 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-terminal-cyan">{selectedTest.name} - Results</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedTest(null)}
                className="btn-neon bg-terminal-red border-terminal-red hover:bg-terminal-red hover:text-black"
              >
                Close
              </Button>
            </div>

            {selectedTest.results && (
              <div className="space-y-6">
                {/* Test Overview */}
                <Card className="terminal-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-terminal-cyan">Test Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-terminal-green">Total Users: {selectedTest.results.totalUsers}</p>
                        <p className="text-sm text-terminal-green">Statistical Significance: {(selectedTest.results.statisticalSignificance * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-terminal-green">Duration: {getTestDuration(selectedTest)}</p>
                        <p className="text-sm text-terminal-green">Status: {selectedTest.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Variant Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedTest.results.variants.map(variant => {
                    const variantInfo = selectedTest.variants.find(v => v.id === variant.variantId);
                    return (
                      <Card key={variant.variantId} className="terminal-card">
                        <CardHeader>
                          <CardTitle className="text-lg text-terminal-cyan">
                            {variantInfo?.name}
                            {variantInfo?.isControl && (
                              <Badge variant="outline" className="ml-2 text-terminal-purple border-terminal-purple">
                                Control
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-terminal-green">Conversion Rate:</span>
                              <span className="text-2xl font-bold text-terminal-cyan">
                                {(variant.conversionRate * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress 
                              value={variant.conversionRate * 100} 
                              className="h-3 bg-matrix-dark"
                            />
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-terminal-green">Users:</span>
                                <span className="text-terminal-purple">{variant.users}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-terminal-green">Conversions:</span>
                                <span className="text-terminal-purple">{variant.conversions}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-terminal-green">Confidence:</span>
                                <span className={getConfidenceColor(variant.confidence)}>
                                  {(variant.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                              {variant.improvement > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-terminal-green">Improvement:</span>
                                  <span className="text-terminal-green">+{variant.improvement}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Recommendation */}
                <Card className="terminal-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-terminal-cyan">Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-terminal-green">{selectedTest.results.recommendation}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTesting;
