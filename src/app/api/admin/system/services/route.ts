import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { logError, logInfo } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Mock services data - in a real implementation, you would check actual service health
    const services = [
      {
        name: 'Database',
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 50) + 10,
        lastCheck: new Date(),
        description: 'MongoDB connection pool'
      },
      {
        name: 'Authentication',
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 100) + 20,
        lastCheck: new Date(),
        description: 'NextAuth.js service'
      },
      {
        name: 'Payment Processing',
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 200) + 50,
        lastCheck: new Date(),
        description: 'Stripe payment gateway'
      },
      {
        name: 'Email Service',
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 150) + 30,
        lastCheck: new Date(),
        description: 'SendGrid email delivery'
      },
      {
        name: 'File Storage',
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 300) + 100,
        lastCheck: new Date(),
        description: 'Cloudinary media storage'
      },
      {
        name: 'Search Engine',
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 80) + 40,
        lastCheck: new Date(),
        description: 'Algolia search service'
      },
      {
        name: 'Real-time Chat',
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 60) + 20,
        lastCheck: new Date(),
        description: 'Socket.IO chat service'
      },
      {
        name: 'Cache Service',
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 30) + 5,
        lastCheck: new Date(),
        description: 'Redis cache layer'
      }
    ];

    // Test database connection to determine if it's actually healthy
    try {
      await dbConnect();
    } catch (error) {
      services[0].status = 'error';
      services[0].responseTime = 0;
    }

    logInfo('System services check performed', { 
      userId: session.user.id,
      servicesCount: services.length
    });

    return NextResponse.json(services);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/system/services' });
    return NextResponse.json(
      { message: 'Services check failed' },
      { status: 500 }
    );
  }
}
