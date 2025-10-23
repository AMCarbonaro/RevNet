# Database Schema Documentation

## Overview

Revolution Network uses MongoDB as its primary database, with a document-based schema designed for flexibility and scalability. The database stores user data, project information, Anthony Letters content, donations, chat messages, and system notifications.

## 🗄️ Database Collections

### 1. Users Collection

**Purpose**: Store user profiles, authentication data, and progression tracking.

```typescript
interface User {
  _id: ObjectId;
  id: string;                    // Unique user identifier
  name: string;                  // Display name
  email: string;                 // Email address
  image?: string;                // Profile image URL
  bio?: string;                  // User biography
  location?: string;             // User location
  website?: string;              // Personal website
  twitter?: string;              // Twitter handle
  userType: 'creator' | 'supporter'; // User role
  joinedAt: Date;                // Account creation date
  isVerified: boolean;           // Account verification status
  letterProgress: LetterProgress; // Anthony Letters progression
  achievements: Achievement[];   // Unlocked achievements
  stats: UserStats;             // User statistics
  organizationName?: string;    // Organization name (creators)
  socialLinks?: {               // Social media links
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  };
  supportedProjects?: string[]; // Project IDs user has supported
  totalContributed?: number;    // Total amount contributed
}
```

**Indexes**:
```javascript
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "id": 1 }, { unique: true });
db.users.createIndex({ "userType": 1 });
db.users.createIndex({ "joinedAt": -1 });
```

### 2. Projects Collection

**Purpose**: Store revolutionary project information, funding data, and team details.

```typescript
interface Project {
  _id: ObjectId;
  id: string;                    // Unique project identifier
  title: string;                 // Project title
  description: string;           // Full project description
  shortDescription: string;      // Brief description for cards
  category: ProjectCategory;     // Project type
  status: ProjectStatus;         // Current project status
  fundingGoal: number;          // Target funding amount (cents)
  currentFunding: number;        // Current funding amount (cents)
  backers: number;              // Number of backers
  creator: User;                 // Project creator
  organization?: Organization;   // Associated organization
  images: string[];             // Project images
  tags: string[];               // Project tags
  location?: {                  // Project location
    city: string;
    state: string;
    country: string;
  };
  timeline: {                   // Project timeline
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
  };
  roles: ProjectRole[];         // Available roles
  updates: ProjectUpdate[];    // Project updates
  chat: ChatMessage[];         // Project chat messages
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
  isFECCompliant: boolean;      // FEC compliance status
  fecThresholdReached: boolean; // FEC threshold status
}
```

**Indexes**:
```javascript
db.projects.createIndex({ "status": 1 });
db.projects.createIndex({ "category": 1 });
db.projects.createIndex({ "createdAt": -1 });
db.projects.createIndex({ "fundingGoal": 1 });
db.projects.createIndex({ "creator.id": 1 });
db.projects.createIndex({ "tags": 1 });
```

### 3. Letters Collection

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
}
```

**Indexes**:
```javascript
db.letters.createIndex({ "id": 1 }, { unique: true });
db.letters.createIndex({ "book": 1, "order": 1 });
db.letters.createIndex({ "isUnlocked": 1 });
```

### 4. Donations Collection

**Purpose**: Track all donations and payment information.

```typescript
interface Donation {
  _id: ObjectId;
  id: string;                   // Unique donation identifier
  amount: number;               // Donation amount (cents)
  donor: User;                  // Donor information
  project: Project;             // Project being funded
  message?: string;             // Donor message
  isAnonymous: boolean;         // Anonymous donation flag
  createdAt: Date;              // Donation timestamp
  stripePaymentIntentId: string; // Stripe payment intent ID
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}
```

**Indexes**:
```javascript
db.donations.createIndex({ "project.id": 1 });
db.donations.createIndex({ "donor.id": 1 });
db.donations.createIndex({ "createdAt": -1 });
db.donations.createIndex({ "status": 1 });
db.donations.createIndex({ "stripePaymentIntentId": 1 });
```

### 5. Organizations Collection

**Purpose**: Store organization information for group projects.

```typescript
interface Organization {
  _id: ObjectId;
  id: string;                   // Unique organization identifier
  name: string;                 // Organization name
  description: string;         // Organization description
  logo?: string;               // Organization logo URL
  website?: string;             // Organization website
  socialMedia: {               // Social media links
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  members: OrganizationMember[]; // Organization members
  projects: Project[];          // Organization projects
  createdAt: Date;              // Creation timestamp
  isVerified: boolean;         // Verification status
  fecRegistered: boolean;      // FEC registration status
}
```

**Indexes**:
```javascript
db.organizations.createIndex({ "id": 1 }, { unique: true });
db.organizations.createIndex({ "name": 1 });
db.organizations.createIndex({ "isVerified": 1 });
db.organizations.createIndex({ "fecRegistered": 1 });
```

### 6. ChatMessages Collection

**Purpose**: Store real-time chat messages for projects and general chat.

```typescript
interface ChatMessage {
  _id: ObjectId;
  id: string;                   // Unique message identifier
  content: string;              // Message content
  author: User;                 // Message author
  projectId?: string;           // Associated project
  organizationId?: string;      // Associated organization
  createdAt: Date;              // Message timestamp
  editedAt?: Date;              // Edit timestamp
  isDeleted: boolean;           // Deletion status
  reactions: MessageReaction[]; // Message reactions
  replies: ChatMessage[];       // Message replies
  parentId?: string;            // Parent message ID
}
```

**Indexes**:
```javascript
db.chatMessages.createIndex({ "projectId": 1, "createdAt": -1 });
db.chatMessages.createIndex({ "organizationId": 1, "createdAt": -1 });
db.chatMessages.createIndex({ "author.id": 1 });
db.chatMessages.createIndex({ "parentId": 1 });
```

### 7. FeedPosts Collection

**Purpose**: Store activity feed posts and community updates.

```typescript
interface FeedPost {
  _id: ObjectId;
  id: string;                   // Unique post identifier
  type: 'project_update' | 'project_created' | 'project_funded' | 'user_joined' | 'achievement';
  content: string;               // Post content
  author: User;                 // Post author
  project?: Project;            // Associated project
  organization?: Organization;  // Associated organization
  images?: string[];           // Post images
  createdAt: Date;              // Post timestamp
  likes: number;                // Like count
  comments: number;             // Comment count
  shares: number;               // Share count
  isLiked: boolean;             // Current user like status
}
```

**Indexes**:
```javascript
db.feedPosts.createIndex({ "createdAt": -1 });
db.feedPosts.createIndex({ "author.id": 1 });
db.feedPosts.createIndex({ "type": 1 });
db.feedPosts.createIndex({ "project.id": 1 });
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
  user: User;                   // Target user
  relatedEntity?: {             // Related entity
    type: 'project' | 'organization' | 'user';
    id: string;
  };
  isRead: boolean;              // Read status
  createdAt: Date;              // Creation timestamp
  actionUrl?: string;           // Action URL
}
```

**Indexes**:
```javascript
db.notifications.createIndex({ "user.id": 1, "createdAt": -1 });
db.notifications.createIndex({ "isRead": 1 });
db.notifications.createIndex({ "type": 1 });
```

## 🔗 Data Relationships

### Primary Relationships

```
Users (1) ──→ (Many) Projects
├── Users create projects
├── Users can be project creators
└── Users can support multiple projects

Users (1) ──→ (Many) Donations
├── Users make donations
├── Users can donate to multiple projects
└── Users can make multiple donations

Projects (1) ──→ (Many) Donations
├── Projects receive donations
├── Projects can have multiple donors
└── Projects track total funding

Projects (1) ──→ (Many) ChatMessages
├── Projects have chat rooms
├── Projects can have multiple messages
└── Projects track conversation history

Users (1) ──→ (Many) ChatMessages
├── Users send messages
├── Users can participate in multiple chats
└── Users track message history

Users (1) ──→ (Many) FeedPosts
├── Users create posts
├── Users can post multiple updates
└── Users track activity history

Users (1) ──→ (Many) Notifications
├── Users receive notifications
├── Users can have multiple notifications
└── Users track notification status
```

### Secondary Relationships

```
Organizations (1) ──→ (Many) Projects
├── Organizations can create projects
├── Organizations can have multiple projects
└── Organizations track project portfolio

Organizations (1) ──→ (Many) Users
├── Organizations have members
├── Organizations can have multiple members
└── Organizations track membership

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
}
```

### UserStats Model

```typescript
interface UserStats {
  projectsJoined: number;       // Number of projects joined
  projectsCreated: number;      // Number of projects created
  totalDonated: number;         // Total amount donated (cents)
  totalRaised: number;          // Total amount raised (cents)
  followers: number;            // Number of followers
  following: number;            // Number of users following
  reputation: number;           // User reputation score
}
```

### Achievement Model

```typescript
interface Achievement {
  id: string;                   // Unique achievement identifier
  name: string;                 // Achievement name
  description: string;           // Achievement description
  icon: string;                 // Achievement icon
  unlockedAt: Date;            // Unlock timestamp
  category: 'participation' | 'leadership' | 'fundraising' | 'education';
}
```

### ProjectRole Model

```typescript
interface ProjectRole {
  id: string;                   // Unique role identifier
  title: string;                // Role title
  description: string;          // Role description
  requirements: string[];       // Role requirements
  filled: boolean;              // Role fill status
  assignedUser?: User;          // Assigned user
  createdAt: Date;              // Creation timestamp
}
```

### Milestone Model

```typescript
interface Milestone {
  id: string;                   // Unique milestone identifier
  title: string;                // Milestone title
  description: string;          // Milestone description
  targetDate: Date;             // Target completion date
  completed: boolean;           // Completion status
  completedAt?: Date;           // Completion timestamp
}
```

### MessageReaction Model

```typescript
interface MessageReaction {
  emoji: string;                 // Reaction emoji
  users: User[];                // Users who reacted
  count: number;                 // Reaction count
}
```

## 🔍 Query Patterns

### Common Queries

#### 1. User Authentication
```javascript
// Find user by email
db.users.findOne({ email: "user@example.com" });

// Find user by ID
db.users.findOne({ id: "user123" });
```

#### 2. Project Discovery
```javascript
// Get active projects
db.projects.find({ status: "active" }).sort({ createdAt: -1 });

// Get projects by category
db.projects.find({ category: "mural" });

// Search projects
db.projects.find({
  $or: [
    { title: { $regex: "search term", $options: "i" } },
    { description: { $regex: "search term", $options: "i" } }
  ]
});
```

#### 3. Donation Tracking
```javascript
// Get project donations
db.donations.find({ "project.id": "project123" }).sort({ createdAt: -1 });

// Get user donations
db.donations.find({ "donor.id": "user123" });

// Get donation statistics
db.donations.aggregate([
  { $match: { "project.id": "project123" } },
  { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
]);
```

#### 4. Chat Messages
```javascript
// Get project chat messages
db.chatMessages.find({ projectId: "project123" }).sort({ createdAt: 1 });

// Get recent messages
db.chatMessages.find({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } });
```

#### 5. User Progress
```javascript
// Get user letter progress
db.users.findOne({ id: "user123" }, { letterProgress: 1 });

// Get users by letter completion
db.users.find({ "letterProgress.completedLetters": { $size: 30 } });
```

## 🚀 Performance Optimization

### Indexing Strategy

#### 1. Compound Indexes
```javascript
// User activity queries
db.users.createIndex({ "userType": 1, "joinedAt": -1 });

// Project discovery
db.projects.createIndex({ "status": 1, "category": 1, "createdAt": -1 });

// Chat messages
db.chatMessages.createIndex({ "projectId": 1, "createdAt": -1 });
```

#### 2. Text Indexes
```javascript
// Project search
db.projects.createIndex({ 
  "title": "text", 
  "description": "text", 
  "tags": "text" 
});
```

#### 3. Sparse Indexes
```javascript
// Optional fields
db.users.createIndex({ "organizationName": 1 }, { sparse: true });
db.projects.createIndex({ "location.state": 1 }, { sparse: true });
```

### Aggregation Pipelines

#### 1. Project Statistics
```javascript
db.projects.aggregate([
  { $match: { status: "active" } },
  { $group: {
    _id: "$category",
    count: { $sum: 1 },
    totalFunding: { $sum: "$currentFunding" },
    avgFunding: { $avg: "$currentFunding" }
  }}
]);
```

#### 2. User Statistics
```javascript
db.users.aggregate([
  { $lookup: {
    from: "projects",
    localField: "id",
    foreignField: "creator.id",
    as: "createdProjects"
  }},
  { $lookup: {
    from: "donations",
    localField: "id",
    foreignField: "donor.id",
    as: "donations"
  }},
  { $project: {
    name: 1,
    projectsCreated: { $size: "$createdProjects" },
    totalDonated: { $sum: "$donations.amount" }
  }}
]);
```

## 🔒 Data Security

### Access Control

#### 1. User Data Protection
- Encrypt sensitive user information
- Hash passwords (handled by NextAuth)
- Secure API endpoints with authentication
- Implement rate limiting

#### 2. Project Data Security
- Validate project ownership
- Secure donation processing
- Protect financial information
- Audit trail for all transactions

#### 3. Chat Message Security
- Validate message authorship
- Implement message moderation
- Secure real-time communication
- Protect user privacy

### Data Validation

#### 1. Schema Validation
```javascript
// User validation
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "id": 1 }, { unique: true });

// Project validation
db.projects.createIndex({ "id": 1 }, { unique: true });
db.projects.createIndex({ "creator.id": 1 });
```

#### 2. Input Sanitization
- Validate all user inputs
- Sanitize HTML content
- Prevent injection attacks
- Validate file uploads

## 📈 Analytics and Reporting

### Key Metrics

#### 1. User Engagement
- Letter completion rates
- Project participation
- Donation frequency
- Chat activity

#### 2. Project Performance
- Funding success rates
- Project completion rates
- User satisfaction
- Community growth

#### 3. Financial Metrics
- Total donations processed
- Average donation amounts
- FEC compliance rates
- Revenue tracking

### Reporting Queries

#### 1. User Activity Report
```javascript
db.users.aggregate([
  { $lookup: {
    from: "donations",
    localField: "id",
    foreignField: "donor.id",
    as: "donations"
  }},
  { $project: {
    name: 1,
    userType: 1,
    joinedAt: 1,
    totalDonated: { $sum: "$donations.amount" },
    donationCount: { $size: "$donations" }
  }}
]);
```

#### 2. Project Success Report
```javascript
db.projects.aggregate([
  { $group: {
    _id: "$status",
    count: { $sum: 1 },
    avgFunding: { $avg: "$currentFunding" },
    totalFunding: { $sum: "$currentFunding" }
  }}
]);
```

This database schema provides a robust foundation for the Revolution Network platform, ensuring data integrity, performance, and scalability while supporting the complex relationships between users, projects, and the educational system.
