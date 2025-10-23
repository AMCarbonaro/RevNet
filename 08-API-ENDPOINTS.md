# API Endpoints Documentation

## Overview

Revolution Network provides a comprehensive REST API built with Next.js API routes. The API handles authentication, project management, donations, real-time features, and FEC compliance monitoring.

## 🔐 Authentication Endpoints

### NextAuth.js Routes

```typescript
// NextAuth.js automatically handles these routes:
GET  /api/auth/signin          // Sign in page
POST /api/auth/signin          // Sign in form submission
GET  /api/auth/signout         // Sign out
GET  /api/auth/callback/google // Google OAuth callback
GET  /api/auth/callback/github // GitHub OAuth callback
GET  /api/auth/callback/discord // Discord OAuth callback
GET  /api/auth/session         // Get current session
GET  /api/auth/csrf            // CSRF token
```

### User Profile Management

```typescript
// Get user profile
GET /api/user/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "creator",
    "letterProgress": {
      "completedLetters": [1, 2, 3],
      "currentLetter": 4,
      "totalLetters": 30
    },
    "stats": {
      "projectsCreated": 2,
      "projectsJoined": 5,
      "totalDonated": 50000,
      "totalRaised": 150000
    }
  }
}

// Update user profile
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Revolutionary activist",
  "location": "New York, NY",
  "website": "https://johndoe.com",
  "socialLinks": {
    "twitter": "@johndoe",
    "instagram": "@johndoe"
  }
}
```

## 📚 Anthony Letters API

### Get Letters

```typescript
// Get all letters
GET /api/letters

// Get specific letter
GET /api/letters?id=1

// Get letters by book
GET /api/letters?book=awakening

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "You've Been Played",
      "content": "Here's what I've learned...",
      "book": "awakening",
      "order": 1,
      "assignments": [
        {
          "id": "1-1",
          "title": "Reflect on Your Current Understanding",
          "description": "Write down what you currently believe...",
          "type": "reflection",
          "requirements": ["Write 200-300 words"],
          "isRequired": true
        }
      ],
      "prerequisites": [],
      "unlocks": ["join_existing_revolts"],
      "estimatedReadTime": 5,
      "isUnlocked": true
    }
  ]
}
```

### Update Letter Progress

```typescript
// Mark letter as completed
POST /api/letters
Authorization: Bearer <token>
Content-Type: application/json

{
  "letterId": 1,
  "userId": "user123",
  "completed": true,
  "assignmentProgress": [
    {
      "assignmentId": "1-1",
      "completed": true,
      "content": "My reflection on power structures..."
    }
  ]
}

Response:
{
  "success": true,
  "message": "Letter progress updated successfully"
}
```

## 🚀 Project Management API

### Get Projects

```typescript
// Get all projects
GET /api/projects

// Get projects with filters
GET /api/projects?category=mural&status=active&page=1&limit=10

// Search projects
GET /api/projects?search=climate&location=NY

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "project123",
        "title": "Climate Action Mural",
        "description": "A powerful mural about climate change...",
        "category": "mural",
        "status": "active",
        "fundingGoal": 500000,
        "currentFunding": 250000,
        "backers": 45,
        "creator": {
          "id": "user123",
          "name": "Jane Smith",
          "avatar": "/avatars/jane.jpg"
        },
        "images": ["/projects/mural1.jpg"],
        "tags": ["climate", "art", "activism"],
        "createdAt": "2024-01-15T10:30:00Z",
        "isFECCompliant": false,
        "fecThresholdReached": false
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

### Get Specific Project

```typescript
// Get project by ID
GET /api/projects/[id]

Response:
{
  "success": true,
  "data": {
    "id": "project123",
    "title": "Climate Action Mural",
    "description": "Full project description...",
    "shortDescription": "Brief description...",
    "category": "mural",
    "status": "active",
    "fundingGoal": 500000,
    "currentFunding": 250000,
    "backers": 45,
    "creator": { /* user object */ },
    "images": ["/projects/mural1.jpg"],
    "tags": ["climate", "art", "activism"],
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    },
    "timeline": {
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-03-15T00:00:00Z",
      "milestones": [
        {
          "id": "milestone1",
          "title": "Design Phase",
          "description": "Create mural design",
          "targetDate": "2024-02-01T00:00:00Z",
          "completed": false
        }
      ]
    },
    "roles": [
      {
        "id": "role1",
        "title": "Lead Artist",
        "description": "Experienced muralist",
        "requirements": ["5+ years experience", "Portfolio required"],
        "filled": false
      }
    ],
    "updates": [
      {
        "id": "update1",
        "title": "Project Launch",
        "content": "We're excited to announce...",
        "author": { /* user object */ },
        "createdAt": "2024-01-15T10:30:00Z",
        "isPublic": true
      }
    ],
    "chat": [
      {
        "id": "message1",
        "content": "Great project!",
        "author": { /* user object */ },
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "isFECCompliant": false,
    "fecThresholdReached": false
  }
}
```

### Create Project

```typescript
// Create new project
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Climate Action Mural",
  "description": "A powerful mural about climate change...",
  "shortDescription": "Brief description...",
  "category": "mural",
  "fundingGoal": 500000,
  "creator": {
    "id": "user123",
    "name": "Jane Smith"
  },
  "images": ["/projects/mural1.jpg"],
  "tags": ["climate", "art", "activism"],
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  "timeline": {
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-03-15T00:00:00Z"
  },
  "roles": [
    {
      "title": "Lead Artist",
      "description": "Experienced muralist",
      "requirements": ["5+ years experience"]
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": "project123",
    "title": "Climate Action Mural",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update Project

```typescript
// Update project
PUT /api/projects/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Project Title",
  "description": "Updated description...",
  "status": "active"
}

Response:
{
  "success": true,
  "data": {
    "id": "project123",
    "title": "Updated Project Title",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

## 💳 Payment API

### Create Payment Intent

```typescript
// Create Stripe payment intent
POST /api/stripe/create-payment-intent
Content-Type: application/json

{
  "amount": 5000,              // $50.00 in cents
  "projectId": "project123",
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "message": "Supporting the cause!"
}

Response:
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890"
  }
}
```

### Stripe Webhook

```typescript
// Stripe webhook handler
POST /api/stripe/webhook
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=signature

// Handles events:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - payment_intent.canceled
// - payment_intent.requires_action

Response:
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### Get Donations

```typescript
// Get donations for project
GET /api/donations?projectId=project123

// Get donations by user
GET /api/donations?userId=user123

Response:
{
  "success": true,
  "data": [
    {
      "id": "donation123",
      "amount": 5000,
      "donor": {
        "id": "user456",
        "name": "John Doe",
        "avatar": "/avatars/john.jpg"
      },
      "project": {
        "id": "project123",
        "title": "Climate Action Mural"
      },
      "message": "Great cause!",
      "isAnonymous": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "status": "completed"
    }
  ]
}
```

## 🏛️ FEC Compliance API

### Get FEC Status

```typescript
// Get FEC compliance status
GET /api/fec-compliance?projectId=project123

Response:
{
  "success": true,
  "data": {
    "projectId": "project123",
    "currentFunding": 250000,
    "threshold": 250000,
    "warning": false,
    "alert": false,
    "status": "monitoring",
    "recommendations": [
      "Continue monitoring funding levels",
      "Prepare for potential FEC registration"
    ]
  }
}
```

### Get FEC Resources

```typescript
// Get FEC compliance resources
GET /api/fec-compliance/resources

Response:
{
  "success": true,
  "data": [
    {
      "id": "resource1",
      "title": "FEC Reporting Requirements",
      "description": "Learn about FEC reporting requirements for political committees",
      "url": "https://www.fec.gov/help-candidates-and-committees/",
      "category": "reporting"
    },
    {
      "id": "resource2",
      "title": "Contribution Limits",
      "description": "Understand individual and PAC contribution limits",
      "url": "https://www.fec.gov/help-candidates-and-committees/candidate-taking-receipts/contribution-limits/",
      "category": "limits"
    }
  ]
}
```

## 📱 Activity Feed API

### Get Feed Posts

```typescript
// Get activity feed
GET /api/feed?page=1&limit=20

// Get feed for specific user
GET /api/feed?userId=user123

Response:
{
  "success": true,
  "data": [
    {
      "id": "post123",
      "type": "project_created",
      "content": "Jane Smith created a new project: Climate Action Mural",
      "author": {
        "id": "user123",
        "name": "Jane Smith",
        "avatar": "/avatars/jane.jpg"
      },
      "project": {
        "id": "project123",
        "title": "Climate Action Mural"
      },
      "images": ["/projects/mural1.jpg"],
      "createdAt": "2024-01-15T10:30:00Z",
      "likes": 15,
      "comments": 3,
      "shares": 2,
      "isLiked": false
    }
  ]
}
```

### Create Feed Post

```typescript
// Create feed post
POST /api/feed
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "project_update",
  "content": "Project update: Design phase completed!",
  "projectId": "project123",
  "images": ["/updates/design1.jpg"]
}

Response:
{
  "success": true,
  "data": {
    "id": "post123",
    "type": "project_update",
    "content": "Project update: Design phase completed!",
    "author": { /* user object */ },
    "project": { /* project object */ },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## 🔔 Notifications API

### Get Notifications

```typescript
// Get user notifications
GET /api/notifications
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "notification123",
      "type": "project_funded",
      "title": "Project Funded!",
      "message": "Your project 'Climate Action Mural' has been fully funded!",
      "user": { /* user object */ },
      "relatedEntity": {
        "type": "project",
        "id": "project123"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "actionUrl": "/projects/project123"
    }
  ]
}
```

### Mark Notification as Read

```typescript
// Mark notification as read
PUT /api/notifications/[id]
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "notification123",
    "isRead": true,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Delete Notification

```typescript
// Delete notification
DELETE /api/notifications/[id]
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

## 🔄 Real-time Features

### Socket.IO Events

```typescript
// Client-side Socket.IO events
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

// Join project chat room
socket.emit('join-room', projectId);

// Send chat message
socket.emit('send-message', {
  room: projectId,
  content: 'Hello everyone!',
  author: user
});

// Listen for messages
socket.on('receive-message', (message) => {
  console.log('New message:', message);
});

// User presence
socket.emit('user-online', userId);
socket.on('user-status', (data) => {
  console.log('User status:', data);
});
```

### Chat API

```typescript
// Get chat messages
GET /api/chat?projectId=project123&limit=50

Response:
{
  "success": true,
  "data": [
    {
      "id": "message123",
      "content": "Great project!",
      "author": {
        "id": "user123",
        "name": "John Doe",
        "avatar": "/avatars/john.jpg"
      },
      "projectId": "project123",
      "createdAt": "2024-01-15T10:30:00Z",
      "reactions": [
        {
          "emoji": "👍",
          "users": ["user123", "user456"],
          "count": 2
        }
      ]
    }
  ]
}
```

## 📊 Analytics API

### Get Project Analytics

```typescript
// Get project analytics
GET /api/analytics/projects/[id]

Response:
{
  "success": true,
  "data": {
    "projectId": "project123",
    "views": 1250,
    "donations": 45,
    "totalRaised": 250000,
    "averageDonation": 5556,
    "conversionRate": 3.6,
    "topDonors": [
      {
        "donor": { /* user object */ },
        "amount": 50000,
        "donationCount": 3
      }
    ],
    "fundingTrends": [
      {
        "date": "2024-01-15",
        "amount": 50000,
        "donations": 10
      }
    ]
  }
}
```

### Get User Analytics

```typescript
// Get user analytics
GET /api/analytics/users/[id]

Response:
{
  "success": true,
  "data": {
    "userId": "user123",
    "projectsCreated": 2,
    "projectsJoined": 5,
    "totalDonated": 50000,
    "totalRaised": 150000,
    "letterProgress": {
      "completedLetters": 15,
      "totalLetters": 30,
      "completionRate": 50
    },
    "engagement": {
      "postsCreated": 12,
      "commentsMade": 45,
      "likesReceived": 120
    }
  }
}
```

## 🛡️ Security & Validation

### Request Validation

```typescript
// Example validation middleware
export function validateRequest(schema: ZodSchema) {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return validatedData;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }
  };
}
```

### Rate Limiting

```typescript
// Rate limiting configuration
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};
```

### Authentication Middleware

```typescript
// Authentication middleware
export async function authenticateRequest(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}
```

## 📝 Error Handling

### Standard Error Response

```typescript
interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// Example error responses
{
  "success": false,
  "error": "Project not found",
  "code": "PROJECT_NOT_FOUND"
}

{
  "success": false,
  "error": "Invalid payment amount",
  "code": "INVALID_AMOUNT",
  "details": {
    "min": 100,
    "max": 1000000
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

This comprehensive API documentation provides the foundation for integrating with Revolution Network's backend services while maintaining security, performance, and user experience standards.
