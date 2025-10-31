import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { EmailService } from './services/email.service';
import { randomBytes } from 'crypto';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  discriminator: string;
  status: string;
  verified: boolean;
  letterProgress: {
    completedLetters: number[];
    currentLetter: number;
    totalLetters: number;
    canAccessDiscord: boolean;
    assignments: any[];
  };
  revoltMemberships: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface AuthResponse {
  success: boolean;
  user: UserResponse;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async register(credentials: { email: string; password: string; username: string }): Promise<AuthResponse> {
    // Check if email already exists
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if username already exists
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: credentials.username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(credentials.password, saltRounds);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    // Generate unique discriminator
    const discriminator = await this.generateDiscriminator(credentials.username);

    // Create user
    const user = this.userRepository.create({
      email: credentials.email,
      username: credentials.username,
      discriminator,
      password: hashedPassword,
      verified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      status: 'offline',
      letterProgress: {
        completedLetters: [],
        currentLetter: 1,
        totalLetters: 30,
        canAccessDiscord: false,
        assignments: [],
      },
      revoltMemberships: [],
      createdAt: new Date(),
      lastActive: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        savedUser.email,
        verificationToken,
        savedUser.username,
      );
      console.log(`Verification email sent to ${savedUser.email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Don't fail registration if email fails, but log it
      // In development mode, the link is logged to console
    }

    return {
      success: true,
      user: this.mapUserToResponse(savedUser),
      // No tokens - user must verify email first
    };
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.verified) {
      return {
        success: true,
        message: 'Email already verified',
      };
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Mark as verified
    user.verified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.status = 'online';

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If the email exists, a verification email has been sent',
      };
    }

    if (user.verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;

    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.username,
      );
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      success: true,
      message: 'Verification email sent',
    };
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.verified) {
      throw new UnauthorizedException('Email not verified. Please verify your email before logging in.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last active
    user.lastActive = new Date();
    user.status = 'online';
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      success: true,
      user: this.mapUserToResponse(user),
      tokens,
    };
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If the email exists, a password reset email has been sent',
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;

    await this.userRepository.save(user);

    // Send reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.username,
      );
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }

    return {
      success: true,
      message: 'Password reset email sent',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async oauthLogin(provider: string, code: string): Promise<AuthResponse> {
    // TODO: Implement OAuth login
    // For now, throw not implemented
    throw new BadRequestException('OAuth login not yet implemented');
  }

  private async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId };

    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION') || '1h';

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtExpiration as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d' as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateDiscriminator(username: string): Promise<string> {
    // Generate unique 4-digit discriminator for the username
    let discriminator: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      discriminator = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

      const existing = await this.userRepository.findOne({
        where: { username, discriminator },
      });

      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new ConflictException('Unable to generate unique discriminator');
    }

    return discriminator!;
  }

  private mapUserToResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      discriminator: user.discriminator || '0000',
      status: user.status,
      verified: user.verified,
      letterProgress: {
        completedLetters: [],
        currentLetter: 1,
        totalLetters: 30,
        canAccessDiscord: false,
        assignments: [],
      },
      revoltMemberships: [],
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    };
  }
}
