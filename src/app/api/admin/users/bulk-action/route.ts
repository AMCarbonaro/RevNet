import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userIds, action, reason } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { message: 'Missing or invalid userIds array' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { message: 'Missing action' },
        { status: 400 }
      );
    }

    await dbConnect();

    let updateOperation;
    let logMessage;
    let successCount = 0;

    switch (action) {
      case 'ban':
        updateOperation = {
          isBanned: true,
          bannedAt: new Date(),
          bannedBy: session.user.id,
          banReason: reason || 'Bulk banned by admin'
        };
        logMessage = 'Users bulk banned';
        break;

      case 'unban':
        updateOperation = {
          isBanned: false,
          bannedAt: null,
          bannedBy: null,
          banReason: null
        };
        logMessage = 'Users bulk unbanned';
        break;

      case 'promote':
        updateOperation = {
          userType: 'moderator',
          promotedAt: new Date(),
          promotedBy: session.user.id,
          promotionReason: reason || 'Bulk promoted by admin'
        };
        logMessage = 'Users bulk promoted to moderator';
        break;

      case 'demote':
        updateOperation = {
          userType: 'user',
          promotedAt: null,
          promotedBy: null,
          promotionReason: null
        };
        logMessage = 'Users bulk demoted to user';
        break;

      case 'verify_email':
        updateOperation = {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          verifiedBy: session.user.id
        };
        logMessage = 'Users bulk email verified';
        break;

      case 'delete':
        // For delete, we need to use deleteMany instead of updateMany
        const deleteResult = await User.deleteMany({
          _id: { $in: userIds }
        });
        successCount = deleteResult.deletedCount;
        logMessage = 'Users bulk deleted';
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    if (action !== 'delete') {
      const updateResult = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: updateOperation }
      );
      successCount = updateResult.modifiedCount;
    }

    logInfo(logMessage, { 
      adminUserId: session.user.id,
      targetUserIds: userIds,
      action,
      reason,
      successCount,
      totalRequested: userIds.length
    });

    return NextResponse.json({
      message: logMessage,
      successCount,
      totalRequested: userIds.length
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/users/bulk-action' });
    return NextResponse.json(
      { message: 'Bulk action failed' },
      { status: 500 }
    );
  }
}