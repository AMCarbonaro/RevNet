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

    const { donationId, action, reason } = await req.json();

    if (!donationId || !action) {
      return NextResponse.json(
        { message: 'Missing donationId or action' },
        { status: 400 }
      );
    }

    await dbConnect();

    let result;
    let logMessage;

    switch (action) {
      case 'refund':
        result = await Donation.findByIdAndUpdate(
          donationId,
          { 
            status: 'refunded',
            refundedAt: new Date(),
            refundedBy: session.user.id,
            refundReason: reason || 'Refunded by admin'
          },
          { new: true }
        );
        logMessage = 'Donation refunded';
        break;

      case 'retry':
        result = await Donation.findByIdAndUpdate(
          donationId,
          { 
            status: 'pending',
            retryAttempts: { $inc: 1 },
            retriedAt: new Date(),
            retriedBy: session.user.id
          },
          { new: true }
        );
        logMessage = 'Donation payment retry initiated';
        break;

      case 'approve':
        result = await Donation.findByIdAndUpdate(
          donationId,
          { 
            status: 'completed',
            approvedAt: new Date(),
            approvedBy: session.user.id,
            approvalReason: reason || 'Approved by admin'
          },
          { new: true }
        );
        logMessage = 'Donation approved';
        break;

      case 'reject':
        result = await Donation.findByIdAndUpdate(
          donationId,
          { 
            status: 'rejected',
            rejectedAt: new Date(),
            rejectedBy: session.user.id,
            rejectionReason: reason || 'Rejected by admin'
          },
          { new: true }
        );
        logMessage = 'Donation rejected';
        break;

      case 'view':
        result = await Donation.findById(donationId);
        logMessage = 'Donation details retrieved';
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { message: 'Donation not found' },
        { status: 404 }
      );
    }

    logInfo(logMessage, { 
      adminUserId: session.user.id,
      targetDonationId: donationId,
      action,
      reason,
      donationAmount: result.amount,
      donationStatus: result.status
    });

    return NextResponse.json({
      message: logMessage,
      donation: result
    });
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/donations/action' });
    return NextResponse.json(
      { message: 'Action failed' },
      { status: 500 }
    );
  }
}