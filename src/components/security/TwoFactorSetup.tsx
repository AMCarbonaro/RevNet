'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Smartphone, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Download,
  Eye,
  EyeOff,
  QrCode,
  RefreshCw
} from 'lucide-react';
import { twoFactorAuth } from '@/lib/2fa';

interface TwoFactorSetupProps {
  userId: string;
  userEmail: string;
  userName: string;
  onSetupComplete?: (success: boolean) => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  userId,
  userEmail,
  userName,
  onSetupComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [secret, setSecret] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const steps: SetupStep[] = [
    {
      id: 'generate',
      title: 'Generate Secret',
      description: 'Create a unique secret key for your authenticator app',
      completed: !!secret
    },
    {
      id: 'verify',
      title: 'Verify Setup',
      description: 'Enter a code from your authenticator app to verify setup',
      completed: success
    },
    {
      id: 'backup',
      title: 'Save Backup Codes',
      description: 'Download and securely store your backup codes',
      completed: backupCodes.length > 0
    }
  ];

  useEffect(() => {
    if (success && onSetupComplete) {
      onSetupComplete(true);
    }
  }, [success, onSetupComplete]);

  const generateSecret = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const twoFactorSecret = await twoFactorAuth.generateSecret(userId, userEmail);
      setSecret(twoFactorSecret);
      setCurrentStep(1);
    } catch (error) {
      setError('Failed to generate 2FA secret. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode || !secret) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      const isValid = twoFactorAuth.validateSetup(secret.secret, verificationCode);
      
      if (isValid) {
        setSuccess(true);
        setBackupCodes(secret.backupCodes);
        setCurrentStep(2);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify setup. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyBackupCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const content = `Revolution Network - Two-Factor Authentication Backup Codes

IMPORTANT: Keep these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Generated: ${new Date().toLocaleString()}
User: ${userName} (${userEmail})

If you lose access to your authenticator app, you can use these backup codes to access your account.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revolution-network-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCurrentStepIndex = () => {
    if (!secret) return 0;
    if (!success) return 1;
    return 2;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-2xl text-terminal-cyan flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Two-Factor Authentication Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.completed 
                      ? 'bg-terminal-green border-terminal-green text-black' 
                      : index === getCurrentStepIndex()
                      ? 'border-terminal-cyan text-terminal-cyan'
                      : 'border-matrix-dark text-matrix-dark'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className="text-sm font-medium text-terminal-green">{step.title}</div>
                    <div className="text-xs text-terminal-cyan">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      step.completed ? 'bg-terminal-green' : 'bg-matrix-dark'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="bg-terminal-red/20 border-terminal-red">
                <AlertTriangle className="h-4 w-4 text-terminal-red" />
                <AlertDescription className="text-terminal-red">{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Generate Secret */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-terminal-green mb-2">
                    Generate Your Secret Key
                  </h3>
                  <p className="text-terminal-cyan">
                    We'll create a unique secret key that you'll add to your authenticator app.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={generateSecret}
                    disabled={isGenerating}
                    className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Generate Secret
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Verify Setup */}
            {currentStep === 1 && secret && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-terminal-green mb-2">
                    Add to Authenticator App
                  </h3>
                  <p className="text-terminal-cyan mb-4">
                    Scan this QR code with your authenticator app or manually enter the secret key.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg">
                      <img 
                        src={secret.qrCode} 
                        alt="2FA QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-terminal-green mb-2">
                        Or manually enter this secret:
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={secret.secret}
                          readOnly
                          className="font-mono text-sm bg-matrix-darker border-matrix-dark text-terminal-cyan"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyBackupCode(secret.secret)}
                          className="border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-black"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-terminal-green mb-2">
                        Enter verification code:
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          className="font-mono text-center text-lg tracking-widest"
                        />
                        <Button
                          onClick={verifySetup}
                          disabled={verificationCode.length !== 6 || isVerifying}
                          className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
                        >
                          {isVerifying ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            'Verify'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Backup Codes */}
            {currentStep === 2 && backupCodes.length > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-terminal-green mb-2">
                    Save Your Backup Codes
                  </h3>
                  <p className="text-terminal-cyan">
                    These codes can be used to access your account if you lose your authenticator device.
                  </p>
                </div>

                <Alert className="bg-terminal-yellow/20 border-terminal-yellow">
                  <AlertTriangle className="h-4 w-4 text-terminal-yellow" />
                  <AlertDescription className="text-terminal-yellow">
                    <strong>Important:</strong> Save these codes in a secure location. Each code can only be used once.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      variant="outline"
                      className="border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-black"
                    >
                      {showBackupCodes ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Codes
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show Codes
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={downloadBackupCodes}
                      className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {showBackupCodes && (
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-matrix-darker rounded-md">
                          <span className="font-mono text-terminal-cyan">{code}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyBackupCode(code)}
                            className="text-terminal-purple hover:text-terminal-cyan"
                          >
                            {copiedCode === code ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => onSetupComplete?.(true)}
                    className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <Alert className="bg-terminal-green/20 border-terminal-green">
                <CheckCircle className="h-4 w-4 text-terminal-green" />
                <AlertDescription className="text-terminal-green">
                  Two-factor authentication has been successfully enabled for your account!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="text-lg text-terminal-cyan flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Use a Reputable Authenticator App</div>
                <div className="text-sm text-terminal-cyan">
                  We recommend Google Authenticator, Authy, or Microsoft Authenticator
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Store Backup Codes Securely</div>
                <div className="text-sm text-terminal-cyan">
                  Keep your backup codes in a secure location, separate from your device
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-terminal-green mt-1 flex-shrink-0" />
              <div>
                <div className="text-terminal-green font-semibold">Test Your Setup</div>
                <div className="text-sm text-terminal-cyan">
                  Make sure you can generate codes before logging out
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorSetup;
