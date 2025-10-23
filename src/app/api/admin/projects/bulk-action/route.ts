import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Project } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectIds, action, reason } = await req.json();

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { message: 'Missing or invalid projectIds array' },
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
      case 'approve':
        updateOperation = {
          status: 'active',
          approvedAt: new Date(),
          approvedBy: session.user.id,
          approvalReason: reason || 'Bulk approved by admin'
        };
        logMessage = 'Projects bulk approved';
        break;

      case 'reject':
        updateOperation = {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: session.user.id,
          rejectionReason: reason || 'Bulk rejected by admin'
        };
        logMessage = 'Projects bulk rejected';
        break;

      case 'suspend':
        updateOperation = {
          status: 'suspended',
          suspendedAt: new Date(),
          suspendedBy: session.user.id,
          suspensionReason: reason || 'Bulk suspended by admin'
        };
        logMessage = 'Projects bulk suspended';
        break;

      case 'unsuspend':
        updateOperation = {
          status: 'active',
          suspendedAt: null,
          suspendedBy: null,
          suspensionReason: null
        };
        logMessage = 'Projects bulk unsuspended';
        break;

      case 'complete':
        updateOperation = {
          status: 'completed',
          completedAt: new Date(),
          completedBy: session.user.id
        };
        logMessage = 'Projects bulk completed';
        break;

      case 'delete':
        // For delete, we need to use deleteMany instead of updateMany
        const deleteResult = await Project.deleteMany({
          _id: { $in: projectIds }
        });
        successCount = deleteResult.deletedCount;
        logMessage = 'Projects bulk deleted';
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    if (action !== 'delete') {
      const updateResult = await Project.updateMany(
        { _id: { $in: projectIds } },
        { $set: updateOperation }
      );
      successCount = updateResult.modifiedCount;
    }

    logInfo(logMessage, { 
      adminUserId: session.user.id,
      targetProjectIds: projectIds,
      action,
      reason,
      successCount,
      totalRequested: projectIds.length
    });

    return NextResponse.json({
      message: logMessage,
      successCount,
      totalRequested: projectIds.length
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/projects/bulk-action' });
    return NextResponse.json(
      { message: 'Bulk action failed' },
      { status: 500 }
    );
  }
}