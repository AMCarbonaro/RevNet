import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logError, logInfo } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    // Generate CSV content for analytics export
    const csvHeaders = [
      'Date',
      'Users',
      'Projects',
      'Donations',
      'Revenue',
      'Active Users',
      'New Users',
      'User Growth %',
      'Project Growth %',
      'Donation Growth %',
      'Revenue Growth %'
    ];

    // Generate mock data for the specified range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const csvRows = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      csvRows.push([
        date.toISOString().split('T')[0],
        Math.floor(Math.random() * 100) + 50,
        Math.floor(Math.random() * 20) + 10,
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 1000) + 500,
        Math.floor(Math.random() * 80) + 20,
        Math.floor(Math.random() * 15) + 5,
        Math.floor(Math.random() * 20) - 5,
        Math.floor(Math.random() * 30) - 5,
        Math.floor(Math.random() * 25) - 5,
        Math.floor(Math.random() * 35) - 5
      ]);
    }

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Set response headers for CSV download
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${range}.csv"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    logInfo('Analytics data exported', { 
      userId: session.user.id,
      range,
      recordsCount: csvRows.length
    });

    return response;
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/analytics/export' });
    return NextResponse.json(
      { message: 'Export failed' },
      { status: 500 }
    );
  }
}