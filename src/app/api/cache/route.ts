import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cacheManager } from '@/lib/cache-strategies';
import logger from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'stats';

    let result;

    switch (type) {
      case 'stats':
        result = await cacheManager.getCacheStats();
        break;
      case 'analytics':
        result = await cacheManager.getCacheAnalytics();
        break;
      case 'strategies':
        result = cacheManager.getAllStrategies();
        break;
      default:
        return NextResponse.json({ message: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    logger.error('Error fetching cache data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { action, cacheName, pattern, urls, strategyName } = await req.json();

    if (!action) {
      return NextResponse.json({ message: 'Action is required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'clear':
        if (!cacheName) {
          return NextResponse.json({ message: 'Cache name is required for clear action' }, { status: 400 });
        }
        result = await cacheManager.clearCache(cacheName);
        break;
      
      case 'clearAll':
        await cacheManager.clearAllCaches();
        result = { success: true };
        break;
      
      case 'invalidate':
        if (!cacheName) {
          return NextResponse.json({ message: 'Cache name is required for invalidate action' }, { status: 400 });
        }
        await cacheManager.invalidateCache(cacheName, pattern);
        result = { success: true };
        break;
      
      case 'warm':
        if (!urls || !Array.isArray(urls)) {
          return NextResponse.json({ message: 'URLs array is required for warm action' }, { status: 400 });
        }
        await cacheManager.warmCache(urls, strategyName);
        result = { success: true };
        break;
      
      case 'optimize':
        await cacheManager.optimizeCache();
        result = { success: true };
        break;
      
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    logger.info('Cache action completed', {
      userId: session.user.id,
      action,
      cacheName,
      pattern,
      urls: urls?.length,
      strategyName
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    logger.error('Error performing cache action:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { version } = await req.json();

    if (!version) {
      return NextResponse.json({ message: 'Version is required' }, { status: 400 });
    }

    await cacheManager.updateCacheVersion(version);

    logger.info('Cache version updated', {
      userId: session.user.id,
      version
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error updating cache version:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
