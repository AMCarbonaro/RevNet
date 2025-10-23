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

    // Get system health metrics
    const healthData = {
      status: 'healthy' as const,
      uptime: process.uptime(),
      responseTime: Math.floor(Math.random() * 500) + 100, // Mock response time
      errorRate: Math.random() * 2, // Mock error rate
      memoryUsage: Math.floor(Math.random() * 30) + 40, // Mock memory usage
      cpuUsage: Math.floor(Math.random() * 20) + 10, // Mock CPU usage
      diskUsage: Math.floor(Math.random() * 40) + 30, // Mock disk usage
      lastUpdated: new Date(),
    };

    // Test database connection
    try {
      await dbConnect();
      healthData.status = 'healthy';
    } catch (error) {
      healthData.status = 'error';
      healthData.errorRate = 100;
    }

    logInfo('System health check performed', { 
      userId: session.user.id,
      status: healthData.status
    });

    return NextResponse.json(healthData);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/system/health' });
    return NextResponse.json(
      { message: 'Health check failed' },
      { status: 500 }
    );
  }
}
