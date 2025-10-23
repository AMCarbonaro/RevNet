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

    const { projectId, action, reason } = await req.json();

    if (!projectId || !action) {
      return NextResponse.json(
        { message: 'Missing projectId or action' },
        { status: 400 }
      );
    }

    await dbConnect();

    let result;
    let logMessage;

    switch (action) {
      case 'approve':
        result = await Project.findByIdAndUpdate(
          projectId,
          { 
            status: 'active',
            approvedAt: new Date(),
            approvedBy: session.user.id,
            approvalReason: reason || 'Approved by admin'
          },
          { new: true }
        );
        logMessage = 'Project approved';
        break;

      case 'reject':
        result = await Project.findByIdAndUpdate(
          projectId,
          { 
            status: 'rejected',
            rejectedAt: new Date(),
            rejectedBy: session.user.id,
            rejectionReason: reason || 'Rejected by admin'
          },
          { new: true }
        );
        logMessage = 'Project rejected';
        break;

      case 'suspend':
        result = await Project.findByIdAndUpdate(
          projectId,
          { 
            status: 'suspended',
            suspendedAt: new Date(),
            suspendedBy: session.user.id,
            suspensionReason: reason || 'Suspended by admin'
          },
          { new: true }
        );
        logMessage = 'Project suspended';
        break;

      case 'unsuspend':
        result = await Project.findByIdAndUpdate(
          projectId,
          { 
            status: 'active',
            suspendedAt: null,
            suspendedBy: null,
            suspensionReason: null
          },
          { new: true }
        );
        logMessage = 'Project unsuspended';
        break;

      case 'complete':
        result = await Project.findByIdAndUpdate(
          projectId,
          { 
            status: 'completed',
            completedAt: new Date(),
            completedBy: session.user.id
          },
          { new: true }
        );
        logMessage = 'Project marked as completed';
        break;

      case 'delete':
        result = await Project.findByIdAndDelete(projectId);
        logMessage = 'Project deleted';
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    logInfo(logMessage, { 
      adminUserId: session.user.id,
      targetProjectId: projectId,
      action,
      reason,
      projectTitle: result.title
    });

    return NextResponse.json({
      message: logMessage,
      project: result
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/projects/action' });
    return NextResponse.json(
      { message: 'Action failed' },
      { status: 500 }
    );
  }
}