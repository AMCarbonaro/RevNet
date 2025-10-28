# Database Schema Documentation

## Overview

Revolution Network uses MongoDB as its primary database, with a document-based schema designed for Discord-like functionality, real-time communication, and scalability. The database stores user data, Revolt (server) information, channel data, messages, voice/video sessions, and system notifications.

## 🗄️ Database Collections

### 1. Users Collection

**Purpose**: Store user profiles, authentication data, and progression tracking.

```typescript
interface User {
  _id: ObjectId;
  id: string;                    // Unique user identifier
  username: string;              // Display name (Discord-style)
  email: string;                 // Email address
  avatar?: string;               // Profile image URL
  discriminator: string;         // 4-digit discriminator (e.g., "1234")
  bio?: string;                  // User biography
  status: 'online' | 'away' | 'busy' | 'invisible'; // User status
  customStatus?: string;         // Custom status message
  location?: string;             // User location
  website?: string;              // Personal website
  socialLinks?: {               // Social media links
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  userType: 'creator' | 'supporter'; // User role
  joinedAt: Date;                // Account creation date
  isVerified: boolean;           // Account verification status
  letterProgress: LetterProgress; // Anthony Letters progression
  achievements: Achievement[];   // Unlocked achievements
  stats: UserStats;             // User statistics
  revoltMemberships: RevoltMembership[]; // Revolt memberships
  voiceState?: VoiceState;      // Current voice state
  lastSeen: Date;               // Last activity timestamp
}
```

**Indexes**:
```javascript
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "id": 1 }, { unique: true });
db.users.createIndex({ "username": 1, "discriminator": 1 }, { unique: true });
db.users.createIndex({ "userType": 1 });
db.users.createIndex({ "joinedAt": -1 });
db.users.createIndex({ "status": 1 });
db.users.createIndex({ "lastSeen": -1 });
```

### 2. Revolts Collection (Servers)

**Purpose**: Store Discord-style server information, settings, and member data.

```typescript
interface Revolt {
  _id: ObjectId;
  id: string;                    // Unique revolt identifier
  name: string;                  // Revolt name
  description: string;           // Revolt description
  icon?: string;                 // Revolt icon URL
  banner?: string;               // Revolt banner URL
  owner: ObjectId;               // Owner user ID
  members: RevoltMember[];       // Revolt members
  channels: ObjectId[];          // Channel IDs
  roles: RevoltRole[];           // Custom roles
  categories: ChannelCategory[]; // Channel categories
  settings: RevoltSettings;      // Revolt settings
  stats: RevoltStats;           // Revolt statistics
  inviteCode: string;           // Invite code
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
}

interface RevoltMember {
  userId: ObjectId;              // User ID
  username: string;              // Username at time of join
  joinedAt: Date;               // Join timestamp
  roles: string[];              // Role IDs
  permissions: string[];        // Direct permissions
  isOwner: boolean;             // Owner status
  isOnline: boolean;            // Online status
  lastSeen: Date;               // Last activity
}

interface RevoltRole {
  id: string;                   // Role ID
  name: string;                 // Role name
  color: string;                // Role color (hex)
  permissions: string[];        // Role permissions
  position: number;             // Role position
  isManaged: boolean;           // System role flag
  createdAt: Date;              // Creation timestamp
}

interface RevoltSettings {
  isPublic: boolean;            // Public revolt flag
  verificationLevel: number;    // Verification level (0-4)
  defaultChannelId?: string;    // Default channel
  systemChannelId?: string;     // System messages channel
  rulesChannelId?: string;      // Rules channel
  maxMembers: number;           // Maximum members
  allowInvites: boolean;        // Allow member invites
  slowMode: number;             // Slow mode (seconds)
  contentFilter: number;        // Content filter level
  region: string;               // Voice region
  premiumTier: number;          // Premium tier (0-3)
}

interface RevoltStats {
  memberCount: number;          // Current member count
  messageCount: number;         // Total messages
  totalDonations: number;       // Total donations (cents)
  activeMembers: number;        // Active members (last 30 days)
  channelsCount: number;        // Number of channels
  createdAt: Date;              // Stats timestamp
}
```

**Indexes**:
```javascript
db.revolts.createIndex({ "id": 1 }, { unique: true });
db.revolts.createIndex({ "owner": 1 });
db.revolts.createIndex({ "members.userId": 1 });
db.revolts.createIndex({ "settings.isPublic": 1 });
db.revolts.createIndex({ "createdAt": -1 });
db.revolts.createIndex({ "inviteCode": 1 }, { unique: true });
db.revolts.createIndex({ "stats.memberCount": -1 });
```

### 3. Channels Collection

**Purpose**: Store text, voice, and video channel information.

```typescript
interface Channel {
  _id: ObjectId;
  id: string;                   // Unique channel identifier
  revoltId: ObjectId;           // Parent revolt ID
  name: string;                 // Channel name
  type: 'text' | 'voice' | 'video' | 'category'; // Channel type
  description?: string;         // Channel description
  position: number;             // Channel position
  categoryId?: string;          // Parent category ID
  permissions: ChannelPermission[]; // Channel permissions
  settings: ChannelSettings;    // Channel settings
  lastMessageId?: string;       // Last message ID
  lastActivity: Date;           // Last activity timestamp
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
}

interface ChannelPermission {
  type: 'role' | 'member';      // Permission type
  id: string;                   // Role or member ID
  allow: string[];              // Allowed permissions
  deny: string[];               // Denied permissions
}

interface ChannelSettings {
  isNsfw: boolean;              // NSFW flag
  slowMode: number;             // Slow mode (seconds)
  maxMembers?: number;          // Max members (voice channels)
  bitrate?: number;             // Voice bitrate
  region?: string;              // Voice region
  videoQuality?: string;        // Video quality
  isPrivate: boolean;           // Private channel flag
  archived: boolean;            // Archived flag
  archivedAt?: Date;            // Archive timestamp
}

interface ChannelCategory {
  id: string;                   // Category ID
  name: string;                 // Category name
  position: number;             // Category position
  channels: string[];           // Channel IDs in category
  collapsed: boolean;           // Collapsed state
}
```

**Indexes**:
```javascript
db.channels.createIndex({ "id": 1 }, { unique: true });
db.channels.createIndex({ "revoltId": 1, "position": 1 });
db.channels.createIndex({ "revoltId": 1, "type": 1 });
db.channels.createIndex({ "categoryId": 1 });
db.channels.createIndex({ "lastActivity": -1 });
db.channels.createIndex({ "settings.isPrivate": 1 });
```

### 4. Messages Collection

**Purpose**: Store all text messages, file uploads, and embeds.

```typescript
interface Message {
  _id: ObjectId;
  id: string;                   // Unique message identifier
  channelId: ObjectId;          // Channel ID
  revoltId: ObjectId;           // Revolt ID
  authorId: ObjectId;           // Author user ID
  content: string;              // Message content
  type: 'text' | 'image' | 'file' | 'embed' | 'system'; // Message type
  attachments: MessageAttachment[]; // File attachments
  embeds: MessageEmbed[];       // Rich embeds
  reactions: MessageReaction[]; // Message reactions
  mentions: ObjectId[];         // Mentioned user IDs
  roleMentions: string[];       // Mentioned role IDs
  channelMentions: ObjectId[];  // Mentioned channel IDs
  replyTo?: string;             // Reply to message ID
  editedAt?: Date;              // Edit timestamp
  pinned: boolean;              // Pinned message flag
  pinnedAt?: Date;              // Pin timestamp
  isDeleted: boolean;           // Deletion status
  deletedAt?: Date;             // Deletion timestamp
  createdAt: Date;              // Creation timestamp
}

interface MessageAttachment {
  id: string;                   // Attachment ID
  filename: string;             // Original filename
  url: string;                  // File URL
  size: number;                 // File size (bytes)
  contentType: string;          // MIME type
  width?: number;               // Image width
  height?: number;              // Image height
  duration?: number;            // Video/audio duration
}

interface MessageEmbed {
  title?: string;               // Embed title
  description?: string;         // Embed description
  url?: string;                 // Embed URL
  color?: string;               // Embed color (hex)
  timestamp?: Date;             // Embed timestamp
  thumbnail?: {                 // Thumbnail image
    url: string;
    width?: number;
    height?: number;
  };
  image?: {                     // Main image
    url: string;
    width?: number;
    height?: number;
  };
  author?: {                    // Embed author
    name: string;
    url?: string;
    iconUrl?: string;
  };
  fields: {                     // Embed fields
    name: string;
    value: string;
    inline: boolean;
  }[];
  footer?: {                    // Embed footer
    text: string;
    iconUrl?: string;
  };
}

interface MessageReaction {
  emoji: string;                // Reaction emoji
  count: number;                // Reaction count
  users: ObjectId[];            // Users who reacted
  me: boolean;                  // Current user reacted
}
```

**Indexes**:
```javascript
db.messages.createIndex({ "id": 1 }, { unique: true });
db.messages.createIndex({ "channelId": 1, "createdAt": -1 });
db.messages.createIndex({ "revoltId": 1, "createdAt": -1 });
db.messages.createIndex({ "authorId": 1 });
db.messages.createIndex({ "createdAt": -1 });
db.messages.createIndex({ "isDeleted": 1 });
db.messages.createIndex({ "pinned": 1 });
db.messages.createIndex({ "mentions": 1 });
```

### 5. VoiceSessions Collection

**Purpose**: Track voice and video channel sessions.

```typescript
interface VoiceSession {
  _id: ObjectId;
  id: string;                   // Session ID
  revoltId: ObjectId;           // Revolt ID
  channelId: ObjectId;          // Voice channel ID
  participants: VoiceParticipant[]; // Session participants
  settings: VoiceSettings;      // Voice settings
  startedAt: Date;              // Session start time
  endedAt?: Date;               // Session end time
  isActive: boolean;            // Active session flag
}

interface VoiceParticipant {
  userId: ObjectId;             // User ID
  username: string;             // Username
  isMuted: boolean;             // Mute status
  isDeafened: boolean;          // Deafen status
  isSpeaking: boolean;          // Speaking status
  isVideoEnabled: boolean;      // Video enabled
  isScreenSharing: boolean;     // Screen sharing
  joinedAt: Date;               // Join timestamp
  leftAt?: Date;                // Leave timestamp
  streamId?: string;            // WebRTC stream ID
}

interface VoiceSettings {
  maxParticipants: number;      // Max participants
  bitrate: number;              // Audio bitrate
  sampleRate: number;           // Audio sample rate
  region: string;               // Voice region
  echoCancellation: boolean;    // Echo cancellation
  noiseSuppression: boolean;    // Noise suppression
  autoGainControl: boolean;     // Auto gain control
}
```

**Indexes**:
```javascript
db.voiceSessions.createIndex({ "id": 1 }, { unique: true });
db.voiceSessions.createIndex({ "revoltId": 1 });
db.voiceSessions.createIndex({ "channelId": 1 });
db.voiceSessions.createIndex({ "isActive": 1 });
db.voiceSessions.createIndex({ "participants.userId": 1 });
db.voiceSessions.createIndex({ "startedAt": -1 });
```

### 6. Donations Collection

**Purpose**: Track donations to Revolts and funding progress.

```typescript
interface Donation {
  _id: ObjectId;
  id: string;                   // Unique donation identifier
  amount: number;               // Donation amount (cents)
  donor: DonorInfo;             // Donor information
  revolt: RevoltInfo;           // Revolt information
  message?: string;             // Donor message
  isAnonymous: boolean;         // Anonymous donation flag
  status: 'pending' | 'completed' | 'failed' | 'refunded'; // Payment status
  stripePaymentIntentId: string; // Stripe payment intent ID
  createdAt: Date;              // Donation timestamp
  completedAt?: Date;           // Completion timestamp
}

interface DonorInfo {
  userId?: ObjectId;            // User ID (if not anonymous)
  email: string;                // Donor email
  name?: string;                // Donor name
  isAnonymous: boolean;         // Anonymous flag
}

interface RevoltInfo {
  revoltId: ObjectId;           // Revolt ID
  name: string;                 // Revolt name
  icon?: string;                // Revolt icon
}
```

**Indexes**:
```javascript
db.donations.createIndex({ "id": 1 }, { unique: true });
db.donations.createIndex({ "revolt.revoltId": 1 });
db.donations.createIndex({ "donor.userId": 1 });
db.donations.createIndex({ "createdAt": -1 });
db.donations.createIndex({ "status": 1 });
db.donations.createIndex({ "stripePaymentIntentId": 1 });
```

### 7. Letters Collection

**Purpose**: Store Anthony Letters content and progression data.

```typescript
interface Letter {
  _id: ObjectId;
  id: number;                   // Letter number (1-30)
  title: string;                // Letter title
  content: string;              // Full letter content
  book: 'awakening' | 'foundation' | 'arsenal' | 'revolution';
  order: number;                // Order within book
  assignments: Assignment[];     // Letter assignments
  prerequisites: number[];      // Required previous letters
  unlocks: string[];            // Features unlocked by this letter
  estimatedReadTime: number;    // Estimated reading time (minutes)
  isUnlocked: boolean;         // Unlock status
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
}
```

**Indexes**:
```javascript
db.letters.createIndex({ "id": 1 }, { unique: true });
db.letters.createIndex({ "book": 1, "order": 1 });
db.letters.createIndex({ "isUnlocked": 1 });
```

### 8. Notifications Collection

**Purpose**: Store user notifications and system alerts.

```typescript
interface Notification {
  _id: ObjectId;
  id: string;                   // Unique notification identifier
  type: NotificationType;       // Notification type
  title: string;                // Notification title
  message: string;              // Notification message
  userId: ObjectId;             // Target user ID
  revoltId?: ObjectId;          // Related revolt ID
  channelId?: ObjectId;         // Related channel ID
  messageId?: string;           // Related message ID
  isRead: boolean;              // Read status
  readAt?: Date;                // Read timestamp
  actionUrl?: string;           // Action URL
  createdAt: Date;              // Creation timestamp
}

type NotificationType = 
  | 'revolt_invite'
  | 'revolt_join'
  | 'revolt_leave'
  | 'channel_mention'
  | 'message_reply'
  | 'voice_invite'
  | 'donation_received'
  | 'letter_completed'
  | 'achievement_unlocked'
  | 'system_announcement';
```

**Indexes**:
```javascript
db.notifications.createIndex({ "userId": 1, "createdAt": -1 });
db.notifications.createIndex({ "isRead": 1 });
db.notifications.createIndex({ "type": 1 });
db.notifications.createIndex({ "revoltId": 1 });
```

## 🔗 Data Relationships

### Primary Relationships

```
Users (1) ──→ (Many) RevoltMembers
├── Users join revolts
├── Users can be members of multiple revolts
└── Users have roles within revolts

Revolts (1) ──→ (Many) Channels
├── Revolts contain channels
├── Revolts can have multiple channels
└── Channels belong to one revolt

Channels (1) ──→ (Many) Messages
├── Channels contain messages
├── Channels can have many messages
└── Messages belong to one channel

Users (1) ──→ (Many) Messages
├── Users send messages
├── Users can send many messages
└── Messages have one author

Revolts (1) ──→ (Many) Donations
├── Revolts receive donations
├── Revolts can have many donations
└── Donations go to one revolt

Users (1) ──→ (Many) Donations
├── Users make donations
├── Users can make many donations
└── Donations have one donor
```

### Secondary Relationships

```
Revolts (1) ──→ (Many) VoiceSessions
├── Revolts host voice sessions
├── Revolts can have many sessions
└── Sessions belong to one revolt

Users (1) ──→ (Many) VoiceParticipants
├── Users participate in voice
├── Users can be in many sessions
└── Participants represent one user

Users (1) ──→ (Many) Notifications
├── Users receive notifications
├── Users can have many notifications
└── Notifications target one user

Letters (Many) ──→ (Many) Users
├── Users progress through letters
├── Letters unlock features for users
└── Users track letter completion
```

## 📊 Data Models

### LetterProgress Model

```typescript
interface LetterProgress {
  completedLetters: number[];   // Array of completed letter IDs
  currentLetter: number;        // Current letter being worked on
  totalLetters: number;         // Total number of letters (30)
  completedAt?: Date;           // Completion timestamp
  assignments: AssignmentProgress[]; // Assignment progress
  lastAccessed: Date;           // Last access timestamp
}
```

### UserStats Model

```typescript
interface UserStats {
  revoltsJoined: number;        // Number of revolts joined
  revoltsCreated: number;       // Number of revolts created
  messagesSent: number;         // Total messages sent
  totalDonated: number;         // Total amount donated (cents)
  totalRaised: number;          // Total amount raised (cents)
  voiceTime: number;            // Time in voice channels (minutes)
  screenShareTime: number;      // Screen share time (minutes)
  followers: number;            // Number of followers
  following: number;            // Number of users following
  reputation: number;           // User reputation score
  lastActive: Date;             // Last activity timestamp
}
```

### Achievement Model

```typescript
interface Achievement {
  id: string;                   // Unique achievement identifier
  name: string;                 // Achievement name
  description: string;           // Achievement description
  icon: string;                 // Achievement icon
  category: 'participation' | 'leadership' | 'fundraising' | 'education' | 'voice' | 'social';
  requirements: {               // Achievement requirements
    type: string;               // Requirement type
    value: number;              // Required value
    description: string;        // Requirement description
  }[];
  unlockedAt: Date;            // Unlock timestamp
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}
```

### RevoltMembership Model

```typescript
interface RevoltMembership {
  revoltId: ObjectId;           // Revolt ID
  revoltName: string;           // Revolt name
  joinedAt: Date;               // Join timestamp
  roles: string[];              // Role IDs
  permissions: string[];        // Direct permissions
  isOwner: boolean;             // Owner status
  lastSeen: Date;               // Last activity
  messageCount: number;         // Messages sent
  voiceTime: number;            // Voice time (minutes)
}
```

## 🔍 Query Patterns

### Common Queries

#### 1. User Authentication
```javascript
// Find user by email
db.users.findOne({ email: "user@example.com" });

// Find user by username and discriminator
db.users.findOne({ 
  username: "username", 
  discriminator: "1234" 
});

// Find user by ID
db.users.findOne({ id: "user123" });
```

#### 2. Revolt Discovery
```javascript
// Get public revolts
db.revolts.find({ "settings.isPublic": true }).sort({ "stats.memberCount": -1 });

// Get user's revolts
db.revolts.find({ "members.userId": ObjectId("user123") });

// Search revolts
db.revolts.find({
  $or: [
    { name: { $regex: "search term", $options: "i" } },
    { description: { $regex: "search term", $options: "i" } }
  ],
  "settings.isPublic": true
});
```

#### 3. Channel Messages
```javascript
// Get channel messages (paginated)
db.messages.find({ 
  channelId: ObjectId("channel123"),
  isDeleted: false 
}).sort({ createdAt: -1 }).limit(50);

// Get recent messages
db.messages.find({ 
  revoltId: ObjectId("revolt123"),
  createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
}).sort({ createdAt: -1 });
```

#### 4. Voice Sessions
```javascript
// Get active voice sessions
db.voiceSessions.find({ isActive: true });

// Get user's voice sessions
db.voiceSessions.find({ 
  "participants.userId": ObjectId("user123"),
  isActive: true 
});
```

#### 5. Donation Tracking
```javascript
// Get revolt donations
db.donations.find({ "revolt.revoltId": ObjectId("revolt123") }).sort({ createdAt: -1 });

// Get user donations
db.donations.find({ "donor.userId": ObjectId("user123") });

// Get donation statistics
db.donations.aggregate([
  { $match: { "revolt.revoltId": ObjectId("revolt123") } },
  { $group: { 
    _id: null, 
    total: { $sum: "$amount" }, 
    count: { $sum: 1 },
    average: { $avg: "$amount" }
  }}
]);
```

## 🚀 Performance Optimization

### Indexing Strategy

#### 1. Compound Indexes
```javascript
// Revolt discovery
db.revolts.createIndex({ 
  "settings.isPublic": 1, 
  "stats.memberCount": -1 
});

// Channel messages
db.messages.createIndex({ 
  "channelId": 1, 
  "createdAt": -1 
});

// User activity
db.users.createIndex({ 
  "status": 1, 
  "lastSeen": -1 
});
```

#### 2. Text Indexes
```javascript
// Revolt search
db.revolts.createIndex({ 
  "name": "text", 
  "description": "text" 
});

// Message search
db.messages.createIndex({ 
  "content": "text" 
});
```

#### 3. Sparse Indexes
```javascript
// Optional fields
db.users.createIndex({ "customStatus": 1 }, { sparse: true });
db.revolts.createIndex({ "banner": 1 }, { sparse: true });
```

### Aggregation Pipelines

#### 1. Revolt Statistics
```javascript
db.revolts.aggregate([
  { $match: { "settings.isPublic": true } },
  { $group: {
    _id: null,
    totalRevolts: { $sum: 1 },
    totalMembers: { $sum: "$stats.memberCount" },
    avgMembers: { $avg: "$stats.memberCount" },
    totalDonations: { $sum: "$stats.totalDonations" }
  }}
]);
```

#### 2. User Activity
```javascript
db.users.aggregate([
  { $lookup: {
    from: "revolts",
    localField: "id",
    foreignField: "members.userId",
    as: "joinedRevolts"
  }},
  { $lookup: {
    from: "messages",
    localField: "id",
    foreignField: "authorId",
    as: "messages"
  }},
  { $project: {
    username: 1,
    userType: 1,
    joinedAt: 1,
    revoltsJoined: { $size: "$joinedRevolts" },
    messagesSent: { $size: "$messages" },
    lastSeen: 1
  }}
]);
```

## 🔒 Data Security

### Access Control

#### 1. User Data Protection
- Encrypt sensitive user information
- Hash passwords securely
- Secure API endpoints with authentication
- Implement rate limiting
- Protect voice/video data

#### 2. Revolt Data Security
- Validate revolt ownership
- Secure donation processing
- Protect financial information
- Audit trail for all transactions
- Role-based permissions

#### 3. Message Security
- Validate message authorship
- Implement message moderation
- Secure real-time communication
- Protect user privacy
- Content filtering

### Data Validation

#### 1. Schema Validation
```javascript
// User validation
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1, "discriminator": 1 }, { unique: true });

// Revolt validation
db.revolts.createIndex({ "id": 1 }, { unique: true });
db.revolts.createIndex({ "inviteCode": 1 }, { unique: true });
```

#### 2. Input Sanitization
- Validate all user inputs
- Sanitize HTML content
- Prevent injection attacks
- Validate file uploads
- Content moderation

## 📈 Analytics and Reporting

### Key Metrics

#### 1. User Engagement
- Letter completion rates
- Revolt participation
- Message activity
- Voice channel usage
- Donation frequency

#### 2. Revolt Performance
- Member growth rates
- Message activity
- Voice channel usage
- Donation success
- User retention

#### 3. Financial Metrics
- Total donations processed
- Average donation amounts
- Revolt funding success
- Revenue tracking
- Payment processing

### Reporting Queries

#### 1. User Activity Report
```javascript
db.users.aggregate([
  { $lookup: {
    from: "donations",
    localField: "id",
    foreignField: "donor.userId",
    as: "donations"
  }},
  { $lookup: {
    from: "messages",
    localField: "id",
    foreignField: "authorId",
    as: "messages"
  }},
  { $project: {
    username: 1,
    userType: 1,
    joinedAt: 1,
    totalDonated: { $sum: "$donations.amount" },
    donationCount: { $size: "$donations" },
    messageCount: { $size: "$messages" },
    lastSeen: 1
  }}
]);
```

#### 2. Revolt Success Report
```javascript
db.revolts.aggregate([
  { $group: {
    _id: "$settings.isPublic",
    count: { $sum: 1 },
    avgMembers: { $avg: "$stats.memberCount" },
    totalMembers: { $sum: "$stats.memberCount" },
    totalDonations: { $sum: "$stats.totalDonations" }
  }}
]);
```

This database schema provides a robust foundation for the Revolution Network platform with Discord-like functionality, ensuring data integrity, performance, and scalability while supporting real-time communication, voice/video features, and the educational system.