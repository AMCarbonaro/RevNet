import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { AnalyticsEventModel } from '@/lib/models';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const analyticsEvent = await req.json();

    // Validate the analytics event structure
    if (!analyticsEvent.event || !analyticsEvent.properties) {
      return NextResponse.json({ message: 'Invalid analytics event' }, { status: 400 });
    }

    // Create analytics event record
    const eventRecord = new AnalyticsEventModel({
      userId: session.user.id,
      event: analyticsEvent.event,
      properties: analyticsEvent.properties,
      sessionId: analyticsEvent.sessionId,
      page: analyticsEvent.page,
      referrer: analyticsEvent.referrer,
      userAgent: analyticsEvent.userAgent,
      ip: req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      timestamp: new Date(analyticsEvent.timestamp || Date.now())
    });

    await eventRecord.save();

    logger.info('Analytics event tracked', {
      userId: session.user.id,
      event: analyticsEvent.event,
      sessionId: analyticsEvent.sessionId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error tracking analytics event:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const event = searchParams.get('event');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    const query: any = { userId: session.user.id };
    
    if (event) {
      query.event = event;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const events = await AnalyticsEventModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ events });
  } catch (error) {
    logger.error('Error fetching analytics events:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
