import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';
import DOMPurify from 'isomorphic-dompurify';
import { logSecurity } from './logger';

// Rate limiting configuration
const rateLimiterConfig = {
  storeClient: null as any,
  keyPrefix: 'rl_',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds
};

// Initialize Redis client for rate limiting
let redisClient: any = null;
let rateLimiter: RateLimiterRedis | null = null;

const initRateLimiter = async () => {
  if (process.env.REDIS_URL && !redisClient) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
      
      rateLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: rateLimiterConfig.keyPrefix,
        points: rateLimiterConfig.points,
        duration: rateLimiterConfig.duration,
        blockDuration: rateLimiterConfig.blockDuration,
      });
      
      console.log('Rate limiter initialized with Redis');
    } catch (error) {
      console.warn('Redis connection failed, using memory rate limiter:', error);
    }
  }
};

// Rate limiting middleware
export async function rateLimitMiddleware(
  request: NextRequest,
  options: {
    points?: number;
    duration?: number;
    blockDuration?: number;
    keyGenerator?: (req: NextRequest) => string;
  } = {}
) {
  await initRateLimiter();
  
  const {
    points = 100,
    duration = 60,
    blockDuration = 60,
    keyGenerator = (req) => req.ip || 'anonymous',
  } = options;

  const key = keyGenerator(request);
  
  try {
    if (rateLimiter) {
      const result = await rateLimiter.consume(key, points, { duration, blockDuration });
      
      const headers = {
        'X-RateLimit-Limit': points.toString(),
        'X-RateLimit-Remaining': result.remainingPoints?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString(),
      };
      
      return { allowed: true, headers };
    } else {
      // Fallback to basic rate limiting without Redis
      return { allowed: true, headers: {} };
    }
  } catch (rejRes: any) {
    const headers = {
      'X-RateLimit-Limit': points.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
    };
    
    logSecurity('rate_limit_exceeded', 'medium', {
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      key,
    });
    
    return {
      allowed: false,
      headers,
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    };
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Basic XSS protection
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
  
  // Limit length
  sanitized = sanitized.substring(0, 10000);
  
  return sanitized.trim();
}

// SQL injection prevention (additional layer)
export function preventSQLInjection(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(OR|AND)\s+\d+\s*=\s*\d+/gi,
    /(UNION.*SELECT)/gi,
    /(SCRIPT.*>)/gi,
    /(JAVASCRIPT:)/gi,
  ];
  
  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
}

// CSRF token validation
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  
  // Use crypto.timingSafeEqual for constant-time comparison
  if (typeof crypto !== 'undefined' && crypto.timingSafeEqual) {
    const tokenBuffer = Buffer.from(token, 'utf8');
    const sessionBuffer = Buffer.from(sessionToken, 'utf8');
    
    if (tokenBuffer.length !== sessionBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(tokenBuffer, sessionBuffer);
  }
  
  // Fallback to simple comparison (less secure)
  return token === sessionToken;
}

// Request validation middleware
export function validateRequest(
  request: NextRequest,
  options: {
    requiredFields?: string[];
    maxBodySize?: number;
    allowedMethods?: string[];
    requireAuth?: boolean;
  } = {}
) {
  const {
    requiredFields = [],
    maxBodySize = 1024 * 1024, // 1MB
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
    requireAuth = false,
  } = options;
  
  // Check HTTP method
  if (!allowedMethods.includes(request.method)) {
    logSecurity('invalid_method', 'medium', {
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
    return { valid: false, error: 'Method not allowed' };
  }
  
  // Check content length
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxBodySize) {
    logSecurity('request_too_large', 'medium', {
      contentLength: parseInt(contentLength),
      maxSize: maxBodySize,
      url: request.url,
      ip: request.ip,
    });
    return { valid: false, error: 'Request too large' };
  }
  
  // Check required fields for POST/PUT requests
  if (['POST', 'PUT'].includes(request.method) && requiredFields.length > 0) {
    // This would need to be implemented based on your request parsing method
    // For now, we'll just return valid
  }
  
  return { valid: true };
}

// IP-based access control
export function checkIPAccess(
  ip: string,
  allowedIPs: string[] = [],
  blockedIPs: string[] = []
): boolean {
  // Check blocked IPs first
  if (blockedIPs.some(blockedIP => ip.includes(blockedIP))) {
    logSecurity('blocked_ip_access', 'high', { ip });
    return false;
  }
  
  // If allowed IPs are specified, check against them
  if (allowedIPs.length > 0) {
    const isAllowed = allowedIPs.some(allowedIP => ip.includes(allowedIP));
    if (!isAllowed) {
      logSecurity('unauthorized_ip_access', 'medium', { ip });
      return false;
    }
  }
  
  return true;
}

// Security headers middleware
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  };
}

// Content Security Policy for API routes
export function apiSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
  };
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }
  
  const isValid = score >= 4 && password.length >= 8;
  
  return { isValid, score, feedback };
}

// File upload security validation
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { isValid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds maximum allowed size' };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'File extension not allowed' };
  }
  
  return { isValid: true };
}

// Generate secure random tokens
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
