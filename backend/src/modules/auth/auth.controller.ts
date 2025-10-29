import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() credentials: { email: string; password: string; username: string }) {
    return this.authService.register(credentials);
  }

  @Post('login')
  async login(@Body() credentials: { email: string; password: string }) {
    return this.authService.login(credentials);
  }

  @Post('oauth')
  async oauth(@Body() body: { provider: string; code: string }) {
    return this.authService.oauthLogin(body.provider, body.code);
  }
}

