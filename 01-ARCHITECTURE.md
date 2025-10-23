# Architecture Documentation

## Overview

Revolution Network is built on Next.js 15 with the App Router, featuring a modular architecture designed for scalability, maintainability, and real-time collaboration. The platform follows a component-based architecture with clear separation of concerns.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                    │
├─────────────────────────────────────────────────────────────┤
│  Terminal Interface  │  Dashboard  │  Letters  │  Projects │
├─────────────────────────────────────────────────────────────┤
│              Component Library & State Management           │
├─────────────────────────────────────────────────────────────┤
│  API Routes  │  Authentication  │  Real-time  │  Payments  │
├─────────────────────────────────────────────────────────────┤
│                    Backend Services                        │
├─────────────────────────────────────────────────────────────┤
│  MongoDB  │  Stripe  │  Socket.IO  │  NextAuth  │  FEC API  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── donations/     # Donation management
│   │   ├── fec-compliance/ # FEC monitoring
│   │   ├── feed/          # Activity feed
│   │   ├── letters/       # Anthony Letters API
│   │   ├── notifications/ # Notification system
│   │   ├── projects/      # Project management
│   │   ├── stripe/        # Payment processing
│   │   └── user/          # User management
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat interface
│   ├── create/            # Project creation
│   ├── letters/           # Anthony Letters interface
│   ├── projects/          # Project pages
│   └── users/             # User profiles
├── components/            # React components
│   ├── ai/               # AI chat components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat system
│   ├── dashboard/        # Dashboard components
│   ├── effects/          # Visual effects
│   ├── layout/           # Layout components
│   ├── payment/          # Payment components
│   ├── terminal/         # Terminal interface
│   ├── ui/               # Reusable UI components
│   └── widgets/          # Dashboard widgets
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript definitions
├── data/                 # Static data
└── styles/               # Global styles
```

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── Providers (Auth, Socket, App Store)
├── Layout
│   ├── Navigation
│   ├── Terminal Interface (First Visit)
│   └── Dashboard (After Terminal)
│       ├── Letters Section
│       ├── Project Hub
│       ├── Activity Feed
│       └── Chat Widgets
└── Pages
    ├── Letters
    ├── Projects
    ├── Chat
    └── User Profiles
```

### Component Categories

#### 1. Terminal Components
- **TerminalInterface** - Main terminal experience
- **TerminalInput** - User input handling
- **TerminalCursor** - Blinking cursor animation
- **MatrixRain** - Background matrix effect

#### 2. Dashboard Components
- **Dashboard** - Main dashboard container
- **Navigation** - Top navigation bar
- **LettersSection** - Anthony Letters progress
- **ProjectHub** - Project management
- **Feed** - Activity feed
- **PrototypeSelector** - Dashboard variants

#### 3. Effect Components
- **GlitchText** - Text glitch effects
- **HolographicCard** - 3D card effects
- **NeonButton** - Neon glow buttons
- **Scanlines** - CRT monitor effects
- **StatusIndicator** - System status display

#### 4. Widget Components
- **ActivityFeed** - Real-time activity updates
- **OnlineUsers** - User presence display
- **ProjectList** - Project listings
- **SystemStatus** - Platform health
- **UserStats** - User statistics

## 🔄 State Management

### Zustand Store Structure

```typescript
interface AppStore {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Projects state
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  // Feed state
  feed: FeedPost[];
  setFeed: (feed: FeedPost[]) => void;
  addFeedPost: (post: FeedPost) => void;
  
  // Notifications state
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Chat state
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  
  // Mobile state
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}
```

### Context Providers

#### 1. AuthContext
- User authentication state
- Session management
- OAuth provider integration
- Demo mode support

#### 2. SocketContext
- Real-time communication
- Chat room management
- User presence tracking
- Live updates

#### 3. ChatContext
- Chat message state
- Room management
- Message history
- Typing indicators

## 🔌 API Architecture

### Route Structure

```
/api/
├── auth/
│   └── [...nextauth]/     # NextAuth.js routes
├── donations/             # Donation management
├── fec-compliance/        # FEC monitoring
├── feed/                  # Activity feed
├── letters/               # Anthony Letters
├── notifications/         # Notification system
├── projects/              # Project management
│   └── [id]/             # Individual projects
├── stripe/
│   ├── create-payment-intent/ # Payment creation
│   └── webhook/          # Stripe webhooks
└── user/
    └── profile/           # User profiles
```

### API Design Patterns

#### 1. RESTful Endpoints
- **GET** - Retrieve resources
- **POST** - Create resources
- **PUT** - Update resources
- **DELETE** - Remove resources

#### 2. Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

#### 3. Error Handling
- Consistent error response format
- HTTP status code mapping
- Client-side error boundaries
- Server-side error logging

## 🗄️ Database Architecture

### MongoDB Collections

#### 1. Users Collection
```typescript
{
  _id: ObjectId,
  id: string,
  name: string,
  email: string,
  userType: 'creator' | 'supporter',
  letterProgress: LetterProgress,
  stats: UserStats,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Projects Collection
```typescript
{
  _id: ObjectId,
  id: string,
  title: string,
  description: string,
  category: ProjectCategory,
  status: ProjectStatus,
  fundingGoal: number,
  currentFunding: number,
  creator: User,
  timeline: ProjectTimeline,
  roles: ProjectRole[],
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Letters Collection
```typescript
{
  _id: ObjectId,
  id: number,
  title: string,
  content: string,
  book: 'awakening' | 'foundation' | 'arsenal' | 'revolution',
  order: number,
  assignments: Assignment[],
  prerequisites: number[],
  unlocks: string[],
  isUnlocked: boolean
}
```

### Database Relationships

```
Users (1) ──→ (Many) Projects
Users (1) ──→ (Many) Donations
Users (1) ──→ (Many) ChatMessages
Projects (1) ──→ (Many) Donations
Projects (1) ──→ (Many) ChatMessages
Projects (1) ──→ (Many) FeedPosts
```

## 🔄 Real-time Architecture

### Socket.IO Implementation

#### 1. Server Setup
```javascript
const io = new Server(server);

io.on('connection', (socket) => {
  // User joins room
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  
  // Send message
  socket.on('send-message', (data) => {
    socket.to(data.room).emit('receive-message', data);
  });
  
  // User presence
  socket.on('user-online', (userId) => {
    socket.broadcast.emit('user-status', { userId, status: 'online' });
  });
});
```

#### 2. Client Integration
```typescript
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

// Join chat room
socket.emit('join-room', projectId);

// Send message
socket.emit('send-message', {
  room: projectId,
  content: message,
  author: user
});

// Listen for messages
socket.on('receive-message', (message) => {
  setMessages(prev => [...prev, message]);
});
```

## 🎨 Styling Architecture

### Tailwind Configuration

#### 1. Color System
```javascript
colors: {
  primary: {
    bg: '#0a0a0a',      // Dark grey base
    dark: '#121212',    // Darker grey
    light: '#1a1a1a',   // Light grey
    panel: '#252525',   // Panel background
  },
  accent: {
    green: '#39FF14',    // Terminal green
    cyan: '#00DDEB',     // Cyan accent
    purple: '#8B5CF6',   // Purple accent
  },
  text: {
    light: '#E5E7EB',   // Off-white
    muted: '#9CA3AF',   // Muted text
    dark: '#6B7280',    // Darker grey text
  }
}
```

#### 2. Typography System
```javascript
fontFamily: {
  mono: ['Fira Code', 'monospace'],
  sans: ['Inter', 'sans-serif'],
}
```

#### 3. Animation System
```javascript
animation: {
  'glitch': 'glitch 0.3s ease-in-out',
  'typing': 'typing 2s steps(40, end)',
  'blink': 'blink 1s infinite',
  'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
  'matrix-rain': 'matrix-rain 20s linear infinite',
}
```

## 🔒 Security Architecture

### Authentication Flow

1. **OAuth Providers** - Google, GitHub, Discord
2. **NextAuth.js** - Session management
3. **JWT Tokens** - Secure authentication
4. **Demo Mode** - Development authentication

### Data Protection

1. **MongoDB Security** - Encrypted connections
2. **Stripe PCI Compliance** - Secure payment processing
3. **Environment Variables** - Secret management
4. **CORS Configuration** - Cross-origin security

### FEC Compliance

1. **Threshold Monitoring** - Automatic alerts
2. **Legal Resources** - Built-in guidance
3. **Audit Trails** - Complete donation tracking
4. **Registration Help** - Political committee formation

## 📱 Mobile Architecture

### Responsive Design

#### 1. Mobile-First Approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces
- Optimized for mobile performance

#### 2. Terminal Mobile Experience
- Full-screen terminal interface
- Prevent zoom and scrolling
- Touch-optimized input
- Mobile-specific animations

#### 3. Dashboard Mobile Layout
- Collapsible navigation
- Stacked widget layout
- Touch-friendly buttons
- Swipe gestures

## 🚀 Performance Architecture

### Optimization Strategies

#### 1. Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports

#### 2. Caching
- API response caching
- Static asset caching
- Database query optimization

#### 3. Real-time Optimization
- Socket.IO connection pooling
- Message batching
- Presence optimization

## 🔧 Development Architecture

### Development Tools

#### 1. TypeScript Configuration
- Strict type checking
- Path mapping
- Module resolution
- Compiler options

#### 2. ESLint Configuration
- Next.js specific rules
- TypeScript integration
- Code quality enforcement

#### 3. Build Process
- Next.js build optimization
- Static generation
- Server-side rendering
- Image optimization

## 📊 Monitoring Architecture

### Application Monitoring

#### 1. Error Tracking
- Client-side error boundaries
- Server-side error logging
- API error tracking

#### 2. Performance Monitoring
- Core Web Vitals
- Bundle size analysis
- Database query performance

#### 3. User Analytics
- Feature usage tracking
- Conversion funnel analysis
- User engagement metrics

## 🔄 Deployment Architecture

### Production Setup

#### 1. Vercel Deployment
- Automatic deployments
- Environment variable management
- Domain configuration

#### 2. Database Setup
- MongoDB Atlas
- Connection pooling
- Backup strategies

#### 3. External Services
- Stripe webhook configuration
- OAuth provider setup
- Socket.IO server deployment

This architecture provides a solid foundation for the Revolution Network platform, ensuring scalability, maintainability, and real-time collaboration capabilities.
