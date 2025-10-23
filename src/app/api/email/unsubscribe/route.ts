import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { email, token, type, preferences } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify token if provided
    if (token && user.unsubscribeToken !== token) {
      return NextResponse.json({ message: 'Invalid unsubscribe token' }, { status: 400 });
    }

    if (type === 'all') {
      // Unsubscribe from all emails
      await UserModel.findByIdAndUpdate(user._id, {
        emailPreferences: {
          newsletters: false,
          projectUpdates: false,
          securityAlerts: false,
          marketing: false
        },
        unsubscribedAt: new Date()
      });

      logger.info('User unsubscribed from all emails', { userId: user._id, email });
    } else if (type === 'partial') {
      // Update specific preferences
      await UserModel.findByIdAndUpdate(user._id, {
        emailPreferences: {
          newsletters: preferences.newsletters || false,
          projectUpdates: preferences.projectUpdates || false,
          securityAlerts: preferences.securityAlerts || false,
          marketing: preferences.marketing || false
        },
        lastPreferenceUpdate: new Date()
      });

      logger.info('User email preferences updated', { userId: user._id, email, preferences });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unsubscribe error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify token if provided
    if (token && user.unsubscribeToken !== token) {
      return NextResponse.json({ message: 'Invalid unsubscribe token' }, { status: 400 });
    }

    return NextResponse.json({
      email: user.email,
      preferences: user.emailPreferences || {
        newsletters: true,
        projectUpdates: true,
        securityAlerts: true,
        marketing: false
      }
    });
  } catch (error) {
    logger.error('Get unsubscribe preferences error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
