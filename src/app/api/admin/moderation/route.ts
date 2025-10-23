import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Project, Donation, User } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get moderation items from various sources
    const moderationItems = [];

    // Get pending projects
    const pendingProjects = await Project.find({ status: 'draft' }).lean();
    for (const project of pendingProjects) {
      moderationItems.push({
        _id: project._id,
        type: 'project',
        title: project.title,
        description: project.description,
        status: 'pending',
        priority: 'medium',
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        reason: 'Project awaiting approval'
      });
    }

    // Get flagged users
    const flaggedUsers = await User.find({ isBanned: true }).lean();
    for (const user of flaggedUsers) {
      moderationItems.push({
        _id: user._id,
        type: 'user',
        title: `${user.name} (${user.email})`,
        description: 'User has been flagged or banned',
        status: 'pending',
        priority: 'high',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        reason: 'User flagged for review'
      });
    }

    // Get failed donations
    const failedDonations = await Donation.find({ status: 'failed' }).lean();
    for (const donation of failedDonations) {
      moderationItems.push({
        _id: donation._id,
        type: 'donation',
        title: `Failed Donation - $${donation.amount}`,
        description: 'Donation payment failed',
        status: 'pending',
        priority: 'medium',
        createdAt: donation.createdAt,
        updatedAt: donation.updatedAt,
        reason: 'Payment processing failed'
      });
    }

    // Sort by priority and creation date
    moderationItems.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    logInfo('Admin moderation items retrieved', { 
      userId: session.user.id,
      itemCount: moderationItems.length
    });

    return NextResponse.json(moderationItems);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/moderation' });
    return NextResponse.json(
      { message: 'Failed to fetch moderation items' },
      { status: 500 }
    );
  }
}