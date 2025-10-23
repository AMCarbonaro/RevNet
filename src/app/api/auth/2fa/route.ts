import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { twoFactorAuth } from '@/lib/2fa';
import { securityMonitor } from '@/lib/security-monitoring';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { action, token, backupCode } = await req.json();
    const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    switch (action) {
      case 'generate-secret':
        return await generateSecret(session.user.id, session.user.email!, session.user.name!);
      
      case 'verify-setup':
        return await verifySetup(session.user.id, token, ip, userAgent);
      
      case 'verify-token':
        return await verifyToken(session.user.id, token, ip, userAgent);
      
      case 'verify-backup-code':
        return await verifyBackupCode(session.user.id, backupCode, ip, userAgent);
      
      case 'disable':
        return await disable2FA(session.user.id, token, ip, userAgent);
      
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('2FA API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: !!user.twoFactorSecret,
      hasBackupCodes: user.backupCodes && user.backupCodes.length > 0,
      lastUsed: user.twoFactorLastUsed
    });
  } catch (error) {
    logger.error('2FA status error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function generateSecret(userId: string, userEmail: string, userName: string) {
  try {
    const secret = await twoFactorAuth.generateSecret(userId, userEmail);
    
    // Store secret temporarily (in real implementation, you might want to store it encrypted)
    await UserModel.findByIdAndUpdate(userId, {
      twoFactorSecret: secret.secret,
      twoFactorBackupCodes: secret.backupCodes,
      twoFactorSetupDate: new Date()
    });

    // Log security event
    securityMonitor.logEvent('2fa_enabled', 'unknown', 'unknown', userId);

    logger.info('2FA secret generated', { userId });

    return NextResponse.json({
      success: true,
      secret: secret.secret,
      qrCode: secret.qrCode,
      backupCodes: secret.backupCodes
    });
  } catch (error) {
    logger.error('Error generating 2FA secret:', error);
    return NextResponse.json({ message: 'Failed to generate 2FA secret' }, { status: 500 });
  }
}

async function verifySetup(userId: string, token: string, ip: string, userAgent: string) {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ message: '2FA not set up' }, { status: 400 });
    }

    const verification = await twoFactorAuth.verifyToken(user.twoFactorSecret, token, userId, ip, userAgent);
    
    if (!verification.isValid) {
      // Log failed verification
      securityMonitor.logEvent('2fa_failed', ip, userAgent, userId);
      
      return NextResponse.json({ 
        message: 'Invalid verification code',
        attempts: verification.attempts,
        lockedUntil: verification.lockedUntil
      }, { status: 400 });
    }

    // Mark 2FA as enabled
    await UserModel.findByIdAndUpdate(userId, {
      twoFactorEnabled: true,
      twoFactorLastUsed: new Date()
    });

    // Log successful verification
    securityMonitor.logEvent('2fa_verified', ip, userAgent, userId);

    logger.info('2FA setup verified', { userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error verifying 2FA setup:', error);
    return NextResponse.json({ message: 'Failed to verify 2FA setup' }, { status: 500 });
  }
}

async function verifyToken(userId: string, token: string, ip: string, userAgent: string) {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ message: '2FA not enabled' }, { status: 400 });
    }

    const verification = await twoFactorAuth.verifyToken(user.twoFactorSecret, token, userId, ip, userAgent);
    
    if (!verification.isValid) {
      // Log failed verification
      securityMonitor.logEvent('2fa_failed', ip, userAgent, userId);
      
      return NextResponse.json({ 
        message: 'Invalid verification code',
        attempts: verification.attempts,
        lockedUntil: verification.lockedUntil
      }, { status: 400 });
    }

    // Update last used timestamp
    await UserModel.findByIdAndUpdate(userId, {
      twoFactorLastUsed: new Date()
    });

    // Log successful verification
    securityMonitor.logEvent('2fa_verified', ip, userAgent, userId);

    logger.info('2FA token verified', { userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error verifying 2FA token:', error);
    return NextResponse.json({ message: 'Failed to verify 2FA token' }, { status: 500 });
  }
}

async function verifyBackupCode(userId: string, backupCode: string, ip: string, userAgent: string) {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.twoFactorSecret || !user.backupCodes) {
      return NextResponse.json({ message: '2FA not enabled or no backup codes' }, { status: 400 });
    }

    const verification = await twoFactorAuth.verifyBackupCode(backupCode, user.backupCodes, userId, ip, userAgent);
    
    if (!verification.isValid) {
      // Log failed backup code verification
      securityMonitor.logEvent('2fa_failed', ip, userAgent, userId);
      
      return NextResponse.json({ message: 'Invalid backup code' }, { status: 400 });
    }

    // Remove used backup code
    const updatedBackupCodes = user.backupCodes.filter((code: string) => code !== backupCode);
    await UserModel.findByIdAndUpdate(userId, {
      backupCodes: updatedBackupCodes,
      twoFactorLastUsed: new Date()
    });

    // Log successful backup code verification
    securityMonitor.logEvent('2fa_verified', ip, userAgent, userId, { backupCodeUsed: true });

    logger.info('2FA backup code verified', { userId, remainingCodes: updatedBackupCodes.length });

    return NextResponse.json({ 
      success: true,
      remainingBackupCodes: updatedBackupCodes.length
    });
  } catch (error) {
    logger.error('Error verifying 2FA backup code:', error);
    return NextResponse.json({ message: 'Failed to verify backup code' }, { status: 500 });
  }
}

async function disable2FA(userId: string, token: string, ip: string, userAgent: string) {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ message: '2FA not enabled' }, { status: 400 });
    }

    // Verify token before disabling
    const verification = await twoFactorAuth.verifyToken(user.twoFactorSecret, token, userId, ip, userAgent);
    
    if (!verification.isValid) {
      return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 });
    }

    // Disable 2FA
    await UserModel.findByIdAndUpdate(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
      twoFactorDisabledDate: new Date()
    });

    // Log 2FA disabled event
    securityMonitor.logEvent('2fa_disabled', ip, userAgent, userId);

    logger.info('2FA disabled', { userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error disabling 2FA:', error);
    return NextResponse.json({ message: 'Failed to disable 2FA' }, { status: 500 });
  }
}
