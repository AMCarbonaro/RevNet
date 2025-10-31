import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // For development, allow requests without token (fallback behavior)
      // In production, you'd want to throw UnauthorizedException
      const devMode = this.configService.get<string>('NODE_ENV') !== 'production';
      if (devMode) {
        // Set a default user for development
        request.user = { userId: 'user1', id: 'user1' };
        return true;
      }
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
      
      // Attach user info to request object
      request.user = {
        userId: payload.sub,
        id: payload.sub,
        username: payload.username,
        email: payload.email,
      };
      
      return true;
    } catch (error) {
      // Token is invalid - in development, allow with fallback user
      const devMode = this.configService.get<string>('NODE_ENV') !== 'production';
      if (devMode) {
        console.warn('Invalid JWT token, using fallback user for development:', error.message);
        request.user = { userId: 'user1', id: 'user1' };
        return true;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
