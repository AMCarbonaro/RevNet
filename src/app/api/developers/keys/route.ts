import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAPIKey, getUserAPIKeys } from '@/lib/api/keys';

/**
 * Get user's API keys
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await getUserAPIKeys(session.user.id);

    return NextResponse.json({ keys });
  } catch (error: any) {
    console.error('❌ Error fetching API keys:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

/**
 * Create new API key
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, permissions, rateLimit, expiresAt, allowedOrigins } = body;

    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: 'Name and permissions are required' },
        { status: 400 }
      );
    }

    const { key, rawKey } = await createAPIKey(session.user.id, {
      name,
      description,
      permissions,
      rateLimit: rateLimit || 1000,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      allowedOrigins
    });

    return NextResponse.json({
      key: {
        id: key.id,
        name: key.name,
        permissions: key.permissions,
        rateLimit: key.rateLimit,
        createdAt: key.createdAt,
        isActive: key.isActive,
        description: key.description,
        allowedOrigins: key.allowedOrigins
      },
      rawKey // Only returned once
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating API key:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create API key' },
      { status: 500 }
    );
  }
}
