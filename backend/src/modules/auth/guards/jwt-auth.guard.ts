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
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
      
      // Validate that payload.sub exists and is a valid UUID format
      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      // Validate UUID format (basic check)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(payload.sub)) {
        throw new UnauthorizedException('Invalid token: user ID is not a valid UUID');
      }
      
      // Attach user info to request object
      request.user = {
        userId: payload.sub,
        id: payload.sub,
        username: payload.username,
        email: payload.email,
      };
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Token verification failed (expired, invalid signature, etc.)
      console.error('JWT verification error:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
