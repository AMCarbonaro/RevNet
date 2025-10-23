import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectDB } from '../mongodb';
import { UserModel } from '../models';

export interface APIKeyData {
  id: string;
  name: string;
  key: string; // Only shown once during creation
  hashedKey: string; // Stored in database
  userId: string;
  permissions: string[];
  rateLimit: number; // Requests per hour
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  description?: string;
  allowedOrigins?: string[]; // CORS origins
}

export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  permissions: string[];
  rateLimit?: number;
  expiresAt?: Date;
  allowedOrigins?: string[];
}

export interface APIKeyUsage {
  keyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

/**
 * Create a new API key
 */
export async function createAPIKey(
  userId: string,
  request: CreateAPIKeyRequest
): Promise<{ key: APIKeyData; rawKey: string }> {
  try {
    await connectDB();

    // Generate unique API key
    const rawKey = `rn_${uuidv4().replace(/-/g, '')}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKeyData: APIKeyData = {
      id: uuidv4(),
      name: request.name,
      key: rawKey,
      hashedKey,
      userId,
      permissions: request.permissions,
      rateLimit: request.rateLimit || 1000,
      createdAt: new Date(),
      isActive: true,
      description: request.description,
      allowedOrigins: request.allowedOrigins
    };

    // Store in user's API keys array
    await UserModel.findOneAndUpdate(
      { id: userId },
      { 
        $push: { 
          apiKeys: {
            id: apiKeyData.id,
            name: request.name,
            hashedKey,
            permissions: request.permissions,
            rateLimit: request.rateLimit || 1000,
            createdAt: new Date(),
            isActive: true,
            description: request.description,
            allowedOrigins: request.allowedOrigins
          }
        }
      }
    );

    console.log(`✅ Created API key: ${request.name} for user ${userId}`);
    
    return { key: apiKeyData, rawKey };
  } catch (error) {
    console.error('❌ Error creating API key:', error);
    throw error;
  }
}

/**
 * Validate API key
 */
export async function validateAPIKey(
  key: string,
  requiredPermissions: string[] = [],
  origin?: string
): Promise<{ valid: boolean; user?: any; permissions?: string[]; rateLimit?: number }> {
  try {
    await connectDB();

    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
    
    const user = await UserModel.findOne({
      'apiKeys.hashedKey': hashedKey,
      'apiKeys.isActive': true
    });

    if (!user) {
      return { valid: false };
    }

    const apiKey = user.apiKeys.find((k: any) => k.hashedKey === hashedKey);
    
    // Check expiration
    if (apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
      return { valid: false };
    }

    // Check origin if specified
    if (origin && apiKey.allowedOrigins && apiKey.allowedOrigins.length > 0) {
      const isAllowedOrigin = apiKey.allowedOrigins.some((allowedOrigin: string) => {
        if (allowedOrigin === '*') return true;
        if (allowedOrigin.endsWith('*')) {
          const prefix = allowedOrigin.slice(0, -1);
          return origin.startsWith(prefix);
        }
        return origin === allowedOrigin;
      });

      if (!isAllowedOrigin) {
        return { valid: false };
      }
    }

    // Check permissions
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      apiKey.permissions.includes(permission) || apiKey.permissions.includes('*')
    );

    if (!hasRequiredPermissions) {
      return { valid: false };
    }

    // Update last used timestamp
    await UserModel.findOneAndUpdate(
      { 
        id: user.id,
        'apiKeys.id': apiKey.id
      },
      { 
        $set: { 'apiKeys.$.lastUsed': new Date() }
      }
    );

    return {
      valid: true,
      user: user.toObject(),
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimit
    };
  } catch (error) {
    console.error('❌ Error validating API key:', error);
    return { valid: false };
  }
}

/**
 * Get all API keys for a user
 */
export async function getUserAPIKeys(userId: string): Promise<Omit<APIKeyData, 'key' | 'hashedKey'>[]> {
  try {
    await connectDB();

    const user = await UserModel.findOne({ id: userId });
    if (!user || !user.apiKeys) {
      return [];
    }

    return user.apiKeys.map((key: any) => ({
      id: key.id,
      name: key.name,
      userId: userId,
      permissions: key.permissions,
      rateLimit: key.rateLimit,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      expiresAt: key.expiresAt,
      isActive: key.isActive,
      description: key.description,
      allowedOrigins: key.allowedOrigins
    }));
  } catch (error) {
    console.error('❌ Error getting user API keys:', error);
    throw error;
  }
}

/**
 * Update API key
 */
export async function updateAPIKey(
  userId: string,
  keyId: string,
  updates: Partial<CreateAPIKeyRequest>
): Promise<boolean> {
  try {
    await connectDB();

    const updateData: any = {};
    if (updates.name) updateData['apiKeys.$.name'] = updates.name;
    if (updates.description) updateData['apiKeys.$.description'] = updates.description;
    if (updates.permissions) updateData['apiKeys.$.permissions'] = updates.permissions;
    if (updates.rateLimit) updateData['apiKeys.$.rateLimit'] = updates.rateLimit;
    if (updates.allowedOrigins) updateData['apiKeys.$.allowedOrigins'] = updates.allowedOrigins;
    if (updates.expiresAt) updateData['apiKeys.$.expiresAt'] = updates.expiresAt;

    const result = await UserModel.findOneAndUpdate(
      { 
        id: userId,
        'apiKeys.id': keyId
      },
      { $set: updateData }
    );

    return !!result;
  } catch (error) {
    console.error('❌ Error updating API key:', error);
    throw error;
  }
}

/**
 * Deactivate API key
 */
export async function deactivateAPIKey(userId: string, keyId: string): Promise<boolean> {
  try {
    await connectDB();

    const result = await UserModel.findOneAndUpdate(
      { 
        id: userId,
        'apiKeys.id': keyId
      },
      { 
        $set: { 'apiKeys.$.isActive': false }
      }
    );

    console.log(`🗑️ Deactivated API key: ${keyId} for user ${userId}`);
    return !!result;
  } catch (error) {
    console.error('❌ Error deactivating API key:', error);
    throw error;
  }
}

/**
 * Delete API key permanently
 */
export async function deleteAPIKey(userId: string, keyId: string): Promise<boolean> {
  try {
    await connectDB();

    const result = await UserModel.findOneAndUpdate(
      { id: userId },
      { 
        $pull: { apiKeys: { id: keyId } }
      }
    );

    console.log(`🗑️ Deleted API key: ${keyId} for user ${userId}`);
    return !!result;
  } catch (error) {
    console.error('❌ Error deleting API key:', error);
    throw error;
  }
}

/**
 * Log API usage
 */
export async function logAPIUsage(usage: APIKeyUsage): Promise<void> {
  try {
    // In production, store in separate collection or analytics service
    console.log(`📊 API Usage: ${usage.method} ${usage.endpoint} - ${usage.statusCode} (${usage.responseTime}ms)`);
  } catch (error) {
    console.error('❌ Error logging API usage:', error);
  }
}

/**
 * Check rate limit for API key
 */
export async function checkRateLimit(
  keyId: string,
  currentHour: number = Math.floor(Date.now() / (1000 * 60 * 60))
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    // In production, use Redis or similar for rate limiting
    // For now, return allowed for all requests
    return {
      allowed: true,
      remaining: 1000,
      resetTime: (currentHour + 1) * 3600000
    };
  } catch (error) {
    console.error('❌ Error checking rate limit:', error);
    return {
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 3600000
    };
  }
}

/**
 * Get API key usage statistics
 */
export async function getAPIKeyStats(userId: string, keyId?: string): Promise<{
  totalRequests: number;
  requestsToday: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
}> {
  // In production, aggregate from usage logs
  return {
    totalRequests: 1250,
    requestsToday: 45,
    averageResponseTime: 145,
    errorRate: 0.02,
    topEndpoints: [
      { endpoint: 'GET /user/profile', count: 450 },
      { endpoint: 'GET /projects', count: 320 },
      { endpoint: 'POST /donations', count: 180 }
    ]
  };
}

/**
 * Generate JWT token for API authentication
 */
export function generateAPIToken(payload: { userId: string; keyId: string }): string {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

/**
 * Verify JWT token
 */
export function verifyAPIToken(token: string): { userId: string; keyId: string } | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, secret) as any;
    return { userId: decoded.userId, keyId: decoded.keyId };
  } catch (error) {
    return null;
  }
}

export default {
  createAPIKey,
  validateAPIKey,
  getUserAPIKeys,
  updateAPIKey,
  deactivateAPIKey,
  deleteAPIKey,
  logAPIUsage,
  checkRateLimit,
  getAPIKeyStats,
  generateAPIToken,
  verifyAPIToken
};
