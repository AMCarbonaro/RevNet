'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Monitor,
  Key,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { twoFactorAuth } from '@/lib/2fa';
import { webAuthnManager } from '@/lib/webauthn';
import { securityMonitor } from '@/lib/security-monitoring';

interface SecurityDashboardProps {
  userId: string;
  userEmail: string;
  userName: string;
}

interface SecurityStatus {
  twoFactorEnabled: boolean;
  webAuthnEnabled: boolean;
  riskScore: number;
  lastLogin: Date | null;
  trustedDevices: number;
  securityEvents: number;
  recommendations: string[];
}

interface TrustedDevice {
  id: string;
  name: string;
  type: string;
  lastUsed: Date;
  location?: string;
  isCurrent: boolean;
}

interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  location?: string;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  userId,
  userEmail,
  userName
}) => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSecurityData();
  }, [userId]);

  const loadSecurityData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load security status
      const twoFactorEnabled = twoFactorAuth.isConfigured('mock-secret'); // In real app, check user's 2FA status
      const webAuthnEnabled = webAuthnManager.getUserCredentials(userId).length > 0;
      const riskScore = securityMonitor.getUserRiskScore(userId);
      const recommendations = twoFactorAuth.getSecurityRecommendations(userId);
      
      setSecurityStatus({
        twoFactorEnabled,
        webAuthnEnabled,
        riskScore,
        lastLogin: new Date(), // Mock data
        trustedDevices: 2, // Mock data
        securityEvents: 5, // Mock data
        recommendations
      });

      // Load trusted devices (mock data)
      setTrustedDevices([
        {
          id: 'device-1',
          name: 'MacBook Pro',
          type: 'platform',
          lastUsed: new Date(),
          location: 'San Francisco, CA',
          isCurrent: true
        },
        {
          id: 'device-2',
          name: 'iPhone 15',
          type: 'cross-platform',
          lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
          location: 'San Francisco, CA',
          isCurrent: false
        }
      ]);

      // Load recent security events (mock data)
      setRecentEvents([
        {
          id: 'event-1',
          type: 'login_success',
          description: 'Successful login',
          timestamp: new Date(),
          severity: 'low',
          ip: '192.168.1.1',
          location: 'San Francisco, CA'
        },
        {
          id: 'event-2',
          type: '2fa_verified',
          description: 'Two-factor authentication verified',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          severity: 'low',
          ip: '192.168.1.1',
          location: 'San Francisco, CA'
        },
        {
          id: 'event-3',
          type: 'unusual_location',
          description: 'Login from unusual location',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          severity: 'medium',
          ip: '203.0.113.1',
          location: 'New York, NY'
        }
      ]);

    } catch (error) {
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-terminal-red';
    if (score >= 60) return 'text-terminal-yellow';
    if (score >= 40) return 'text-terminal-blue';
    return 'text-terminal-green';
  };

  const getRiskScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-terminal-red text-white';
    if (score >= 60) return 'bg-terminal-yellow text-black';
    if (score >= 40) return 'bg-terminal-blue text-white';
    return 'bg-terminal-green text-black';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-terminal-red';
      case 'high': return 'text-terminal-yellow';
      case 'medium': return 'text-terminal-blue';
      default: return 'text-terminal-green';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-terminal-red text-white';
      case 'high': return 'bg-terminal-yellow text-black';
      case 'medium': return 'bg-terminal-blue text-white';
      default: return 'bg-terminal-green text-black';
    }
  };

  const removeTrustedDevice = (deviceId: string) => {
    setTrustedDevices(devices => devices.filter(device => device.id !== deviceId));
    // In real app, call API to remove device
  };

  const downloadSecurityReport = () => {
    const report = `Revolution Network - Security Report

Generated: ${new Date().toLocaleString()}
User: ${userName} (${userEmail})

Security Status:
- Two-Factor Authentication: ${securityStatus?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
- WebAuthn: ${securityStatus?.webAuthnEnabled ? 'Enabled' : 'Disabled'}
- Risk Score: ${securityStatus?.riskScore}/100
- Trusted Devices: ${securityStatus?.trustedDevices}
- Recent Security Events: ${securityStatus?.securityEvents}

Recent Security Events:
${recentEvents.map(event => 
  `- ${event.description} (${event.severity.toUpperCase()}) - ${event.timestamp.toLocaleString()}`
).join('\n')}

Trusted Devices:
${trustedDevices.map(device => 
  `- ${device.name} (${device.type}) - Last used: ${device.lastUsed.toLocaleString()}`
).join('\n')}

Recommendations:
${securityStatus?.recommendations.map(rec => `- ${rec}`).join('\n')}`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-terminal-cyan">Loading Security Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="bg-terminal-red/20 border-terminal-red">
          <AlertTriangle className="h-4 w-4 text-terminal-red" />
          <AlertDescription className="text-terminal-red">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">Security Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={loadSecurityData}
            className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={downloadSecurityReport}
            className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskScoreColor(securityStatus?.riskScore || 0)}`}>
                  {securityStatus?.riskScore || 0}
                </p>
              </div>
              <Badge className={getRiskScoreBadge(securityStatus?.riskScore || 0)}>
                {securityStatus?.riskScore >= 80 ? 'High Risk' : 
                 securityStatus?.riskScore >= 60 ? 'Medium Risk' : 
                 securityStatus?.riskScore >= 40 ? 'Low Risk' : 'Very Low Risk'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">2FA Status</p>
                <p className="text-2xl font-bold text-terminal-cyan">
                  {securityStatus?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {securityStatus?.twoFactorEnabled ? (
                <CheckCircle className="h-8 w-8 text-terminal-green" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-terminal-yellow" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">WebAuthn</p>
                <p className="text-2xl font-bold text-terminal-cyan">
                  {securityStatus?.webAuthnEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {securityStatus?.webAuthnEnabled ? (
                <CheckCircle className="h-8 w-8 text-terminal-green" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-terminal-yellow" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-terminal-green">Trusted Devices</p>
                <p className="text-2xl font-bold text-terminal-cyan">
                  {securityStatus?.trustedDevices || 0}
                </p>
              </div>
              <Monitor className="h-8 w-8 text-terminal-purple" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trusted Devices */}
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-lg text-terminal-cyan flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            Trusted Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trustedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-matrix-darker rounded-md">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {device.type === 'platform' ? (
                      <Smartphone className="h-6 w-6 text-terminal-cyan" />
                    ) : (
                      <Key className="h-6 w-6 text-terminal-purple" />
                    )}
                  </div>
                  <div>
                    <div className="text-terminal-green font-semibold flex items-center">
                      {device.name}
                      {device.isCurrent && (
                        <Badge className="ml-2 bg-terminal-green text-black">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-terminal-cyan">
                      Last used: {device.lastUsed.toLocaleString()}
                      {device.location && ` • ${device.location}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTrustedDevice(device.id)}
                    className="text-terminal-red hover:text-terminal-red hover:bg-terminal-red/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-lg text-terminal-cyan flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-matrix-darker rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {event.severity === 'critical' || event.severity === 'high' ? (
                      <AlertTriangle className="h-5 w-5 text-terminal-red" />
                    ) : event.severity === 'medium' ? (
                      <Clock className="h-5 w-5 text-terminal-yellow" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-terminal-green" />
                    )}
                  </div>
                  <div>
                    <div className="text-terminal-green font-semibold">{event.description}</div>
                    <div className="text-sm text-terminal-cyan">
                      {event.timestamp.toLocaleString()}
                      {event.location && ` • ${event.location}`}
                    </div>
                  </div>
                </div>
                <Badge className={getSeverityBadge(event.severity)}>
                  {event.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {securityStatus?.recommendations && securityStatus.recommendations.length > 0 && (
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-lg text-terminal-cyan flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityStatus.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertTriangle className="h-4 w-4 text-terminal-yellow mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-terminal-green font-semibold">{recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityDashboard;
