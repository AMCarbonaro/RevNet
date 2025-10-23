import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Project, User, Donation } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all projects with aggregated stats
    const projects = await Project.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorInfo'
        }
      },
      {
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'project',
          as: 'donations'
        }
      },
      {
        $addFields: {
          creatorName: { $arrayElemAt: ['$creatorInfo.name', 0] },
          creatorEmail: { $arrayElemAt: ['$creatorInfo.email', 0] },
          totalDonations: { $size: '$donations' },
          totalBackers: { $size: { $setUnion: '$donations.donor' } },
          completionPercentage: {
            $multiply: [
              { $divide: ['$currentFunding', '$fundingGoal'] },
              100
            ]
          },
          daysRemaining: {
            $divide: [
              { $subtract: ['$deadline', new Date()] },
              24 * 60 * 60 * 1000
            ]
          },
          isOverdue: {
            $lt: ['$deadline', new Date()]
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          status: 1,
          tags: 1,
          fundingGoal: 1,
          currentFunding: 1,
          deadline: 1,
          createdAt: 1,
          updatedAt: 1,
          creatorName: 1,
          creatorEmail: 1,
          totalDonations: 1,
          totalBackers: 1,
          completionPercentage: 1,
          daysRemaining: 1,
          isOverdue: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    logInfo('Admin projects retrieved', { 
      userId: session.user.id,
      projectCount: projects.length
    });

    return NextResponse.json(projects);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/projects' });
    return NextResponse.json(
      { message: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}