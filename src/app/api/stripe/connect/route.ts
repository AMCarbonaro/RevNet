import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  createConnectAccount, 
  createAccountLink, 
  getConnectAccountStatus,
  createDashboardLink
} from '@/lib/stripe/connect';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';

/**
 * Create or get Connect account
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, accountId } = await req.json();

    if (action === 'create') {
      // Create new Connect account
      const account = await createConnectAccount({
        userId: session.user.id,
        email: session.user.email!,
        country: 'US',
        type: 'express'
      });

      // Save account ID to user
      await connectDB();
      await UserModel.findOneAndUpdate(
        { id: session.user.id },
        { $set: { stripeConnectAccountId: account.id } }
      );

      // Create onboarding link
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const accountLink = await createAccountLink(
        account.id,
        `${baseUrl}/payments/connect/refresh`,
        `${baseUrl}/payments/connect/return`
      );

      return NextResponse.json({
        accountId: account.id,
        onboardingUrl: accountLink.url
      });
    } else if (action === 'dashboard' && accountId) {
      // Create dashboard link
      const dashboardUrl = await createDashboardLink(accountId);

      return NextResponse.json({
        dashboardUrl
      });
    } else if (action === 'status' && accountId) {
      // Get account status
      const status = await getConnectAccountStatus(accountId);

      return NextResponse.json({ status });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Connect API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Get Connect account details
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await UserModel.findOne({ id: session.user.id });

    if (!user?.stripeConnectAccountId) {
      return NextResponse.json({ hasAccount: false });
    }

    const status = await getConnectAccountStatus(user.stripeConnectAccountId);

    return NextResponse.json({
      hasAccount: true,
      accountId: user.stripeConnectAccountId,
      status
    });
  } catch (error: any) {
    console.error('❌ Connect GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get account details' },
      { status: 500 }
    );
  }
}
