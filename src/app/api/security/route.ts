import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { securityMonitor } from '@/lib/security-monitoring';
import logger from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'metrics';

    let result;

    switch (type) {
      case 'metrics':
        result = securityMonitor.getSecurityMetrics();
        break;
      case 'alerts':
        result = securityMonitor.getActiveAlerts();
        break;
      case 'user-risk':
        result = { riskScore: securityMonitor.getUserRiskScore(session.user.id) };
        break;
      default:
        return NextResponse.json({ message: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    logger.error('Security monitoring API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { action, alertId, ip } = await req.json();

    if (!action) {
      return NextResponse.json({ message: 'Action is required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'acknowledge-alert':
        if (!alertId) {
          return NextResponse.json({ message: 'Alert ID is required' }, { status: 400 });
        }
        result = securityMonitor.acknowledgeAlert(alertId, session.user.id);
        break;
      
      case 'resolve-alert':
        if (!alertId) {
          return NextResponse.json({ message: 'Alert ID is required' }, { status: 400 });
        }
        result = securityMonitor.resolveAlert(alertId, session.user.id);
        break;
      
      case 'whitelist-ip':
        if (!ip) {
          return NextResponse.json({ message: 'IP address is required' }, { status: 400 });
        }
        securityMonitor.whitelistIP(ip);
        result = { success: true };
        break;
      
      case 'blacklist-ip':
        if (!ip) {
          return NextResponse.json({ message: 'IP address is required' }, { status: 400 });
        }
        securityMonitor.blacklistIP(ip);
        result = { success: true };
        break;
      
      case 'remove-whitelist':
        if (!ip) {
          return NextResponse.json({ message: 'IP address is required' }, { status: 400 });
        }
        result = securityMonitor.removeFromWhitelist(ip);
        break;
      
      case 'remove-blacklist':
        if (!ip) {
          return NextResponse.json({ message: 'IP address is required' }, { status: 400 });
        }
        result = securityMonitor.removeFromBlacklist(ip);
        break;
      
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    logger.info('Security action completed', {
      userId: session.user.id,
      action,
      alertId,
      ip
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    logger.error('Security action error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
