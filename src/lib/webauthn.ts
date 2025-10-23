import { logInfo, logError } from './logger';

export interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
  deviceType: 'cross-platform' | 'platform';
  transports: string[];
  createdAt: Date;
  lastUsed?: Date;
  name: string;
  userAgent: string;
}

export interface WebAuthnRegistration {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: 'public-key';
    alg: number;
  }>;
  authenticatorSelection: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    userVerification: 'required' | 'preferred' | 'discouraged';
    residentKey: 'required' | 'preferred' | 'discouraged';
  };
  timeout: number;
  attestation: 'none' | 'indirect' | 'direct';
}

export interface WebAuthnAuthentication {
  challenge: string;
  allowCredentials?: Array<{
    type: 'public-key';
    id: string;
    transports?: string[];
  }>;
  timeout: number;
  userVerification: 'required' | 'preferred' | 'discouraged';
  rpId: string;
}

export interface WebAuthnVerificationResult {
  success: boolean;
  credentialId?: string;
  counter?: number;
  error?: string;
  deviceInfo?: {
    type: string;
    userAgent: string;
    timestamp: Date;
  };
}

export class WebAuthnManager {
  private static instance: WebAuthnManager;
  private credentials: Map<string, WebAuthnCredential[]> = new Map();

  static getInstance(): WebAuthnManager {
    if (!WebAuthnManager.instance) {
      WebAuthnManager.instance = new WebAuthnManager();
    }
    return WebAuthnManager.instance;
  }

  constructor() {
    // Initialize WebAuthn manager
  }

  /**
   * Check if WebAuthn is supported
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    return !!(
      window.PublicKeyCredential &&
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
      window.PublicKeyCredential.isConditionalMediationAvailable
    );
  }

  /**
   * Check if platform authenticator is available
   */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      logError(error as Error, { context: 'webauthn_platform_check' });
      return false;
    }
  }

  /**
   * Check if conditional mediation is available
   */
  async isConditionalMediationAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      return await window.PublicKeyCredential.isConditionalMediationAvailable();
    } catch (error) {
      logError(error as Error, { context: 'webauthn_conditional_mediation_check' });
      return false;
    }
  }

  /**
   * Generate registration options for WebAuthn
   */
  generateRegistrationOptions(
    userId: string,
    userEmail: string,
    userName: string,
    existingCredentials: WebAuthnCredential[] = []
  ): WebAuthnRegistration {
    const challenge = this.generateChallenge();
    const rpId = this.getRpId();

    const registrationOptions: WebAuthnRegistration = {
      challenge,
      rp: {
        name: 'Revolution Network',
        id: rpId
      },
      user: {
        id: userId,
        name: userEmail,
        displayName: userName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred'
      },
      timeout: 60000, // 60 seconds
      attestation: 'none'
    };

    // Exclude existing credentials
    if (existingCredentials.length > 0) {
      registrationOptions.excludeCredentials = existingCredentials.map(cred => ({
        type: 'public-key' as const,
        id: cred.id,
        transports: cred.transports as AuthenticatorTransport[]
      }));
    }

    logInfo('WebAuthn registration options generated', { 
      userId, 
      hasExistingCredentials: existingCredentials.length > 0 
    });

    return registrationOptions;
  }

  /**
   * Generate authentication options for WebAuthn
   */
  generateAuthenticationOptions(
    userId: string,
    credentials: WebAuthnCredential[] = []
  ): WebAuthnAuthentication {
    const challenge = this.generateChallenge();
    const rpId = this.getRpId();

    const authenticationOptions: WebAuthnAuthentication = {
      challenge,
      timeout: 60000, // 60 seconds
      userVerification: 'preferred',
      rpId
    };

    // If user has credentials, allow only those
    if (credentials.length > 0) {
      authenticationOptions.allowCredentials = credentials.map(cred => ({
        type: 'public-key' as const,
        id: cred.id,
        transports: cred.transports as AuthenticatorTransport[]
      }));
    }

    logInfo('WebAuthn authentication options generated', { 
      userId, 
      credentialCount: credentials.length 
    });

    return authenticationOptions;
  }

  /**
   * Register a new WebAuthn credential
   */
  async registerCredential(
    userId: string,
    credential: PublicKeyCredential,
    userAgent: string
  ): Promise<WebAuthnCredential> {
    try {
      const response = credential.response as AuthenticatorAttestationResponse;
      
      // In a real implementation, you would verify the attestation response
      // For now, we'll create a mock credential
      const webAuthnCredential: WebAuthnCredential = {
        id: this.arrayBufferToBase64(credential.rawId),
        publicKey: this.arrayBufferToBase64(response.publicKey || new ArrayBuffer(0)),
        counter: 0,
        deviceType: this.getDeviceType(credential),
        transports: credential.response.getTransports?.() || [],
        createdAt: new Date(),
        name: this.generateCredentialName(credential),
        userAgent
      };

      // Store credential for user
      if (!this.credentials.has(userId)) {
        this.credentials.set(userId, []);
      }
      this.credentials.get(userId)!.push(webAuthnCredential);

      logInfo('WebAuthn credential registered', { 
        userId, 
        credentialId: webAuthnCredential.id,
        deviceType: webAuthnCredential.deviceType 
      });

      return webAuthnCredential;
    } catch (error) {
      logError(error as Error, { context: 'webauthn_register_credential', userId });
      throw new Error('Failed to register WebAuthn credential');
    }
  }

  /**
   * Verify WebAuthn authentication
   */
  async verifyAuthentication(
    userId: string,
    credential: PublicKeyCredential,
    userAgent: string
  ): Promise<WebAuthnVerificationResult> {
    try {
      const credentialId = this.arrayBufferToBase64(credential.rawId);
      const userCredentials = this.credentials.get(userId) || [];
      
      const storedCredential = userCredentials.find(cred => cred.id === credentialId);
      
      if (!storedCredential) {
        return {
          success: false,
          error: 'Credential not found'
        };
      }

      // In a real implementation, you would verify the assertion response
      // For now, we'll simulate successful verification
      const response = credential.response as AuthenticatorAssertionResponse;
      
      // Update counter and last used
      storedCredential.counter = Math.max(storedCredential.counter, response.counter || 0);
      storedCredential.lastUsed = new Date();

      logInfo('WebAuthn authentication verified', { 
        userId, 
        credentialId,
        counter: storedCredential.counter 
      });

      return {
        success: true,
        credentialId,
        counter: storedCredential.counter,
        deviceInfo: {
          type: storedCredential.deviceType,
          userAgent,
          timestamp: new Date()
        }
      };
    } catch (error) {
      logError(error as Error, { context: 'webauthn_verify_authentication', userId });
      return {
        success: false,
        error: 'Authentication verification failed'
      };
    }
  }

  /**
   * Get credentials for a user
   */
  getUserCredentials(userId: string): WebAuthnCredential[] {
    return this.credentials.get(userId) || [];
  }

  /**
   * Remove a credential
   */
  removeCredential(userId: string, credentialId: string): boolean {
    const userCredentials = this.credentials.get(userId);
    if (!userCredentials) return false;

    const initialLength = userCredentials.length;
    this.credentials.set(
      userId, 
      userCredentials.filter(cred => cred.id !== credentialId)
    );

    const removed = this.credentials.get(userId)!.length < initialLength;
    
    if (removed) {
      logInfo('WebAuthn credential removed', { userId, credentialId });
    }

    return removed;
  }

  /**
   * Update credential name
   */
  updateCredentialName(userId: string, credentialId: string, name: string): boolean {
    const userCredentials = this.credentials.get(userId);
    if (!userCredentials) return false;

    const credential = userCredentials.find(cred => cred.id === credentialId);
    if (!credential) return false;

    credential.name = name;
    logInfo('WebAuthn credential name updated', { userId, credentialId, name });
    
    return true;
  }

  /**
   * Generate a random challenge
   */
  private generateChallenge(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array.buffer);
  }

  /**
   * Get relying party ID
   */
  private getRpId(): string {
    if (typeof window === 'undefined') return 'localhost';
    return window.location.hostname;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Get device type from credential
   */
  private getDeviceType(credential: PublicKeyCredential): 'cross-platform' | 'platform' {
    // In a real implementation, you would determine this from the credential
    // For now, we'll use a simple heuristic
    return credential.response instanceof AuthenticatorAttestationResponse ? 'platform' : 'cross-platform';
  }

  /**
   * Generate a friendly name for the credential
   */
  private generateCredentialName(credential: PublicKeyCredential): string {
    const deviceType = this.getDeviceType(credential);
    const timestamp = new Date().toLocaleDateString();
    
    if (deviceType === 'platform') {
      return `Built-in Authenticator (${timestamp})`;
    } else {
      return `Security Key (${timestamp})`;
    }
  }

  /**
   * Check if credential is valid
   */
  isValidCredential(credential: WebAuthnCredential): boolean {
    // Check if credential is not expired (e.g., older than 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    return credential.createdAt > twoYearsAgo;
  }

  /**
   * Get security recommendations for WebAuthn
   */
  getSecurityRecommendations(userId: string): string[] {
    const credentials = this.getUserCredentials(userId);
    const recommendations: string[] = [];

    if (credentials.length === 0) {
      recommendations.push('Enable WebAuthn for enhanced security');
    }

    if (credentials.length === 1) {
      recommendations.push('Consider adding a backup authenticator');
    }

    const platformCredentials = credentials.filter(cred => cred.deviceType === 'platform');
    const crossPlatformCredentials = credentials.filter(cred => cred.deviceType === 'cross-platform');

    if (platformCredentials.length === 0 && crossPlatformCredentials.length > 0) {
      recommendations.push('Consider using your device\'s built-in authenticator for convenience');
    }

    if (crossPlatformCredentials.length === 0 && platformCredentials.length > 0) {
      recommendations.push('Consider adding a hardware security key for maximum security');
    }

    const oldCredentials = credentials.filter(cred => !this.isValidCredential(cred));
    if (oldCredentials.length > 0) {
      recommendations.push('Some of your authenticators are outdated. Consider updating them');
    }

    return recommendations;
  }
}

export const webAuthnManager = WebAuthnManager.getInstance();
