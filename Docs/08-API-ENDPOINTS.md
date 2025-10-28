# API Endpoints Documentation

## Overview

Revolution Network provides a comprehensive REST API built with Node.js/Express for Angular 17+ frontend. The API handles authentication, Revolt management, channel operations, real-time communication, donations, and user management with Discord-like functionality.

## 🔐 Authentication Endpoints

### OAuth Integration

```typescript
// OAuth provider authentication
POST /api/auth/oauth
Content-Type: application/json

{
  "provider": "google", // google, github, discord
  "code": "oauth_code",
  "state": "random_state"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "userType": "member"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### User Profile Management

```typescript
// Get user profile
GET /api/user/profile
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "userType": "member",
    "letterProgress": {
      "completedLetters": [1, 2, 3, 4, 5, 6, 7],
      "currentLetter": 8,
      "totalLetters": 30,
      "canAccessDiscord": false
    },
    "revolts": {
      "joined": ["revolt123", "revolt456"],
      "created": ["revolt789"],
      "totalContributed": 50000,
      "totalRaised": 150000
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "lastActive": "2024-01-15T15:45:00Z"
  }
}

// Update user profile
PUT /api/user/profile
Authorization: Bearer <access_token>
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
GET /api/letters/1

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
POST /api/letters/progress
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "letterId": 1,
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
  "data": {
    "letterId": 1,
    "completed": true,
    "unlockedFeatures": ["join_existing_revolts"],
    "canAccessDiscord": false,
    "nextLetter": 2
  }
}
```

## 🏛️ Revolt Management API

### Get Revolts

```typescript
// Get all public Revolts
GET /api/revolts

// Get Revolts with filters
GET /api/revolts?category=activism&status=active&page=1&limit=10

// Search Revolts
GET /api/revolts?search=climate&location=NY

// Get user's joined Revolts
GET /api/revolts/joined
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "revolt123",
        "name": "Climate Action Network",
        "description": "A powerful network fighting climate change...",
        "shortDescription": "Climate activism community",
        "category": "activism",
        "status": "active",
        "isPublic": true,
        "memberCount": 1250,
        "fundingGoal": 500000,
        "currentFunding": 250000,
        "creator": {
          "id": "user123",
          "name": "Jane Smith",
          "avatar": "/avatars/jane.jpg"
        },
        "icon": "/revolts/climate-icon.jpg",
        "banner": "/revolts/climate-banner.jpg",
        "tags": ["climate", "environment", "activism"],
        "channels": [
          {
            "id": "channel1",
            "name": "general",
            "type": "text",
            "position": 0
          },
          {
            "id": "channel2",
            "name": "voice-chat",
            "type": "voice",
            "position": 1
          }
        ],
        "roles": [
          {
            "id": "role1",
            "name": "Admin",
            "color": "#FF0000",
            "permissions": ["manage_channels", "manage_roles", "kick_members"]
          },
          {
            "id": "role2",
            "name": "Member",
            "color": "#00FF00",
            "permissions": ["send_messages", "join_voice"]
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

### Get Specific Revolt

```typescript
// Get Revolt by ID
GET /api/revolts/revolt123

Response:
{
  "success": true,
  "data": {
    "id": "revolt123",
    "name": "Climate Action Network",
    "description": "Full Revolt description...",
    "shortDescription": "Brief description...",
    "category": "activism",
    "status": "active",
    "isPublic": true,
    "memberCount": 1250,
    "fundingGoal": 500000,
    "currentFunding": 250000,
    "creator": { /* user object */ },
    "icon": "/revolts/climate-icon.jpg",
    "banner": "/revolts/climate-banner.jpg",
    "tags": ["climate", "environment", "activism"],
    "channels": [
      {
        "id": "channel1",
        "name": "general",
        "type": "text",
        "description": "General discussion",
        "position": 0,
        "messageCount": 1250,
        "lastMessage": {
          "id": "msg123",
          "content": "Great discussion everyone!",
          "author": { /* user object */ },
          "createdAt": "2024-01-15T15:30:00Z"
        }
      }
    ],
    "members": [
      {
        "user": { /* user object */ },
        "role": "Admin",
        "joinedAt": "2024-01-15T10:30:00Z",
        "permissions": ["manage_channels", "manage_roles"]
      }
    ],
    "roles": [ /* role objects */ ],
    "funding": {
      "totalRaised": 250000,
      "donorCount": 45,
      "averageDonation": 5556,
      "recentDonations": [ /* donation objects */ ]
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Create Revolt

```typescript
// Create new Revolt
POST /api/revolts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Climate Action Network",
  "description": "A powerful network fighting climate change...",
  "shortDescription": "Climate activism community",
  "category": "activism",
  "isPublic": true,
  "fundingGoal": 500000,
  "tags": ["climate", "environment", "activism"],
  "icon": "base64_encoded_image",
  "banner": "base64_encoded_image"
}

Response:
{
  "success": true,
  "data": {
    "id": "revolt123",
    "name": "Climate Action Network",
    "status": "active",
    "inviteCode": "ABC123DEF",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Join/Leave Revolt

```typescript
// Join Revolt by invite code
POST /api/revolts/join
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "inviteCode": "ABC123DEF"
}

// Leave Revolt
DELETE /api/revolts/revolt123/leave
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
    "revoltId": "revolt123",
    "joined": true,
    "role": "Member",
    "permissions": ["send_messages", "join_voice"]
  }
}
```

## 💬 Channel Management API

### Get Channels

```typescript
// Get channels for a Revolt
GET /api/revolts/revolt123/channels

Response:
{
  "success": true,
  "data": [
    {
      "id": "channel1",
      "name": "general",
      "type": "text",
      "description": "General discussion",
      "position": 0,
      "messageCount": 1250,
      "lastMessage": {
        "id": "msg123",
        "content": "Great discussion everyone!",
        "author": { /* user object */ },
        "createdAt": "2024-01-15T15:30:00Z"
      },
      "settings": {
        "slowMode": 0,
        "nsfw": false,
        "archived": false
      }
    },
    {
      "id": "channel2",
      "name": "voice-chat",
      "type": "voice",
      "description": "Voice discussion",
      "position": 1,
      "memberCount": 5,
      "settings": {
        "maxUsers": 50,
        "bitrate": 64000
      }
    }
  ]
}
```

### Create Channel

```typescript
// Create new channel
POST /api/revolts/revolt123/channels
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "announcements",
  "type": "text",
  "description": "Important announcements",
  "position": 2,
  "settings": {
    "slowMode": 5,
    "nsfw": false
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "channel3",
    "name": "announcements",
    "type": "text",
    "position": 2,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update Channel

```typescript
// Update channel
PUT /api/revolts/revolt123/channels/channel1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "general-updated",
  "description": "Updated general discussion",
  "settings": {
    "slowMode": 10,
    "nsfw": false
  }
}
```

### Delete Channel

```typescript
// Delete channel
DELETE /api/revolts/revolt123/channels/channel1
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Channel deleted successfully"
}
```

## 💬 Messaging API

### Get Messages

```typescript
// Get messages for a channel
GET /api/revolts/revolt123/channels/channel1/messages?limit=50&before=msg123

Response:
{
  "success": true,
  "data": [
    {
      "id": "msg123",
      "content": "Great discussion everyone!",
      "author": {
        "id": "user123",
        "name": "John Doe",
        "avatar": "/avatars/john.jpg",
        "role": "Member",
        "roleColor": "#00FF00"
      },
      "channelId": "channel1",
      "revoltId": "revolt123",
      "createdAt": "2024-01-15T15:30:00Z",
      "editedAt": null,
      "isDeleted": false,
      "reactions": [
        {
          "emoji": "👍",
          "users": ["user123", "user456"],
          "count": 2
        }
      ],
      "attachments": [
        {
          "id": "att123",
          "filename": "document.pdf",
          "url": "/attachments/document.pdf",
          "size": 1024000,
          "type": "application/pdf"
        }
      ],
      "replyTo": null
    }
  ],
  "hasMore": true
}
```

### Send Message

```typescript
// Send message to channel
POST /api/revolts/revolt123/channels/channel1/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Hello everyone!",
  "replyTo": "msg123", // optional
  "attachments": ["att123"] // optional
}

Response:
{
  "success": true,
  "data": {
    "id": "msg124",
    "content": "Hello everyone!",
    "author": { /* user object */ },
    "channelId": "channel1",
    "revoltId": "revolt123",
    "createdAt": "2024-01-15T15:35:00Z"
  }
}
```

### Edit Message

```typescript
// Edit message
PUT /api/revolts/revolt123/channels/channel1/messages/msg124
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Hello everyone! (edited)"
}

Response:
{
  "success": true,
  "data": {
    "id": "msg124",
    "content": "Hello everyone! (edited)",
    "editedAt": "2024-01-15T15:40:00Z"
  }
}
```

### Delete Message

```typescript
// Delete message
DELETE /api/revolts/revolt123/channels/channel1/messages/msg124
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### Add Reaction

```typescript
// Add reaction to message
POST /api/revolts/revolt123/channels/channel1/messages/msg123/reactions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "emoji": "👍"
}

Response:
{
  "success": true,
  "data": {
    "emoji": "👍",
    "users": ["user123", "user456", "user789"],
    "count": 3
  }
}
```

## 🎤 Voice/Video API

### Join Voice Channel

```typescript
// Join voice channel
POST /api/revolts/revolt123/channels/channel2/join
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deviceId": "microphone123"
}

Response:
{
  "success": true,
  "data": {
    "channelId": "channel2",
    "sessionId": "voice_session_123",
    "iceServers": [
      {
        "urls": "stun:stun.l.google.com:19302"
      }
    ],
    "participants": [
      {
        "userId": "user123",
        "name": "John Doe",
        "isMuted": false,
        "isDeafened": false,
        "isSpeaking": false
      }
    ]
  }
}
```

### Leave Voice Channel

```typescript
// Leave voice channel
POST /api/revolts/revolt123/channels/channel2/leave
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Left voice channel successfully"
}
```

### Update Voice State

```typescript
// Update voice state (mute/unmute, deafen/undeafen)
PUT /api/revolts/revolt123/channels/channel2/voice-state
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isMuted": true,
  "isDeafened": false
}

Response:
{
  "success": true,
  "data": {
    "userId": "user123",
    "isMuted": true,
    "isDeafened": false,
    "isSpeaking": false
  }
}
```

## 💳 Donation API

### Create Donation Intent

```typescript
// Create Stripe payment intent for Revolt
POST /api/donations/create-intent
Content-Type: application/json

{
  "amount": 5000,              // $50.00 in cents
  "revoltId": "revolt123",
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "message": "Supporting the cause!",
  "isAnonymous": false
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

### Anonymous Donation

```typescript
// Anonymous donation from homepage
POST /api/donations/anonymous
Content-Type: application/json

{
  "amount": 2500,              // $25.00 in cents
  "revoltId": "revolt123",
  "message": "Keep up the great work!",
  "isAnonymous": true
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

### Get Revolt Donations

```typescript
// Get donations for Revolt
GET /api/revolts/revolt123/donations

Response:
{
  "success": true,
  "data": {
    "totalDonations": 45,
    "totalAmount": 250000,
    "averageDonation": 5556,
    "recentDonations": [
      {
        "id": "donation123",
        "amount": 5000,
        "donor": {
          "name": "John Doe",
          "isAnonymous": false
        },
        "message": "Great cause!",
        "createdAt": "2024-01-15T10:30:00Z",
        "status": "completed"
      }
    ],
    "fundingProgress": {
      "current": 250000,
      "goal": 500000,
      "percentage": 50
    }
  }
}
```

## 🔔 Notifications API

### Get Notifications

```typescript
// Get user notifications
GET /api/notifications
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "notification123",
      "type": "message_mention",
      "title": "You were mentioned",
      "message": "John Doe mentioned you in #general",
      "user": { /* user object */ },
      "relatedEntity": {
        "type": "message",
        "id": "msg123",
        "revoltId": "revolt123",
        "channelId": "channel1"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "actionUrl": "/revolts/revolt123/channels/channel1"
    }
  ]
}
```

### Mark Notification as Read

```typescript
// Mark notification as read
PUT /api/notifications/notification123
Authorization: Bearer <access_token>

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

## 🔄 Real-time WebSocket Events

### Socket.IO Connection

```typescript
// Client-side Socket.IO connection
const socket = io(process.env.NG_APP_SOCKET_URL, {
  auth: {
    token: 'jwt_access_token'
  }
});

// Join Revolt room
socket.emit('join-revolt', revoltId);

// Join channel room
socket.emit('join-channel', { revoltId, channelId });

// Leave channel room
socket.emit('leave-channel', { revoltId, channelId });
```

### Message Events

```typescript
// Send message
socket.emit('send-message', {
  revoltId: 'revolt123',
  channelId: 'channel1',
  content: 'Hello everyone!',
  replyTo: 'msg123' // optional
});

// Listen for new messages
socket.on('message-created', (message) => {
  console.log('New message:', message);
});

// Listen for message updates
socket.on('message-updated', (message) => {
  console.log('Message updated:', message);
});

// Listen for message deletions
socket.on('message-deleted', (data) => {
  console.log('Message deleted:', data);
});
```

### Voice Events

```typescript
// Join voice channel
socket.emit('join-voice', {
  revoltId: 'revolt123',
  channelId: 'channel2'
});

// Leave voice channel
socket.emit('leave-voice', {
  revoltId: 'revolt123',
  channelId: 'channel2'
});

// Update voice state
socket.emit('update-voice-state', {
  revoltId: 'revolt123',
  channelId: 'channel2',
  isMuted: true,
  isDeafened: false
});

// Listen for voice events
socket.on('user-joined-voice', (data) => {
  console.log('User joined voice:', data);
});

socket.on('user-left-voice', (data) => {
  console.log('User left voice:', data);
});

socket.on('voice-state-updated', (data) => {
  console.log('Voice state updated:', data);
});
```

### Presence Events

```typescript
// Update user presence
socket.emit('update-presence', {
  status: 'online', // online, away, busy, invisible
  activity: 'Playing Revolution Network'
});

// Listen for presence updates
socket.on('presence-updated', (data) => {
  console.log('Presence updated:', data);
});

// Listen for user status changes
socket.on('user-status-changed', (data) => {
  console.log('User status changed:', data);
});
```

### Typing Indicators

```typescript
// Start typing
socket.emit('start-typing', {
  revoltId: 'revolt123',
  channelId: 'channel1'
});

// Stop typing
socket.emit('stop-typing', {
  revoltId: 'revolt123',
  channelId: 'channel1'
});

// Listen for typing indicators
socket.on('user-typing', (data) => {
  console.log('User typing:', data);
});

socket.on('user-stopped-typing', (data) => {
  console.log('User stopped typing:', data);
});
```

## 📊 Analytics API

### Get Revolt Analytics

```typescript
// Get Revolt analytics
GET /api/revolts/revolt123/analytics
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
    "revoltId": "revolt123",
    "memberCount": 1250,
    "messageCount": 15000,
    "voiceMinutes": 2500,
    "donations": {
      "totalAmount": 250000,
      "donorCount": 45,
      "averageDonation": 5556
    },
    "engagement": {
      "dailyActiveUsers": 150,
      "weeklyActiveUsers": 500,
      "monthlyActiveUsers": 800
    },
    "channels": [
      {
        "id": "channel1",
        "name": "general",
        "messageCount": 10000,
        "activeUsers": 200
      }
    ],
    "growth": {
      "membersThisWeek": 50,
      "membersThisMonth": 200,
      "messagesThisWeek": 1000
    }
  }
}
```

## 🛡️ Security & Validation

### Request Validation

```typescript
// Example validation middleware
export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
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

// Per-endpoint rate limiting
const messageRateLimit = {
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit to 10 messages per minute
  message: 'Too many messages sent'
};
```

### Authentication Middleware

```typescript
// JWT authentication middleware
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
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
  "error": "Revolt not found",
  "code": "REVOLT_NOT_FOUND"
}

{
  "success": false,
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS",
  "details": {
    "required": "manage_channels",
    "userHas": "send_messages"
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

This comprehensive API documentation provides the foundation for integrating with Revolution Network's Discord-like backend services while maintaining security, performance, and real-time communication standards.