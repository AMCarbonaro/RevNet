import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Donation } from '@/lib/models';
import { logError, logInfo } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { donationIds, action, reason } = await req.json();

    if (!donationIds || !Array.isArray(donationIds) || donationIds.length === 0) {
      return NextResponse.json(
        { message: 'Missing or invalid donationIds array' },
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
      case 'refund':
        updateOperation = {
          status: 'refunded',
          refundedAt: new Date(),
          refundedBy: session.user.id,
          refundReason: reason || 'Bulk refunded by admin'
        };
        logMessage = 'Donations bulk refunded';
        break;

      case 'approve':
        updateOperation = {
          status: 'completed',
          approvedAt: new Date(),
          approvedBy: session.user.id,
          approvalReason: reason || 'Bulk approved by admin'
        };
        logMessage = 'Donations bulk approved';
        break;

      case 'reject':
        updateOperation = {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: session.user.id,
          rejectionReason: reason || 'Bulk rejected by admin'
        };
        logMessage = 'Donations bulk rejected';
        break;

      case 'retry':
        updateOperation = {
          status: 'pending',
          $inc: { retryAttempts: 1 },
          retriedAt: new Date(),
          retriedBy: session.user.id
        };
        logMessage = 'Donations bulk retry initiated';
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    const updateResult = await Donation.updateMany(
      { _id: { $in: donationIds } },
      { $set: updateOperation }
    );
    successCount = updateResult.modifiedCount;

    logInfo(logMessage, { 
      adminUserId: session.user.id,
      targetDonationIds: donationIds,
      action,
      reason,
      successCount,
      totalRequested: donationIds.length
    });

    return NextResponse.json({
      message: logMessage,
      successCount,
      totalRequested: donationIds.length
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/donations/bulk-action' });
    return NextResponse.json(
      { message: 'Bulk action failed' },
      { status: 500 }
    );
  }
}