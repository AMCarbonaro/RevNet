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

    const { itemIds, action, reason } = await req.json();

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { message: 'Missing or invalid itemIds array' },
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

    let successCount = 0;
    let logMessage = '';

    // Process each item individually to handle different types
    for (const itemId of itemIds) {
      try {
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
          continue; // Skip if item not found
        }

        let updateOperation;

        switch (action) {
          case 'approve':
            if (itemType === 'project') {
              updateOperation = {
                status: 'active',
                approvedAt: new Date(),
                approvedBy: session.user.id,
                approvalReason: reason || 'Bulk approved by admin'
              };
            } else if (itemType === 'donation') {
              updateOperation = {
                status: 'completed',
                approvedAt: new Date(),
                approvedBy: session.user.id,
                approvalReason: reason || 'Bulk approved by admin'
              };
            } else if (itemType === 'user') {
              updateOperation = {
                isBanned: false,
                unbannedAt: new Date(),
                unbannedBy: session.user.id,
                unbanReason: reason || 'Bulk unbanned by admin'
              };
            }
            logMessage = 'Items bulk approved';
            break;

          case 'reject':
            if (itemType === 'project') {
              updateOperation = {
                status: 'rejected',
                rejectedAt: new Date(),
                rejectedBy: session.user.id,
                rejectionReason: reason || 'Bulk rejected by admin'
              };
            } else if (itemType === 'donation') {
              updateOperation = {
                status: 'rejected',
                rejectedAt: new Date(),
                rejectedBy: session.user.id,
                rejectionReason: reason || 'Bulk rejected by admin'
              };
            } else if (itemType === 'user') {
              updateOperation = {
                isBanned: true,
                bannedAt: new Date(),
                bannedBy: session.user.id,
                banReason: reason || 'Bulk banned by admin'
              };
            }
            logMessage = 'Items bulk rejected';
            break;

          case 'escalate':
            if (itemType === 'project') {
              updateOperation = {
                status: 'escalated',
                escalatedAt: new Date(),
                escalatedBy: session.user.id,
                escalationReason: reason || 'Bulk escalated by admin'
              };
            } else if (itemType === 'donation') {
              updateOperation = {
                status: 'escalated',
                escalatedAt: new Date(),
                escalatedBy: session.user.id,
                escalationReason: reason || 'Bulk escalated by admin'
              };
            } else if (itemType === 'user') {
              updateOperation = {
                escalatedAt: new Date(),
                escalatedBy: session.user.id,
                escalationReason: reason || 'Bulk escalated by admin'
              };
            }
            logMessage = 'Items bulk escalated';
            break;

          default:
            continue; // Skip invalid actions
        }

        // Apply the update based on item type
        if (updateOperation) {
          if (itemType === 'project') {
            await Project.findByIdAndUpdate(itemId, { $set: updateOperation });
          } else if (itemType === 'donation') {
            await Donation.findByIdAndUpdate(itemId, { $set: updateOperation });
          } else if (itemType === 'user') {
            await User.findByIdAndUpdate(itemId, { $set: updateOperation });
          }
          successCount++;
        }
      } catch (error) {
        // Continue processing other items even if one fails
        console.error(`Failed to process item ${itemId}:`, error);
      }
    }

    logInfo(logMessage, { 
      adminUserId: session.user.id,
      targetItemIds: itemIds,
      action,
      reason,
      successCount,
      totalRequested: itemIds.length
    });

    return NextResponse.json({
      message: logMessage,
      successCount,
      totalRequested: itemIds.length
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/moderation/bulk-action' });
    return NextResponse.json(
      { message: 'Bulk action failed' },
      { status: 500 }
    );
  }
}