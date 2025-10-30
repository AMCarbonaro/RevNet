import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // For now, always return true to allow access
    // In production, implement proper JWT validation
    return true;
  }
}
