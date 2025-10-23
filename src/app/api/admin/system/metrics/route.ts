import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User, Project, Donation } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get real-time metrics
    const [
      activeUsers,
      totalProjects,
      totalDonations,
      errorCount
    ] = await Promise.all([
      // Users active in last 24 hours
      User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      
      // Total projects
      Project.countDocuments(),
      
      // Total donations
      Donation.countDocuments(),
      
      // Error count (mock for now)
      Promise.resolve(Math.floor(Math.random() * 5))
    ]);

    const metrics = {
      requestsPerMinute: Math.floor(Math.random() * 500) + 100, // Mock
      activeUsers,
      errorCount,
      averageResponseTime: Math.floor(Math.random() * 200) + 100, // Mock
      databaseConnections: Math.floor(Math.random() * 20) + 5, // Mock
      queueSize: Math.floor(Math.random() * 50) + 10, // Mock
      totalProjects,
      totalDonations,
      lastUpdated: new Date()
    };

    logInfo('System metrics retrieved', { 
      userId: session.user.id,
      activeUsers,
      totalProjects,
      totalDonations
    });

    return NextResponse.json(metrics);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/system/metrics' });
    return NextResponse.json(
      { message: 'Metrics retrieval failed' },
      { status: 500 }
    );
  }
}
