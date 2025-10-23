'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Database,
  Mail,
  CreditCard,
  Globe,
  Bell,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminSettings {
  platform: {
    name: string;
    description: string;
    logo: string;
    favicon: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
    twoFactorEnabled: boolean;
    ipWhitelist: string[];
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
      requestsPerHour: number;
    };
  };
  email: {
    provider: string;
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPassword: string;
  };
  payments: {
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    paypalEnabled: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
    minimumDonation: number;
    maximumDonation: number;
    platformFeePercentage: number;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    adminAlerts: boolean;
    userAlerts: boolean;
    systemAlerts: boolean;
  };
  analytics: {
    googleAnalyticsId: string;
    mixpanelToken: string;
    sentryDsn: string;
    trackingEnabled: boolean;
    privacyMode: boolean;
  };
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<AdminSettings>({
    platform: {
      name: 'Revolution Network',
      description: 'Empowering Grassroots Activism',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true,
      twoFactorEnabled: false,
      ipWhitelist: [],
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        requestsPerHour: 1000
      }
    },
    email: {
      provider: 'smtp',
      fromName: 'Revolution Network',
      fromEmail: 'noreply@revolutionnetwork.com',
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: '',
      smtpPassword: ''
    },
    payments: {
      stripeEnabled: false,
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      paypalEnabled: false,
      paypalClientId: '',
      paypalClientSecret: '',
      minimumDonation: 1,
      maximumDonation: 10000,
      platformFeePercentage: 5
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      adminAlerts: true,
      userAlerts: true,
      systemAlerts: true
    },
    analytics: {
      googleAnalyticsId: '',
      mixpanelToken: '',
      sentryDsn: '',
      trackingEnabled: true,
      privacyMode: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchSettings();
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/settings/reset', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reset settings');
      
      setSuccess('Settings reset to default values!');
      fetchSettings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const updateSetting = (section: keyof AdminSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedSetting = (section: keyof AdminSettings, parentField: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...(prev[section] as any)[parentField],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matrix-darker text-terminal-green p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-glow mb-2">
            Admin Settings
          </h1>
          <p className="text-terminal-cyan">
            Configure platform settings and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="card-holographic p-4 mb-6 bg-terminal-green/10 border-terminal-green">
            <div className="flex items-center gap-2 text-terminal-green">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="card-holographic p-4 mb-6 bg-terminal-red/10 border-terminal-red">
            <div className="flex items-center gap-2 text-terminal-red">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Platform Settings */}
          <div className="card-holographic p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-terminal-blue" />
              <h2 className="text-2xl font-bold text-terminal-cyan">Platform Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Platform Name</label>
                <input
                  type="text"
                  value={settings.platform.name}
                  onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Description</label>
                <input
                  type="text"
                  value={settings.platform.description}
                  onChange={(e) => updateSetting('platform', 'description', e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Timezone</label>
                <select
                  value={settings.platform.timezone}
                  onChange={(e) => updateSetting('platform', 'timezone', e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Language</label>
                <select
                  value={settings.platform.language}
                  onChange={(e) => updateSetting('platform', 'language', e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.platform.maintenanceMode}
                  onChange={(e) => updateSetting('platform', 'maintenanceMode', e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="maintenanceMode" className="text-terminal-green">Maintenance Mode</label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="registrationEnabled"
                  checked={settings.platform.registrationEnabled}
                  onChange={(e) => updateSetting('platform', 'registrationEnabled', e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="registrationEnabled" className="text-terminal-green">Registration Enabled</label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emailVerificationRequired"
                  checked={settings.platform.emailVerificationRequired}
                  onChange={(e) => updateSetting('platform', 'emailVerificationRequired', e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="emailVerificationRequired" className="text-terminal-green">Email Verification Required</label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="card-holographic p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-terminal-red" />
              <h2 className="text-2xl font-bold text-terminal-cyan">Security Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Session Timeout (seconds)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Password Min Length</label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Rate Limit (requests/minute)</label>
                <input
                  type="number"
                  value={settings.security.rateLimiting.requestsPerMinute}
                  onChange={(e) => updateNestedSetting('security', 'rateLimiting', 'requestsPerMinute', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireStrongPassword"
                  checked={settings.security.requireStrongPassword}
                  onChange={(e) => updateSetting('security', 'requireStrongPassword', e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="requireStrongPassword" className="text-terminal-green">Require Strong Password</label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="twoFactorEnabled"
                  checked={settings.security.twoFactorEnabled}
                  onChange={(e) => updateSetting('security', 'twoFactorEnabled', e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="twoFactorEnabled" className="text-terminal-green">Two-Factor Authentication</label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="rateLimitingEnabled"
                  checked={settings.security.rateLimiting.enabled}
                  onChange={(e) => updateNestedSetting('security', 'rateLimiting', 'enabled', !settings.security.rateLimiting.enabled)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="rateLimitingEnabled" className="text-terminal-green">Rate Limiting Enabled</label>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="card-holographic p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-terminal-blue" />
              <h2 className="text-2xl font-bold text-terminal-cyan">Email Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">From Name</label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">From Email</label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">SMTP Port</label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">SMTP User</label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">SMTP Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.smtpPassword ? 'text' : 'password'}
                    value={settings.email.smtpPassword}
                    onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                    className="w-full px-4 py-2 pr-12 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('smtpPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-terminal-cyan hover:text-terminal-green"
                  >
                    {showPasswords.smtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="smtpSecure"
                  checked={settings.email.smtpSecure}
                  onChange={(e) => updateSetting('email', 'smtpSecure', e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="smtpSecure" className="text-terminal-green">Use Secure Connection (TLS)</label>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="card-holographic p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-terminal-green" />
              <h2 className="text-2xl font-bold text-terminal-cyan">Payment Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Minimum Donation ($)</label>
                <input
                  type="number"
                  value={settings.payments.minimumDonation}
                  onChange={(e) => updateSetting('payments', 'minimumDonation', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Maximum Donation ($)</label>
                <input
                  type="number"
                  value={settings.payments.maximumDonation}
                  onChange={(e) => updateSetting('payments', 'maximumDonation', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
              
              <div>
                <label className="block text-terminal-green text-sm font-semibold mb-2">Platform Fee (%)</label>
                <input
                  type="number"
                  value={settings.payments.platformFeePercentage}
                  onChange={(e) => updateSetting('payments', 'platformFeePercentage', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="stripeEnabled"
                  checked={settings.payments.stripeEnabled}
                  onChange={(e) => updateSetting('payments', 'stripeEnabled', e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="stripeEnabled" className="text-terminal-green">Stripe Enabled</label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="paypalEnabled"
                  checked={settings.payments.paypalEnabled}
                  onChange={(e) => updateSetting('payments', 'paypalEnabled', e.target.checked)}
                  className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                />
                <label htmlFor="paypalEnabled" className="text-terminal-green">PayPal Enabled</label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card-holographic p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-terminal-yellow" />
              <h2 className="text-2xl font-bold text-terminal-cyan">Notification Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                  />
                  <label htmlFor="emailNotifications" className="text-terminal-green">Email Notifications</label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                    className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                  />
                  <label htmlFor="pushNotifications" className="text-terminal-green">Push Notifications</label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                    className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                  />
                  <label htmlFor="smsNotifications" className="text-terminal-green">SMS Notifications</label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="adminAlerts"
                    checked={settings.notifications.adminAlerts}
                    onChange={(e) => updateSetting('notifications', 'adminAlerts', e.target.checked)}
                    className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                  />
                  <label htmlFor="adminAlerts" className="text-terminal-green">Admin Alerts</label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="userAlerts"
                    checked={settings.notifications.userAlerts}
                    onChange={(e) => updateSetting('notifications', 'userAlerts', e.target.checked)}
                    className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                  />
                  <label htmlFor="userAlerts" className="text-terminal-green">User Alerts</label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="systemAlerts"
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                    className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                  />
                  <label htmlFor="systemAlerts" className="text-terminal-green">System Alerts</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-6 py-3 bg-terminal-red text-white rounded-lg hover:bg-terminal-red/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}