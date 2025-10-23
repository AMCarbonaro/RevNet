import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';

export interface AuthRequest {
  action: 'validate' | 'refresh' | 'logout' | 'getUser' | 'updateUser';
  data?: any;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Authentication Service
 * Handles user authentication, session management, and user operations
 */
export class AuthService {
  /**
   * Validate user session
   */
  async validateSession(request: NextRequest): Promise<NextResponse> {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired session'
        }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        data: {
          user: session.user,
          isAuthenticated: true
        }
      });
    } catch (error: any) {
      console.error('Auth service validation error:', error);
      return NextResponse.json({
        success: false,
        error: 'Session validation failed'
      }, { status: 500 });
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<NextResponse> {
    try {
      await connectDB();
      
      const user = await UserModel.findOne({ id: userId });
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      // Remove sensitive data
      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        letterProgress: user.letterProgress,
        stats: user.stats,
        achievements: user.achievements,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return NextResponse.json({
        success: true,
        data: userProfile
      });
    } catch (error: any) {
      console.error('Auth service get user error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve user profile'
      }, { status: 500 });
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: any): Promise<NextResponse> {
    try {
      await connectDB();
      
      const user = await UserModel.findOneAndUpdate(
        { id: userId },
        { 
          ...updateData,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          updatedAt: user.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Auth service update user error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update user profile'
      }, { status: 500 });
    }
  }

  /**
   * Handle logout
   */
  async logout(userId: string): Promise<NextResponse> {
    try {
      // In a real implementation, you would:
      // 1. Invalidate JWT tokens
      // 2. Clear session data
      // 3. Log the logout event
      
      return NextResponse.json({
        success: true,
        data: { message: 'Successfully logged out' }
      });
    } catch (error: any) {
      console.error('Auth service logout error:', error);
      return NextResponse.json({
        success: false,
        error: 'Logout failed'
      }, { status: 500 });
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<NextResponse> {
    try {
      await connectDB();
      
      // Check database connection
      const userCount = await UserModel.countDocuments();
      
      return NextResponse.json({
        success: true,
        data: {
          service: 'auth-service',
          status: 'healthy',
          database: 'connected',
          userCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Auth service health check error:', error);
      return NextResponse.json({
        success: false,
        error: 'Health check failed',
        data: {
          service: 'auth-service',
          status: 'unhealthy',
          timestamp: new Date().toISOString()
        }
      }, { status: 503 });
    }
  }
}

// Service routes
export async function POST(req: NextRequest) {
  const authService = new AuthService();
  const body = await req.json();
  
  switch (body.action) {
    case 'validate':
      return authService.validateSession(req);
    case 'getUser':
      return authService.getUserProfile(body.userId);
    case 'updateUser':
      return authService.updateUserProfile(body.userId, body.updateData);
    case 'logout':
      return authService.logout(body.userId);
    default:
      return NextResponse.json({
        success: false,
        error: 'Invalid action'
      }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const authService = new AuthService();
  const { searchParams } = new URL(req.url);
  
  if (searchParams.get('health') === 'true') {
    return authService.healthCheck();
  }
  
  return NextResponse.json({
    success: false,
    error: 'Invalid endpoint'
  }, { status: 404 });
}
