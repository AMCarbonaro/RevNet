import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { webAuthnManager } from '@/lib/webauthn';
import { securityMonitor } from '@/lib/security-monitoring';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { action } = await req.json();
    const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    switch (action) {
      case 'generate-registration-options':
        return await generateRegistrationOptions(session.user.id, session.user.email!, session.user.name!);
      
      case 'verify-registration':
        return await verifyRegistration(session.user.id, req, ip, userAgent);
      
      case 'generate-authentication-options':
        return await generateAuthenticationOptions(session.user.id);
      
      case 'verify-authentication':
        return await verifyAuthentication(session.user.id, req, ip, userAgent);
      
      case 'remove-credential':
        return await removeCredential(session.user.id, req);
      
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('WebAuthn API error:', error);
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

    const credentials = webAuthnManager.getUserCredentials(session.user.id);

    return NextResponse.json({
      enabled: credentials.length > 0,
      credentials: credentials.map(cred => ({
        id: cred.id,
        name: cred.name,
        deviceType: cred.deviceType,
        createdAt: cred.createdAt,
        lastUsed: cred.lastUsed
      }))
    });
  } catch (error) {
    logger.error('WebAuthn status error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function generateRegistrationOptions(userId: string, userEmail: string, userName: string) {
  try {
    const existingCredentials = webAuthnManager.getUserCredentials(userId);
    const registrationOptions = webAuthnManager.generateRegistrationOptions(
      userId,
      userEmail,
      userName,
      existingCredentials
    );

    // Store challenge temporarily (in real implementation, use Redis or similar)
    await UserModel.findByIdAndUpdate(userId, {
      webauthnChallenge: registrationOptions.challenge,
      webauthnChallengeExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    logger.info('WebAuthn registration options generated', { userId });

    return NextResponse.json({
      success: true,
      options: registrationOptions
    });
  } catch (error) {
    logger.error('Error generating WebAuthn registration options:', error);
    return NextResponse.json({ message: 'Failed to generate registration options' }, { status: 500 });
  }
}

async function verifyRegistration(userId: string, req: NextRequest, ip: string, userAgent: string) {
  try {
    const { credential } = await req.json();
    
    const user = await UserModel.findById(userId);
    if (!user || !user.webauthnChallenge) {
      return NextResponse.json({ message: 'No registration challenge found' }, { status: 400 });
    }

    // Check if challenge is expired
    if (user.webauthnChallengeExpiry && user.webauthnChallengeExpiry < new Date()) {
      return NextResponse.json({ message: 'Registration challenge expired' }, { status: 400 });
    }

    // Verify registration (in real implementation, you would verify the attestation response)
    const webAuthnCredential = await webAuthnManager.registerCredential(
      userId,
      credential,
      userAgent
    );

    // Clear challenge
    await UserModel.findByIdAndUpdate(userId, {
      webauthnChallenge: null,
      webauthnChallengeExpiry: null,
      webauthnCredentials: [...(user.webauthnCredentials || []), {
        id: webAuthnCredential.id,
        publicKey: webAuthnCredential.publicKey,
        counter: webAuthnCredential.counter,
        deviceType: webAuthnCredential.deviceType,
        transports: webAuthnCredential.transports,
        createdAt: webAuthnCredential.createdAt,
        name: webAuthnCredential.name,
        userAgent: webAuthnCredential.userAgent
      }]
    });

    // Log WebAuthn registration
    securityMonitor.logEvent('webauthn_registered', ip, userAgent, userId);

    logger.info('WebAuthn credential registered', { userId, credentialId: webAuthnCredential.id });

    return NextResponse.json({
      success: true,
      credential: {
        id: webAuthnCredential.id,
        name: webAuthnCredential.name,
        deviceType: webAuthnCredential.deviceType,
        createdAt: webAuthnCredential.createdAt
      }
    });
  } catch (error) {
    logger.error('Error verifying WebAuthn registration:', error);
    return NextResponse.json({ message: 'Failed to verify registration' }, { status: 500 });
  }
}

async function generateAuthenticationOptions(userId: string) {
  try {
    const credentials = webAuthnManager.getUserCredentials(userId);
    const authenticationOptions = webAuthnManager.generateAuthenticationOptions(userId, credentials);

    // Store challenge temporarily
    await UserModel.findByIdAndUpdate(userId, {
      webauthnChallenge: authenticationOptions.challenge,
      webauthnChallengeExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    logger.info('WebAuthn authentication options generated', { userId });

    return NextResponse.json({
      success: true,
      options: authenticationOptions
    });
  } catch (error) {
    logger.error('Error generating WebAuthn authentication options:', error);
    return NextResponse.json({ message: 'Failed to generate authentication options' }, { status: 500 });
  }
}

async function verifyAuthentication(userId: string, req: NextRequest, ip: string, userAgent: string) {
  try {
    const { credential } = await req.json();
    
    const user = await UserModel.findById(userId);
    if (!user || !user.webauthnChallenge) {
      return NextResponse.json({ message: 'No authentication challenge found' }, { status: 400 });
    }

    // Check if challenge is expired
    if (user.webauthnChallengeExpiry && user.webauthnChallengeExpiry < new Date()) {
      return NextResponse.json({ message: 'Authentication challenge expired' }, { status: 400 });
    }

    // Verify authentication (in real implementation, you would verify the assertion response)
    const verification = await webAuthnManager.verifyAuthentication(
      userId,
      credential,
      userAgent
    );

    if (!verification.success) {
      return NextResponse.json({ message: 'Authentication verification failed' }, { status: 400 });
    }

    // Clear challenge
    await UserModel.findByIdAndUpdate(userId, {
      webauthnChallenge: null,
      webauthnChallengeExpiry: null,
      webauthnLastUsed: new Date()
    });

    // Log WebAuthn authentication
    securityMonitor.logEvent('webauthn_used', ip, userAgent, userId);

    logger.info('WebAuthn authentication verified', { userId, credentialId: verification.credentialId });

    return NextResponse.json({
      success: true,
      credentialId: verification.credentialId,
      counter: verification.counter
    });
  } catch (error) {
    logger.error('Error verifying WebAuthn authentication:', error);
    return NextResponse.json({ message: 'Failed to verify authentication' }, { status: 500 });
  }
}

async function removeCredential(userId: string, req: NextRequest) {
  try {
    const { credentialId } = await req.json();
    
    const removed = webAuthnManager.removeCredential(userId, credentialId);
    
    if (!removed) {
      return NextResponse.json({ message: 'Credential not found' }, { status: 404 });
    }

    // Update user's stored credentials
    const user = await UserModel.findById(userId);
    if (user && user.webauthnCredentials) {
      const updatedCredentials = user.webauthnCredentials.filter(
        (cred: any) => cred.id !== credentialId
      );
      
      await UserModel.findByIdAndUpdate(userId, {
        webauthnCredentials: updatedCredentials
      });
    }

    logger.info('WebAuthn credential removed', { userId, credentialId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error removing WebAuthn credential:', error);
    return NextResponse.json({ message: 'Failed to remove credential' }, { status: 500 });
  }
}
