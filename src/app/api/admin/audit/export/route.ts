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
    const format = searchParams.get('format') || 'csv';

    if (format !== 'csv') {
      return NextResponse.json(
        { message: 'Unsupported export format' },
        { status: 400 }
      );
    }

    // Mock audit logs data - same as in the main audit endpoint
    const mockAuditLogs = [
      {
        _id: '1',
        action: 'login',
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        resource: 'authentication',
        resourceId: 'auth1',
        details: { method: 'oauth', provider: 'google' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        severity: 'low',
        status: 'success'
      },
      {
        _id: '2',
        action: 'create',
        userId: 'user2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        resource: 'project',
        resourceId: 'project1',
        details: { title: 'New Project', category: 'activism' },
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'medium',
        status: 'success'
      },
      {
        _id: '3',
        action: 'admin',
        userId: 'admin1',
        userName: 'Admin User',
        userEmail: 'admin@example.com',
        resource: 'user',
        resourceId: 'user3',
        details: { action: 'ban', reason: 'policy violation' },
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        severity: 'high',
        status: 'success'
      }
    ];

    // Generate CSV content
    const csvHeaders = [
      'Timestamp',
      'Action',
      'User Name',
      'User Email',
      'Resource',
      'Resource ID',
      'Severity',
      'Status',
      'IP Address',
      'User Agent',
      'Details'
    ];

    const csvRows = mockAuditLogs.map(log => [
      log.timestamp.toISOString(),
      log.action,
      log.userName,
      log.userEmail,
      log.resource,
      log.resourceId,
      log.severity,
      log.status,
      log.ipAddress,
      log.userAgent,
      JSON.stringify(log.details)
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Set response headers for CSV download
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="audit-logs.csv"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    logInfo('Audit logs exported', { 
      userId: session.user.id,
      format,
      recordsCount: mockAuditLogs.length
    });

    return response;
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/audit/export' });
    return NextResponse.json(
      { message: 'Export failed' },
      { status: 500 }
    );
  }
}
