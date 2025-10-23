'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  Shield
} from 'lucide-react';

interface UnsubscribePageProps {
  searchParams: {
    token?: string;
    email?: string;
  };
}

const UnsubscribePage: React.FC<UnsubscribePageProps> = ({ searchParams }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(searchParams.email || '');
  const [preferences, setPreferences] = useState({
    newsletters: true,
    projectUpdates: true,
    securityAlerts: true,
    marketing: false
  });

  const handleUnsubscribe = async (type: 'all' | 'partial') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: searchParams.token,
          type,
          preferences: type === 'partial' ? preferences : {}
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || 'Failed to update preferences');
      }
    } catch (error) {
      setError('An error occurred while updating your preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-matrix-dark flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Card className="terminal-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-terminal-cyan flex items-center justify-center">
              <Mail className="h-6 w-6 mr-2" />
              Email Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <Alert className="bg-terminal-green/20 border-terminal-green">
                <CheckCircle className="h-4 w-4 text-terminal-green" />
                <AlertDescription className="text-terminal-green">
                  Your email preferences have been updated successfully!
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-terminal-cyan">
                    We're sorry to see you go! You can unsubscribe from all emails or customize your preferences below.
                  </p>
                </div>

                {error && (
                  <Alert className="bg-terminal-red/20 border-terminal-red">
                    <AlertTriangle className="h-4 w-4 text-terminal-red" />
                    <AlertDescription className="text-terminal-red">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-terminal-green mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-terminal-cyan mb-4">
                      Email Preferences
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={preferences.newsletters}
                          onChange={(e) => setPreferences({ ...preferences, newsletters: e.target.checked })}
                          className="w-4 h-4 text-terminal-green bg-matrix-darker border-matrix-dark rounded focus:ring-terminal-green"
                        />
                        <span className="text-terminal-cyan">Weekly Newsletters</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={preferences.projectUpdates}
                          onChange={(e) => setPreferences({ ...preferences, projectUpdates: e.target.checked })}
                          className="w-4 h-4 text-terminal-green bg-matrix-darker border-matrix-dark rounded focus:ring-terminal-green"
                        />
                        <span className="text-terminal-cyan">Project Updates</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={preferences.securityAlerts}
                          onChange={(e) => setPreferences({ ...preferences, securityAlerts: e.target.checked })}
                          className="w-4 h-4 text-terminal-green bg-matrix-darker border-matrix-dark rounded focus:ring-terminal-green"
                        />
                        <span className="text-terminal-cyan">Security Alerts</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                          className="w-4 h-4 text-terminal-green bg-matrix-darker border-matrix-dark rounded focus:ring-terminal-green"
                        />
                        <span className="text-terminal-cyan">Marketing Emails</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => handleUnsubscribe('partial')}
                      disabled={loading}
                      className="flex-1 btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
                    >
                      {loading ? (
                        <>
                          <Settings className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Update Preferences
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleUnsubscribe('all')}
                      disabled={loading}
                      className="flex-1 btn-neon bg-terminal-red border-terminal-red hover:bg-terminal-red hover:text-white"
                    >
                      {loading ? (
                        <>
                          <Settings className="h-4 w-4 mr-2 animate-spin" />
                          Unsubscribing...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Unsubscribe All
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-terminal-cyan">
                  <p>
                    You can always update your preferences by visiting your{' '}
                    <a href="/security" className="text-terminal-green hover:text-terminal-cyan underline">
                      security settings
                    </a>{' '}
                    or contacting our support team.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnsubscribePage;
