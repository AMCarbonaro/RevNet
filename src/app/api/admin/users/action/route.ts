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

    const { userId, action, reason } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { message: 'Missing userId or action' },
        { status: 400 }
      );
    }

    await dbConnect();

    let result;
    let logMessage;

    switch (action) {
      case 'ban':
        result = await User.findByIdAndUpdate(
          userId,
          { 
            isBanned: true,
            bannedAt: new Date(),
            bannedBy: session.user.id,
            banReason: reason || 'Banned by admin'
          },
          { new: true }
        );
        logMessage = 'User banned';
        break;

      case 'unban':
        result = await User.findByIdAndUpdate(
          userId,
          { 
            isBanned: false,
            bannedAt: null,
            bannedBy: null,
            banReason: null
          },
          { new: true }
        );
        logMessage = 'User unbanned';
        break;

      case 'promote':
        result = await User.findByIdAndUpdate(
          userId,
          { 
            userType: 'moderator',
            promotedAt: new Date(),
            promotedBy: session.user.id,
            promotionReason: reason || 'Promoted by admin'
          },
          { new: true }
        );
        logMessage = 'User promoted to moderator';
        break;

      case 'demote':
        result = await User.findByIdAndUpdate(
          userId,
          { 
            userType: 'user',
            promotedAt: null,
            promotedBy: null,
            promotionReason: null
          },
          { new: true }
        );
        logMessage = 'User demoted to user';
        break;

      case 'verify_email':
        result = await User.findByIdAndUpdate(
          userId,
          { 
            emailVerified: true,
            emailVerifiedAt: new Date(),
            verifiedBy: session.user.id
          },
          { new: true }
        );
        logMessage = 'User email verified';
        break;

      case 'delete':
        result = await User.findByIdAndDelete(userId);
        logMessage = 'User deleted';
        break;

      case 'view':
        result = await User.findById(userId);
        logMessage = 'User details retrieved';
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    logInfo(logMessage, { 
      adminUserId: session.user.id,
      targetUserId: userId,
      action,
      reason,
      targetUserEmail: result.email,
      targetUserName: result.name
    });

    return NextResponse.json({
      message: logMessage,
      user: result
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/users/action' });
    return NextResponse.json(
      { message: 'Action failed' },
      { status: 500 }
    );
  }
}