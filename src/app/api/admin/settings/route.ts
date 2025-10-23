import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logError, logInfo } from '@/lib/logger';

// In a real application, you would store these settings in a database
// For now, we'll use a simple in-memory store (this would be lost on server restart)
let adminSettings = {
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
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    logInfo('Admin settings retrieved', { 
      userId: session.user.id
    });

    return NextResponse.json(adminSettings);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/settings' });
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const newSettings = await req.json();

    // Validate settings structure
    if (!newSettings || typeof newSettings !== 'object') {
      return NextResponse.json(
        { message: 'Invalid settings format' },
        { status: 400 }
      );
    }

    // Update settings (in a real app, this would be saved to database)
    adminSettings = {
      ...adminSettings,
      ...newSettings
    };

    logInfo('Admin settings updated', { 
      userId: session.user.id,
      updatedSections: Object.keys(newSettings)
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: adminSettings
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/settings' });
    return NextResponse.json(
      { message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}