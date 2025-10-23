import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Donation, Project, User } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get('dateRange') || '30d';

    await dbConnect();

    // Calculate date filter
    let dateFilter = {};
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Get all donations with aggregated details
    const donations = await Donation.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'donor',
          foreignField: '_id',
          as: 'donorInfo'
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'projectInfo.creator',
          foreignField: '_id',
          as: 'creatorInfo'
        }
      },
      {
        $addFields: {
          donorName: { $arrayElemAt: ['$donorInfo.name', 0] },
          donorEmail: { $arrayElemAt: ['$donorInfo.email', 0] },
          projectTitle: { $arrayElemAt: ['$projectInfo.title', 0] },
          projectCreatorName: { $arrayElemAt: ['$creatorInfo.name', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          status: 1,
          paymentMethod: 1,
          createdAt: 1,
          updatedAt: 1,
          donorName: 1,
          donorEmail: 1,
          projectTitle: 1,
          projectCreatorName: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    logInfo('Admin donations retrieved', { 
      userId: session.user.id,
      donationCount: donations.length,
      dateRange
    });

    return NextResponse.json(donations);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/donations' });
    return NextResponse.json(
      { message: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}