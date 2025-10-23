import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLetterById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const letterId = parseInt(params.id);
    const letter = await getLetterById(letterId);
    
    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: letter
    });
  } catch (error) {
    console.error('Error fetching letter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
