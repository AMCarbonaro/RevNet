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

    // Get basic stats
    const [
      totalUsers,
      totalProjects,
      totalDonations,
      activeUsers,
      pendingProjects,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Donation.countDocuments(),
      User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Project.countDocuments({ status: 'pending' }),
    ]);

    // Get total revenue
    const revenueResult = await Donation.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get recent activity (last 10 activities)
    const recentActivity = await Promise.all([
      // Recent user registrations
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt')
        .lean(),
      
      // Recent project creations
      Project.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt')
        .lean(),
      
      // Recent donations
      Donation.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount donorName createdAt')
        .lean(),
    ]);

    // Format recent activity
    const formattedActivity = [
      ...recentActivity[0].map(user => ({
        type: 'user_registration',
        description: `New user registered: ${user.name}`,
        createdAt: user.createdAt,
      })),
      ...recentActivity[1].map(project => ({
        type: 'project_created',
        description: `New project created: ${project.title}`,
        createdAt: project.createdAt,
      })),
      ...recentActivity[2].map(donation => ({
        type: 'donation_received',
        description: `Donation received: $${donation.amount} from ${donation.donorName}`,
        createdAt: donation.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const stats = {
      totalUsers,
      totalProjects,
      totalDonations,
      totalRevenue,
      activeUsers,
      pendingProjects,
      recentActivity: formattedActivity,
    };

    logInfo('Admin stats retrieved', { 
      userId: session.user.id,
      stats: {
        totalUsers,
        totalProjects,
        totalDonations,
        totalRevenue,
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/stats' });
    return NextResponse.json(
      { message: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
