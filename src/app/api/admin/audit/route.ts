import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { logError, logInfo } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const action = searchParams.get('action');
    const search = searchParams.get('search');

    // Mock audit logs data - in a real implementation, you would query from a dedicated audit log collection
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
        severity: 'low' as const,
        status: 'success' as const
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
        severity: 'medium' as const,
        status: 'success' as const
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
        severity: 'high' as const,
        status: 'success' as const
      },
      {
        _id: '4',
        action: 'delete',
        userId: 'user4',
        userName: 'Bob Wilson',
        userEmail: 'bob@example.com',
        resource: 'project',
        resourceId: 'project2',
        details: { title: 'Deleted Project' },
        ipAddress: '192.168.1.4',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        severity: 'medium' as const,
        status: 'success' as const
      },
      {
        _id: '5',
        action: 'login',
        userId: 'user5',
        userName: 'Alice Johnson',
        userEmail: 'alice@example.com',
        resource: 'authentication',
        resourceId: 'auth2',
        details: { method: 'password', attempts: 3 },
        ipAddress: '192.168.1.5',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        severity: 'high' as const,
        status: 'failure' as const
      }
    ];

    // Filter logs based on query parameters
    let filteredLogs = mockAuditLogs;

    if (start) {
      const startDate = new Date(start);
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }

    if (end) {
      const endDate = new Date(end);
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    if (severity && severity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }

    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }

    if (action && action !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower) ||
        log.resource.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    logInfo('Audit logs retrieved', { 
      userId: session.user.id,
      logsCount: filteredLogs.length,
      filters: { start, end, severity, status, action, search }
    });

    return NextResponse.json(filteredLogs);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/audit' });
    return NextResponse.json(
      { message: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
