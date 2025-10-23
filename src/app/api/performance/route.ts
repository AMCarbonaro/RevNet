import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { PerformanceMetricsModel } from '@/lib/models';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const performanceData = await req.json();

    // Validate performance data
    if (!performanceData.metrics || !performanceData.url) {
      return NextResponse.json({ message: 'Invalid performance data' }, { status: 400 });
    }

    // Create performance metrics record
    const performanceRecord = new PerformanceMetricsModel({
      userId: session.user.id,
      url: performanceData.url,
      metrics: performanceData.metrics,
      timestamp: new Date(performanceData.timestamp || Date.now()),
      userAgent: req.headers.get('user-agent'),
      ip: req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    });

    await performanceRecord.save();

    logger.info('Performance metrics recorded', {
      userId: session.user.id,
      url: performanceData.url,
      metrics: performanceData.metrics
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error recording performance metrics:', error);
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const url = searchParams.get('url');
    const limit = parseInt(searchParams.get('limit') || '100');

    const query: any = { userId: session.user.id };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    if (url) {
      query.url = { $regex: url, $options: 'i' };
    }

    const performanceData = await PerformanceMetricsModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Calculate aggregated metrics
    const aggregatedMetrics = calculateAggregatedMetrics(performanceData);

    return NextResponse.json({ 
      data: performanceData,
      aggregated: aggregatedMetrics
    });
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

function calculateAggregatedMetrics(data: any[]) {
  if (data.length === 0) return null;

  const metrics = {
    lcp: { sum: 0, count: 0, min: Infinity, max: 0 },
    fid: { sum: 0, count: 0, min: Infinity, max: 0 },
    cls: { sum: 0, count: 0, min: Infinity, max: 0 },
    fcp: { sum: 0, count: 0, min: Infinity, max: 0 },
    ttfb: { sum: 0, count: 0, min: Infinity, max: 0 },
    pageLoadTime: { sum: 0, count: 0, min: Infinity, max: 0 }
  };

  data.forEach(record => {
    const recordMetrics = record.metrics;
    
    Object.keys(metrics).forEach(metric => {
      if (recordMetrics[metric] !== undefined) {
        const value = recordMetrics[metric];
        metrics[metric].sum += value;
        metrics[metric].count++;
        metrics[metric].min = Math.min(metrics[metric].min, value);
        metrics[metric].max = Math.max(metrics[metric].max, value);
      }
    });
  });

  const aggregated = {};
  Object.keys(metrics).forEach(metric => {
    if (metrics[metric].count > 0) {
      aggregated[metric] = {
        average: metrics[metric].sum / metrics[metric].count,
        min: metrics[metric].min === Infinity ? 0 : metrics[metric].min,
        max: metrics[metric].max,
        count: metrics[metric].count
      };
    }
  });

  return aggregated;
}
