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

    // Get all users with aggregated stats
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'creator',
          as: 'projects'
        }
      },
      {
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'donor',
          as: 'donations'
        }
      },
      {
        $addFields: {
          projectCount: { $size: '$projects' },
          donationCount: { $size: '$donations' },
          totalDonated: { $sum: '$donations.amount' },
          lastLogin: '$lastLoginAt',
          isOnline: {
            $gt: [
              { $ifNull: ['$lastLoginAt', new Date(0)] },
              { $subtract: [new Date(), 5 * 60 * 1000] } // 5 minutes ago
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          userType: 1,
          isBanned: 1,
          emailVerified: 1,
          createdAt: 1,
          updatedAt: 1,
          lastLoginAt: 1,
          projectCount: 1,
          donationCount: 1,
          totalDonated: 1,
          lastLogin: 1,
          isOnline: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    logInfo('Admin users retrieved', { 
      userId: session.user.id,
      userCount: users.length
    });

    return NextResponse.json(users);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/users' });
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}