import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnectChannel from '@/lib/mongodb';
import { User, Project, Donation } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    await dbConnectChannel();

    // Calculate date range
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get basic metrics
    const [
      totalUsers,
      totalProjects,
      totalDonations,
      activeUsers,
      newUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Donation.countDocuments(),
      User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
    ]);

    // Get revenue
    const revenueResult = await Donation.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Calculate growth rates (mock for now)
    const userGrowth = Math.floor(Math.random() * 20) - 5;
    const projectGrowth = Math.floor(Math.random() * 30) - 5;
    const donationGrowth = Math.floor(Math.random() * 25) - 5;
    const revenueGrowth = Math.floor(Math.random() * 35) - 5;

    // Generate user activity data
    const userActivity = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      userActivity.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 50,
        projects: Math.floor(Math.random() * 20) + 10,
        donations: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 1000) + 500,
      });
    }

    // Project categories
    const projectCategories = [
      { name: 'Political Campaign', value: 35, color: '#39FF14' },
      { name: 'Community Organization', value: 25, color: '#00DDEB' },
      { name: 'Grassroots Movement', value: 20, color: '#8B5CF6' },
      { name: 'Environmental Protection', value: 15, color: '#FF10F0' },
      { name: 'Social Justice', value: 5, color: '#FF8C00' },
    ];

    // User types
    const userTypes = [
      { name: 'Supporters', value: 70, color: '#39FF14' },
      { name: 'Creators', value: 25, color: '#00DDEB' },
      { name: 'Moderators', value: 4, color: '#8B5CF6' },
      { name: 'Admins', value: 1, color: '#FF10F0' },
    ];

    // Top projects
    const topProjects = [
      {
        title: 'Climate Action Initiative',
        creator: 'Sarah Johnson',
        funding: 45000,
        goal: 50000,
        backers: 234
      },
      {
        title: 'Community Garden Project',
        creator: 'Mike Chen',
        funding: 32000,
        goal: 40000,
        backers: 189
      },
      {
        title: 'Youth Education Program',
        creator: 'Emily Rodriguez',
        funding: 28000,
        goal: 35000,
        backers: 156
      },
      {
        title: 'Healthcare Access Campaign',
        creator: 'David Kim',
        funding: 25000,
        goal: 30000,
        backers: 142
      },
      {
        title: 'Housing Rights Movement',
        creator: 'Lisa Thompson',
        funding: 22000,
        goal: 25000,
        backers: 128
      }
    ];

    // Recent activity
    const recentActivity = [
      {
        type: 'user_registration',
        description: 'New user registered: John Smith',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        user: 'System'
      },
      {
        type: 'project_created',
        description: 'New project created: Community Cleanup',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: 'Alice Johnson'
      },
      {
        type: 'donation_received',
        description: 'Donation received: $500 for Climate Action',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'Bob Wilson'
      },
      {
        type: 'project_completed',
        description: 'Project completed: Youth Education Program',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        user: 'Emily Rodriguez'
      },
      {
        type: 'user_verified',
        description: 'User verified: Sarah Johnson',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        user: 'Admin'
      }
    ];

    const analytics = {
      totalUsers,
      totalProjects,
      totalDonations,
      totalRevenue,
      activeUsers,
      newUsers,
      userGrowth,
      projectGrowth,
      donationGrowth,
      revenueGrowth,
      userActivity,
      projectCategories,
      userTypes,
      topProjects,
      recentActivity
    };

    logInfo('Analytics data retrieved', { 
      userId: session.user.id,
      range,
      totalUsers,
      totalProjects,
      totalRevenue
    });

    return NextResponse.json(analytics);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/analytics' });
    return NextResponse.json(
      { message: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
