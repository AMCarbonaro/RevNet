import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Project, Donation, User } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, action, reason } = await req.json();

    if (!itemId || !action) {
      return NextResponse.json(
        { message: 'Missing itemId or action' },
        { status: 400 }
      );
    }

    await dbConnect();

    let result;
    let logMessage;

    // Try to find the item in different collections
    let item = await Project.findById(itemId);
    let itemType = 'project';

    if (!item) {
      item = await Donation.findById(itemId);
      itemType = 'donation';
    }

    if (!item) {
      item = await User.findById(itemId);
      itemType = 'user';
    }

    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'approve':
        if (itemType === 'project') {
          result = await Project.findByIdAndUpdate(
            itemId,
            { 
              status: 'active',
              approvedAt: new Date(),
              approvedBy: session.user.id,
              approvalReason: reason || 'Approved by admin'
            },
            { new: true }
          );
        } else if (itemType === 'donation') {
          result = await Donation.findByIdAndUpdate(
            itemId,
            { 
              status: 'completed',
              approvedAt: new Date(),
              approvedBy: session.user.id,
              approvalReason: reason || 'Approved by admin'
            },
            { new: true }
          );
        } else if (itemType === 'user') {
          result = await User.findByIdAndUpdate(
            itemId,
            { 
              isBanned: false,
              unbannedAt: new Date(),
              unbannedBy: session.user.id,
              unbanReason: reason || 'Unbanned by admin'
            },
            { new: true }
          );
        }
        logMessage = `${itemType} approved`;
        break;

      case 'reject':
        if (itemType === 'project') {
          result = await Project.findByIdAndUpdate(
            itemId,
            { 
              status: 'rejected',
              rejectedAt: new Date(),
              rejectedBy: session.user.id,
              rejectionReason: reason || 'Rejected by admin'
            },
            { new: true }
          );
        } else if (itemType === 'donation') {
          result = await Donation.findByIdAndUpdate(
            itemId,
            { 
              status: 'rejected',
              rejectedAt: new Date(),
              rejectedBy: session.user.id,
              rejectionReason: reason || 'Rejected by admin'
            },
            { new: true }
          );
        } else if (itemType === 'user') {
          result = await User.findByIdAndUpdate(
            itemId,
            { 
              isBanned: true,
              bannedAt: new Date(),
              bannedBy: session.user.id,
              banReason: reason || 'Banned by admin'
            },
            { new: true }
          );
        }
        logMessage = `${itemType} rejected`;
        break;

      case 'escalate':
        // For escalation, we might want to create a separate escalation record
        // For now, we'll just update the status
        if (itemType === 'project') {
          result = await Project.findByIdAndUpdate(
            itemId,
            { 
              status: 'escalated',
              escalatedAt: new Date(),
              escalatedBy: session.user.id,
              escalationReason: reason || 'Escalated by admin'
            },
            { new: true }
          );
        } else if (itemType === 'donation') {
          result = await Donation.findByIdAndUpdate(
            itemId,
            { 
              status: 'escalated',
              escalatedAt: new Date(),
              escalatedBy: session.user.id,
              escalationReason: reason || 'Escalated by admin'
            },
            { new: true }
          );
        } else if (itemType === 'user') {
          result = await User.findByIdAndUpdate(
            itemId,
            { 
              escalatedAt: new Date(),
              escalatedBy: session.user.id,
              escalationReason: reason || 'Escalated by admin'
            },
            { new: true }
          );
        }
        logMessage = `${itemType} escalated`;
        break;

      case 'view':
        result = item;
        logMessage = `${itemType} details retrieved`;
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { message: 'Action failed' },
        { status: 500 }
      );
    }

    logInfo(logMessage, { 
      adminUserId: session.user.id,
      targetItemId: itemId,
      itemType,
      action,
      reason
    });

    return NextResponse.json({
      message: logMessage,
      item: result,
      itemType
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/moderation/action' });
    return NextResponse.json(
      { message: 'Action failed' },
      { status: 500 }
    );
  }
}