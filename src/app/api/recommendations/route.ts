import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { UserModel, ProjectModel } from '@/lib/models';
import { recommendationEngine } from '@/lib/recommendations';
import logger from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user recommendations
    const recommendations = await recommendationEngine.getPersonalizedRecommendations(
      session.user.id,
      type as any
    );

    // Limit results
    const limitedRecommendations = recommendations.slice(0, limit);

    logger.info('Recommendations fetched', {
      userId: session.user.id,
      type,
      count: limitedRecommendations.length
    });

    return NextResponse.json({ recommendations: limitedRecommendations });
  } catch (error) {
    logger.error('Error fetching recommendations:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { action, recommendationId } = await req.json();

    if (!action || !recommendationId) {
      return NextResponse.json({ message: 'Action and recommendationId are required' }, { status: 400 });
    }

    switch (action) {
      case 'mark_seen':
        recommendationEngine.markRecommendationSeen(session.user.id, recommendationId);
        break;
      
      case 'update_preferences':
        const { preferences } = await req.json();
        recommendationEngine.updateUserPreferences(session.user.id, preferences);
        break;
      
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    logger.info('Recommendation action completed', {
      userId: session.user.id,
      action,
      recommendationId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing recommendation action:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
