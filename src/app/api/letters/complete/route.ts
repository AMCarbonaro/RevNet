import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateUserProgress } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { letterId, assignment } = await request.json();
    
    if (!letterId || !assignment) {
      return NextResponse.json(
        { error: 'Letter ID and assignment are required' },
        { status: 400 }
      );
    }

    // Update user progress
    const updatedUser = await updateUserProgress(session.user.id, letterId);
    
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Letter completed successfully'
    });
  } catch (error) {
    console.error('Error completing letter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
