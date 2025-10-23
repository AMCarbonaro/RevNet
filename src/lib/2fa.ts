import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { logInfo, logError } from './logger';

export interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  createdAt: Date;
}

export interface TwoFactorVerification {
  isValid: boolean;
  backupCodeUsed?: boolean;
  attempts?: number;
  lockedUntil?: Date;
}

export interface SecurityEvent {
  type: '2fa_enabled' | '2fa_disabled' | '2fa_verified' | '2fa_failed' | 'backup_code_used' | 'device_trusted' | 'suspicious_activity';
  userId: string;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class TwoFactorAuth {
  private static instance: TwoFactorAuth;
  private sequestrationAttempts: Map<string, { count: number; lockedUntil?: Date }> = new Map();
  private trustedDevices: Map<string, Set<string>> = new Map();

  static getInstance(): TwoFactorAuth {
    if (!TwoFactorAuth.instance) {
      TwoFactorAuth.instance = new TwoFactorAuth();
    }
    return TwoFactorAuth.instance;
  }

  constructor() {
    // Configure OTP settings
    authenticator.options = {
      window: 2, // Allow 2 time steps before and after current time
      step: 30, // 30-second time steps
      algorithm: 'sha1'
    };
  }

  /**
   * Generate a new 2FA secret for a user
   */
  async generateSecret(userId: string, userEmail: string): Promise<TwoFactorSecret> {
    try {
      const secret = authenticator.generateSecret();
      const serviceName = 'Revolution Network';
      const otpauthUrl = authenticator.keyuri(userEmail, serviceName, secret);
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(otpauthUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#39FF14', // Terminal green
          light: '#0A0A0A' // Matrix dark
        }
      });

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      const twoFactorSecret: TwoFactorSecret = {
        secret,
        qrCode,
        backupCodes,
        createdAt: new Date()
      };

      logInfo('2FA secret generated', { userId, hasBackupCodes: backupCodes.length });

      return twoFactorSecret;
    } catch (error) {
      logError(error as Error, { context: '2fa_generate_secret', userId });
      throw new Error('Failed to generate 2FA secret');
    }
  }

  /**
   * Verify a 2FA token
   */
  async verifyToken(
    secret: string, 
    token: string, 
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<TwoFactorVerification> {
    try {
      // Check if user is locked out
      const lockoutInfo = this.sequestrationAttempts.get(userId);
      if (lockoutInfo?.lockedUntil && lockoutInfo.lockedUntil > new Date()) {
        logError(new Error('User is locked out from 2FA attempts'), { 
          context: '2fa_verify_token', 
          userId,
          lockedUntil: lockoutInfo.lockedUntil 
        });
        return {
          isValid: false,
          attempts: lockoutInfo.count,
          lockedUntil: lockoutInfo.lockedUntil
        };
      }

      const isValid = authenticator.verify({ token, secret });

      if (isValid) {
        // Reset failed attempts on successful verification
        this.sequestrationAttempts.delete(userId);
        logInfo('2FA token verified successfully', { userId });
        
        return {
          isValid: true,
          attempts: 0
        };
      } else {
        // Increment failed attempts
        const currentAttempts = lockoutInfo?.count || 0;
        const newAttempts = currentAttempts + 1;
        
        let lockedUntil: Date | undefined;
        if (newAttempts >= 5) {
          lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        }
        
        this.sequestrationAttempts.set(userId, {
          count: newAttempts,
          lockedUntil
        });

        logError(new Error('Invalid 2FA token'), { 
          context: '2fa_verify_token', 
          userId,
          attempts: newAttempts,
          lockedUntil 
        });

        return {
          isValid: false,
          attempts: newAttempts,
          lockedUntil
        };
      }
    } catch (error) {
      logError(error as Error, { context: '2fa_verify_token', userId });
      throw new Error('Failed to verify 2FA token');
    }
  }

  /**
   * Verify a backup code
   */
  async verifyBackupCode(
    backupCode: string,
    userBackupCodes: string[],
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<TwoFactorVerification> {
    try {
      const isValidCode = userBackupCodes.includes(backupCode);
      
      if (isValidCode) {
        // Remove used backup code
        const updatedBackupCodes = userBackupCodes.filter(code => code !== backupCode);
        
        logInfo('Backup code verified successfully', { 
          userId,
          remainingCodes: updatedBackupCodes.length 
        });
        
        return {
          isValid: true,
          backupCodeUsed: true
        };
      } else {
        logError(new Error('Invalid backup code'), { 
          context: '2fa_verify_backup_code', 
          userId 
        });
        
        return {
          isValid: false
        };
      }
    } catch (error) {
      logError(error as Error, { context: '2fa_verify_backup_code', userId });
      throw new Error('Failed to verify backup code');
    }
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes(): string[] {
    return this.generateBackupCodes();
  }

  /**
   * Check if device is trusted
   */
  isDeviceTrusted(userId: string, deviceId: string): boolean {
    const trustedDevices = this.trustedDevices.get(userId);
    return trustedDevices ? trustedDevices.has(deviceId) : false;
  }

  /**
   * Trust a device
   */
  trustDevice(userId: string, deviceId: string): void {
    if (!this.trustedDevices.has(userId)) {
      this.trustedDevices.set(userId, new Set());
    }
    
    this.trustedDevices.get(userId)!.add(deviceId);
    
    logInfo('Device trusted', { userId, deviceId });
  }

  /**
   * Untrust a device
   */
  untrustDevice(userId: string, deviceId: string): void {
    const trustedDevices = this.trustedDevices.get(userId);
    if (trustedDevices) {
      trustedDevices.delete(deviceId);
      logInfo('Device untrusted', { userId, deviceId });
    }
  }

  /**
   * Get trusted devices for a user
   */
  getTrustedDevices(userId: string): string[] {
    const trustedDevices = this.trustedDevices.get(userId);
    return trustedDevices ? Array.from(trustedDevices) : [];
  }

  /**
   * Generate a device ID from request information
   */
  generateDeviceId(ip: string, userAgent: string): string {
    const data = `${ip}-${userAgent}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Check for suspicious activity
   */
  checkSuspiciousActivity(
    userId: string,
    ip: string,
    userAgent: string,
    location?: { country: string; city: string }
  ): { isSuspicious: boolean; reason?: string } {
    // Check for unusual location
    if (location) {
      // In a real implementation, you would check against user's usual locations
      // For now, we'll implement basic checks
    }

    // Check for unusual user agent
    const suspiciousUserAgents = ['bot', 'crawler', 'spider', 'scraper'];
    const userAgentLower = userAgent.toLowerCase();
    const isSuspiciousUA = suspiciousUserAgents.some(ua => userAgentLower.includes(ua));

    if (isSuspiciousUA) {
      return {
        isSuspicious: true,
        reason: 'Suspicious user agent detected'
      };
    }

    // Check for rapid login attempts
    const lockoutInfo = this.sequestrationAttempts.get(userId);
    if (lockoutInfo && lockoutInfo.count > 3) {
      return {
        isSuspicious: true,
        reason: 'Multiple failed login attempts'
      };
    }

    return { isSuspicious: false };
  }

  /**
   * Get time remaining until lockout expires
   */
  getLockoutTimeRemaining(userId: string): number {
    const lockoutInfo = this.sequestrationAttempts.get(userId);
    if (!lockoutInfo?.lockedUntil) return 0;
    
    const now = new Date();
    const remaining = lockoutInfo.lockedUntil.getTime() - now.getTime();
    return Math.max(0, remaining);
  }

  /**
   * Clear lockout for a user (admin function)
   */
  clearLockout(userId: string): void {
    this.sequestrationAttempts.delete(userId);
    logInfo('2FA lockout cleared', { userId });
  }

  /**
   * Get failed attempt count for a user
   */
  getFailedAttempts(userId: string): number {
    const lockoutInfo = this.sequestrationAttempts.get(userId);
    return lockoutInfo?.count || 0;
  }

  /**
   * Validate 2FA setup
   */
  validateSetup(secret: string, token: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      logError(error as Error, { context: '2fa_validate_setup' });
      return false;
    }
  }

  /**
   * Get current time-based token (for testing)
   */
  getCurrentToken(secret: string): string {
    try {
      return authenticator.generate(secret);
    } catch (error) {
      logError(error as Error, { context: '2fa_get_current_token' });
      throw new Error('Failed to generate current token');
    }
  }

  /**
   * Check if 2FA is properly configured
   */
  isConfigured(userSecret: string | null): boolean {
    return userSecret !== null && userSecret.length > 0;
  }

  /**
   * Get security recommendations for a user
   */
  getSecurityRecommendations(userId: string): string[] {
    const recommendations: string[] = [];
    const trustedDevices = this.getTrustedDevices(userId);
    const failedAttempts = this.getFailedAttempts(userId);

    if (trustedDevices.length === 0) {
      recommendations.push('Consider trusting your current device for easier access');
    }

    if (failedAttempts > 0) {
      recommendations.push('You have recent failed login attempts. Ensure you\'re using the correct 2FA code');
    }

    if (trustedDevices.length > 5) {
      recommendations.push('You have many trusted devices. Consider reviewing and removing unused devices');
    }

    recommendations.push('Keep your backup codes in a safe place');
    recommendations.push('Use a reputable authenticator app like Google Authenticator or Authy');

    return recommendations;
  }
}

export const twoFactorAuth = TwoFactorAuth.getInstance();
