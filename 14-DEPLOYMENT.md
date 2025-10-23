# Deployment Documentation

## Overview

This document provides comprehensive instructions for deploying Revolution Network to production environments. It covers Vercel deployment, database setup, environment configuration, and monitoring.

## 🚀 Vercel Deployment

### 1. Prerequisites

#### Required Accounts
- [Vercel Account](https://vercel.com) - For hosting and deployment
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) - For database
- [Stripe Account](https://stripe.com) - For payments
- [GitHub Account](https://github.com) - For code repository

#### Required Tools
```bash
# Install Vercel CLI
npm install -g vercel

# Install MongoDB Compass (optional)
# Download from https://www.mongodb.com/products/compass
```

### 2. Repository Setup

#### GitHub Repository
```bash
# Create new repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/revolution-network.git
git push -u origin main
```

#### Repository Structure
```
revolution-network/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .vercel/
│   └── project.json
├── src/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### 3. Vercel Project Setup

#### Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub repository
4. Configure project settings

#### Project Configuration
```json
// .vercel/project.json
{
  "name": "revolution-network",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

#### Build Settings
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

### 4. Environment Variables

#### Production Environment Variables
```env
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-key

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revolution-network

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_ENVIRONMENT=live

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=https://your-domain.vercel.app
SOCKET_IO_PORT=3001

# FEC Compliance
FEC_API_KEY=your_fec_api_key
FEC_WEBHOOK_URL=https://your-domain.vercel.app/api/fec/webhook

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
SMTP_FROM=noreply@your-domain.com

# Security
CORS_ORIGIN=https://your-domain.vercel.app
RATE_LIMIT_MAX_REQUESTS=1000
```

#### Setting Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add each environment variable
3. Set different values for Preview and Production
4. Use Vercel's built-in secret management

### 5. Deployment Process

#### Automatic Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### Manual Deployment
```bash
# Deploy to Vercel
vercel --prod

# Deploy preview
vercel

# Deploy specific branch
vercel --target production
```

## 🗄️ Database Setup

### 1. MongoDB Atlas Configuration

#### Cluster Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster
3. Choose cloud provider and region
4. Select cluster tier (M0 for development, M10+ for production)

#### Database Configuration
```javascript
// Database connection settings
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority'
};
```

#### Security Configuration
```javascript
// Network Access
// Whitelist IP addresses or use 0.0.0.0/0 for Vercel

// Database User
{
  "username": "revolution_user",
  "password": "secure_password",
  "roles": [
    {
      "role": "readWrite",
      "db": "revolution-network"
    }
  ]
}
```

#### Connection String
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revolution-network?retryWrites=true&w=majority
```

### 2. Database Initialization

#### Seed Data
```typescript
// scripts/seed-database.ts
import { connectToDatabase } from '../src/lib/database';
import { letters } from '../src/data/letters';

async function seedDatabase() {
  const db = await connectToDatabase();
  if (!db) throw new Error('Database connection failed');

  // Seed letters
  await db.collection('letters').insertMany(letters);
  
  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('projects').createIndex({ status: 1 });
  await db.collection('donations').createIndex({ projectId: 1 });
  
  console.log('Database seeded successfully');
}

seedDatabase().catch(console.error);
```

#### Database Indexes
```javascript
// Create performance indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "userType": 1 });
db.users.createIndex({ "joinedAt": -1 });

db.projects.createIndex({ "status": 1 });
db.projects.createIndex({ "category": 1 });
db.projects.createIndex({ "createdAt": -1 });
db.projects.createIndex({ "creator.id": 1 });

db.donations.createIndex({ "project.id": 1 });
db.donations.createIndex({ "donor.id": 1 });
db.donations.createIndex({ "createdAt": -1 });

db.chatMessages.createIndex({ "projectId": 1, "createdAt": -1 });
db.feedPosts.createIndex({ "createdAt": -1 });
db.notifications.createIndex({ "user.id": 1, "createdAt": -1 });
```

## 💳 Stripe Configuration

### 1. Stripe Account Setup

#### Live Mode Configuration
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to Live mode
3. Get live API keys
4. Configure webhook endpoints

#### API Keys
```env
# Live Stripe Keys
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_ENVIRONMENT=live
```

#### Webhook Configuration
```typescript
// Stripe webhook endpoint
POST https://your-domain.vercel.app/api/stripe/webhook

// Required events:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - payment_intent.canceled
// - payment_intent.requires_action
```

### 2. Payment Processing

#### Stripe Configuration
```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Payment intent creation
export async function createPaymentIntent(amount: number, metadata: any) {
  return await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}
```

#### Webhook Handling
```typescript
// src/app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  return new Response('OK', { status: 200 });
}
```

## 🔄 Socket.IO Server

### 1. Socket.IO Configuration

#### Server Setup
```typescript
// src/lib/socket.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SOCKET_URL,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  
  socket.on('send-message', (data) => {
    socket.to(data.room).emit('receive-message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export { io };
```

#### Client Configuration
```typescript
// src/lib/socket-client.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true
    });
  }
  return socket;
};
```

### 2. Socket.IO Deployment

#### Vercel Serverless Functions
```typescript
// src/app/api/socket/route.ts
import { NextRequest } from 'next/server';
import { Server } from 'socket.io';

export async function GET(req: NextRequest) {
  // Handle Socket.IO connection
  return new Response('Socket.IO endpoint', { status: 200 });
}
```

#### Alternative: Separate Socket.IO Server
```dockerfile
# Dockerfile for Socket.IO server
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3001

CMD ["node", "socket-server.js"]
```

## 📧 Email Configuration

### 1. SMTP Setup

#### Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com
```

#### SendGrid Alternative
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@your-domain.com
```

### 2. Email Templates

#### Email Service
```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  return await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}
```

#### Email Templates
```typescript
// src/templates/email/welcome.tsx
export function WelcomeEmail({ name }: { name: string }) {
  return `
    <html>
      <body>
        <h1>Welcome to Revolution Network, ${name}!</h1>
        <p>Thank you for joining our revolutionary community.</p>
        <p>Start your journey with the Anthony Letters.</p>
      </body>
    </html>
  `;
}
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

#### Vercel SSL
- Vercel automatically provides SSL certificates
- No additional configuration needed
- HTTPS enforced by default

#### Custom Domain SSL
```bash
# If using custom domain
# SSL is automatically handled by Vercel
# No manual certificate management required
```

### 2. Security Headers

#### Next.js Security Headers
```javascript
// next.config.js
const nextConfig = {
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
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
};
```

### 3. Rate Limiting

#### API Rate Limiting
```typescript
// src/lib/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimit = new Map();

export function rateLimitMiddleware(req: NextRequest) {
  const ip = req.ip || 'anonymous';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const userLimit = rateLimit.get(ip);
  
  if (now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}
```

## 📊 Monitoring and Analytics

### 1. Vercel Analytics

#### Built-in Analytics
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};
```

#### Custom Analytics
```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
```

### 2. Error Monitoring

#### Sentry Integration
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/nextjs';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### 3. Performance Monitoring

#### Web Vitals
```typescript
// src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🚀 Deployment Checklist

### Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] Stripe webhook endpoints configured
- [ ] Email service configured
- [ ] SSL certificates valid
- [ ] Security headers configured
- [ ] Error monitoring setup
- [ ] Analytics configured
- [ ] Performance monitoring enabled

### Post-Deployment Checklist
- [ ] Application accessible via domain
- [ ] Authentication working
- [ ] Database operations functional
- [ ] Payment processing working
- [ ] Real-time features operational
- [ ] Email notifications working
- [ ] Error monitoring active
- [ ] Analytics tracking data
- [ ] Performance metrics within acceptable range

### Monitoring Checklist
- [ ] Application uptime monitoring
- [ ] Database performance monitoring
- [ ] Payment processing monitoring
- [ ] Error rate monitoring
- [ ] Performance metrics monitoring
- [ ] Security monitoring
- [ ] User analytics tracking

## 🔧 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs
vercel logs

# Local build test
npm run build

# Check TypeScript errors
npm run type-check
```

#### Environment Variable Issues
```bash
# Verify environment variables
vercel env ls

# Set missing variables
vercel env add VARIABLE_NAME
```

#### Database Connection Issues
```bash
# Test database connection
mongosh "your-connection-string"

# Check network access
# Verify IP whitelist in MongoDB Atlas
```

#### Stripe Webhook Issues
```bash
# Test webhook endpoint
curl -X POST https://your-domain.vercel.app/api/stripe/webhook

# Check webhook logs in Stripe Dashboard
```

This comprehensive deployment documentation ensures successful production deployment of Revolution Network with all necessary configurations and monitoring in place.
