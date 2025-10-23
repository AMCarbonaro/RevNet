# Environment Configuration Documentation

## Overview

Revolution Network requires specific environment variables and configuration for proper operation. This document outlines all required environment variables, their purposes, and setup instructions for development and production environments.

## 🔧 Required Environment Variables

### NextAuth.js Configuration

```env
# NextAuth.js Core Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

### Database Configuration

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/revolution-network
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revolution-network

# Database Connection Options
MONGODB_DB_NAME=revolution-network
MONGODB_COLLECTION_PREFIX=rev_
```

### Stripe Payment Processing

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Environment
STRIPE_ENVIRONMENT=test  # or 'live' for production
```

### Socket.IO Real-time Communication

```env
# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_IO_PORT=3001
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

### FEC Compliance Monitoring

```env
# FEC API Configuration
FEC_API_KEY=your_fec_api_key
FEC_API_BASE_URL=https://api.open.fec.gov/v1
FEC_WEBHOOK_URL=https://your-domain.com/api/fec/webhook

# FEC Compliance Thresholds
FEC_WARNING_THRESHOLD=4500  # $4,500 in cents
FEC_ALERT_THRESHOLD=5000    # $5,000 in cents
```

### Email Notifications

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@revolution.network

# Email Templates
EMAIL_TEMPLATE_DIR=./src/templates/email
```

### File Storage

```env
# File Upload Configuration
UPLOAD_MAX_SIZE=10485760  # 10MB in bytes
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp
UPLOAD_DIR=./public/uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Analytics and Monitoring

```env
# Analytics Configuration
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your_mixpanel_token
SENTRY_DSN=your_sentry_dsn

# Performance Monitoring
NEW_RELIC_LICENSE_KEY=your_new_relic_license_key
```

### Security Configuration

```env
# Security Settings
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Development Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/revolution-network.git
cd revolution-network

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Database Setup

#### Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb  # Ubuntu

# Start MongoDB service
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongodb  # Ubuntu

# Create database
mongosh
> use revolution-network
> db.createUser({
    user: "revolution_user",
    pwd: "revolution_password",
    roles: ["readWrite"]
  })
```

#### MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get connection string

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revolution-network?retryWrites=true&w=majority
```

### 3. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github`
   - `https://your-domain.com/api/auth/callback/github`

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect URI:
   - `http://localhost:3000/api/auth/callback/discord`
   - `https://your-domain.com/api/auth/callback/discord`

```env
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

### 4. Stripe Setup

#### Test Environment
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get test API keys from "Developers" → "API keys"
3. Set up webhook endpoint for local development

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Webhook Setup for Development
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook secret from CLI output
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Socket.IO Setup

```bash
# Install Socket.IO dependencies
npm install socket.io socket.io-client

# Start Socket.IO server
npm run dev:socket
```

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_IO_PORT=3001
```

### 6. FEC API Setup

1. Go to [FEC API](https://api.open.fec.gov/developers/)
2. Request API key
3. Configure webhook endpoint

```env
FEC_API_KEY=your_fec_api_key
FEC_API_BASE_URL=https://api.open.fec.gov/v1
```

## 🏭 Production Environment Setup

### 1. Environment Variables

```env
# Production Environment
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key

# Production Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revolution-network

# Production Stripe
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_ENVIRONMENT=live

# Production Socket.IO
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com:3001
SOCKET_IO_PORT=3001
SOCKET_IO_CORS_ORIGIN=https://your-domain.com

# Production FEC
FEC_WEBHOOK_URL=https://your-domain.com/api/fec/webhook

# Production Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
SMTP_FROM=noreply@your-domain.com

# Production Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=1000
```

### 2. Vercel Deployment

#### Vercel Configuration
```json
// vercel.json
{
  "env": {
    "NEXTAUTH_URL": "https://your-domain.vercel.app",
    "MONGODB_URI": "@mongodb_uri",
    "STRIPE_SECRET_KEY": "@stripe_secret_key",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe_publishable_key"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### Environment Variables in Vercel
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all required environment variables
3. Set different values for Preview and Production environments

### 3. MongoDB Atlas Production

#### Security Configuration
```javascript
// MongoDB Atlas Network Access
// Whitelist IP addresses or use 0.0.0.0/0 for Vercel
// Enable SSL/TLS
// Configure database user with minimal privileges

// Database user permissions
{
  "role": "readWrite",
  "db": "revolution-network"
}
```

#### Connection String
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revolution-network?retryWrites=true&w=majority&ssl=true
```

### 4. Stripe Production Setup

#### Live API Keys
1. Switch to live mode in Stripe Dashboard
2. Get live API keys
3. Set up production webhook endpoints

```env
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_ENVIRONMENT=live
```

#### Webhook Configuration
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.requires_action`

### 5. SSL and Security

#### SSL Certificate
```bash
# Let's Encrypt SSL certificate
certbot --nginx -d your-domain.com

# Or use Vercel's built-in SSL
# Vercel automatically provides SSL certificates
```

#### Security Headers
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## 🔐 Security Configuration

### 1. Secret Generation

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64

# Generate encryption key
openssl rand -base64 32
```

### 2. Environment Variable Security

```bash
# Use environment variable encryption
# For sensitive data, use encrypted environment variables
# Consider using services like AWS Secrets Manager or Azure Key Vault
```

### 3. Database Security

```javascript
// MongoDB security configuration
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: true,
  authSource: 'admin',
  retryWrites: true,
  w: 'majority'
};
```

### 4. API Security

```typescript
// Rate limiting configuration
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
};
```

## 📊 Monitoring and Analytics

### 1. Error Tracking

```env
# Sentry configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=revolution-network
```

### 2. Performance Monitoring

```env
# New Relic configuration
NEW_RELIC_LICENSE_KEY=your_new_relic_license_key
NEW_RELIC_APP_NAME=Revolution Network
```

### 3. Analytics

```env
# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Mixpanel
MIXPANEL_TOKEN=your_mixpanel_token
```

## 🧪 Testing Environment

### 1. Test Database

```env
# Test database configuration
MONGODB_TEST_URI=mongodb://localhost:27017/revolution-network-test
```

### 2. Test Stripe Keys

```env
# Stripe test keys
STRIPE_SECRET_KEY=sk_test_your_test_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_stripe_publishable_key
```

### 3. Test OAuth

```env
# Test OAuth configuration
GOOGLE_CLIENT_ID=your_test_google_client_id
GOOGLE_CLIENT_SECRET=your_test_google_client_secret
```

## 🔧 Configuration Validation

### Environment Validation Script

```typescript
// scripts/validate-env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  MONGODB_URI: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  FEC_API_KEY: z.string().min(10),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().regex(/^\d+$/),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(8)
});

export function validateEnvironment() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables are valid');
    return true;
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    return false;
  }
}
```

### Startup Validation

```typescript
// src/lib/validate-env.ts
export async function validateEnvironmentOnStartup() {
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'MONGODB_URI',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  console.log('✅ All required environment variables are present');
}
```

This comprehensive environment configuration ensures Revolution Network operates securely and efficiently across development, staging, and production environments.
