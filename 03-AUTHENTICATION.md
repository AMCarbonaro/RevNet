# Authentication System Documentation

## Overview

Revolution Network uses NextAuth.js for authentication, supporting multiple OAuth providers and a demo mode for development. The system handles user registration, session management, and role-based access control for creators and supporters.

## 🔐 Authentication Architecture

### NextAuth.js Configuration

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userType = user.userType || 'supporter';
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as 'creator' | 'supporter';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow demo authentication for development
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

## 👥 User Types

### Creator
Users who create and manage revolutionary projects.

**Capabilities**:
- Create projects
- Manage project funding
- Assign team roles
- Update project status
- Access creator dashboard
- FEC compliance monitoring

**Required Information**:
- Name and email
- Organization name (optional)
- Bio and social links
- Location information

### Supporter
Users who support and participate in projects.

**Capabilities**:
- Join existing projects
- Make donations
- Participate in project chat
- Follow other users
- Access supporter dashboard
- Complete Anthony Letters

**Required Information**:
- Name and email
- Basic profile information
- Location (optional)

## 🔑 OAuth Providers

### Google OAuth Setup

1. **Google Cloud Console Configuration**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.com/api/auth/callback/google`

2. **Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### GitHub OAuth Setup

1. **GitHub OAuth App Configuration**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Set Authorization callback URL:
     - `http://localhost:3000/api/auth/callback/github`
     - `https://your-domain.com/api/auth/callback/github`

2. **Environment Variables**
   ```env
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

### Discord OAuth Setup

1. **Discord Application Configuration**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to OAuth2 section
   - Add redirect URI:
     - `http://localhost:3000/api/auth/callback/discord`
     - `https://your-domain.com/api/auth/callback/discord`

2. **Environment Variables**
   ```env
   DISCORD_CLIENT_ID=your-discord-client-id
   DISCORD_CLIENT_SECRET=your-discord-client-secret
   ```

## 🎭 Demo Authentication

### Development Mode

For development and testing, the platform includes a demo authentication system:

```typescript
// src/lib/auth.ts
export const demoAuth = {
  signIn: async (userType: 'creator' | 'supporter') => {
    const demoUser: User = {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@revolution.network',
      userType,
      joinedAt: new Date(),
      isVerified: false,
      letterProgress: {
        completedLetters: [],
        currentLetter: 1,
        totalLetters: 30,
        assignments: []
      },
      achievements: [],
      stats: {
        projectsJoined: 0,
        projectsCreated: 0,
        totalDonated: 0,
        totalRaised: 0,
        followers: 0,
        following: 0,
        reputation: 0
      }
    };
    
    return demoUser;
  }
};
```

### Demo User Features

- **No OAuth Required**: Skip provider setup for development
- **User Type Selection**: Choose between creator and supporter
- **Full Access**: Access all platform features
- **Persistent State**: Maintains session across page reloads
- **Development Friendly**: Easy testing and debugging

## 🔄 Session Management

### JWT Token Structure

```typescript
interface JWTPayload {
  sub: string;           // User ID
  name: string;          // User name
  email: string;         // User email
  picture?: string;      // User avatar
  userType: 'creator' | 'supporter';
  id: string;            // User ID
  iat: number;           // Issued at
  exp: number;           // Expires at
  jti: string;           // JWT ID
}
```

### Session Configuration

```typescript
// NextAuth session configuration
session: {
  strategy: 'jwt',        // Use JWT tokens
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60,   // Update every 24 hours
}
```

### Session Persistence

- **JWT Tokens**: Stateless authentication
- **Cookie Storage**: Secure HTTP-only cookies
- **Automatic Refresh**: Tokens refresh automatically
- **Cross-Tab Sync**: Session syncs across browser tabs

## 🛡️ Security Features

### Authentication Security

1. **OAuth Security**
   - Secure redirect URIs
   - State parameter validation
   - PKCE (Proof Key for Code Exchange)
   - Token exchange security

2. **Session Security**
   - HTTP-only cookies
   - Secure flag for HTTPS
   - SameSite protection
   - CSRF protection

3. **Data Protection**
   - Encrypted session data
   - Secure token storage
   - User data validation
   - Input sanitization

### Rate Limiting

```typescript
// API route rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};
```

## 🔐 User Registration Flow

### 1. OAuth Provider Selection

```typescript
// User selects authentication method
const signInMethods = [
  { provider: 'google', name: 'Google', icon: 'GoogleIcon' },
  { provider: 'github', name: 'GitHub', icon: 'GitHubIcon' },
  { provider: 'discord', name: 'Discord', icon: 'DiscordIcon' }
];
```

### 2. OAuth Callback Handling

```typescript
// NextAuth callback processing
async function handleOAuthCallback(profile, account) {
  // Extract user information
  const userData = {
    name: profile.name,
    email: profile.email,
    image: profile.picture,
    provider: account.provider,
    providerId: account.providerAccountId
  };
  
  // Create or update user
  const user = await createOrUpdateUser(userData);
  
  // Return user data
  return user;
}
```

### 3. User Type Selection

```typescript
// User type selection component
interface UserTypeSelectionProps {
  onSelect: (userType: 'creator' | 'supporter') => void;
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  return (
    <div className="user-type-selection">
      <h2>Choose Your Role</h2>
      <div className="role-options">
        <button onClick={() => onSelect('creator')}>
          <h3>Creator</h3>
          <p>Create and manage revolutionary projects</p>
        </button>
        <button onClick={() => onSelect('supporter')}>
          <h3>Supporter</h3>
          <p>Support and participate in projects</p>
        </button>
      </div>
    </div>
  );
}
```

## 👤 User Profile Management

### Profile Data Structure

```typescript
interface UserProfile {
  // Basic Information
  name: string;
  email: string;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  
  // User Type Specific
  userType: 'creator' | 'supporter';
  organizationName?: string; // For creators
  
  // Social Links
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  };
  
  // Progress Tracking
  letterProgress: LetterProgress;
  achievements: Achievement[];
  stats: UserStats;
}
```

### Profile Update API

```typescript
// API route: /api/user/profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const updates = {
      name: body.name,
      bio: body.bio,
      location: body.location,
      website: body.website,
      socialLinks: body.socialLinks,
      organizationName: body.organizationName
    };
    
    const updatedUser = await updateUser(session.user.id, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

## 🔒 Access Control

### Role-Based Permissions

```typescript
// Permission checking utility
export function hasPermission(user: User, permission: string): boolean {
  const permissions = {
    'creator': [
      'create_project',
      'manage_project',
      'assign_roles',
      'update_project',
      'delete_project',
      'view_analytics'
    ],
    'supporter': [
      'join_project',
      'donate',
      'participate_chat',
      'follow_users',
      'complete_letters'
    ]
  };
  
  return permissions[user.userType]?.includes(permission) || false;
}
```

### Route Protection

```typescript
// Protected route wrapper
export function withAuth(Component: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const { data: session, status } = useSession();
    
    if (status === 'loading') {
      return <LoadingSpinner />;
    }
    
    if (!session) {
      return <SignInPrompt />;
    }
    
    return <Component {...props} />;
  };
}
```

### API Route Protection

```typescript
// API route authentication middleware
export async function authenticateRequest(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}
```

## 🔄 Authentication States

### Loading States

```typescript
// Authentication status handling
const { data: session, status } = useSession();

if (status === 'loading') {
  return <LoadingSpinner />;
}

if (status === 'unauthenticated') {
  return <SignInPrompt />;
}

if (status === 'authenticated') {
  return <Dashboard user={session.user} />;
}
```

### Error Handling

```typescript
// Authentication error handling
const [authError, setAuthError] = useState<string | null>(null);

const handleSignIn = async (provider: string) => {
  try {
    await signIn(provider);
  } catch (error) {
    setAuthError('Authentication failed. Please try again.');
  }
};
```

## 🚀 Authentication Hooks

### Custom Authentication Hook

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Fetch additional user data
      fetchUserProfile(session.user.id)
        .then(setUser)
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [session, status]);
  
  return {
    user,
    session,
    loading,
    isAuthenticated: status === 'authenticated',
    isCreator: user?.userType === 'creator',
    isSupporter: user?.userType === 'supporter'
  };
}
```

### User Type Hook

```typescript
// User type specific hook
export function useUserType() {
  const { user } = useAuth();
  
  return {
    isCreator: user?.userType === 'creator',
    isSupporter: user?.userType === 'supporter',
    canCreateProjects: user?.userType === 'creator',
    canJoinProjects: true, // All users can join projects
    canDonate: true, // All users can donate
    canManageProjects: user?.userType === 'creator'
  };
}
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Database
MONGODB_URI=mongodb://localhost:27017/revolution-network
```

### Secret Generation

```bash
# Generate NextAuth secret
openssl rand -base64 32
```

## 🧪 Testing Authentication

### Unit Tests

```typescript
// Authentication utility tests
describe('Authentication', () => {
  test('should validate user permissions', () => {
    const creator = { userType: 'creator' } as User;
    const supporter = { userType: 'supporter' } as User;
    
    expect(hasPermission(creator, 'create_project')).toBe(true);
    expect(hasPermission(supporter, 'create_project')).toBe(false);
  });
  
  test('should handle demo authentication', () => {
    const demoUser = demoAuth.signIn('creator');
    expect(demoUser.userType).toBe('creator');
    expect(demoUser.id).toBe('demo-user');
  });
});
```

### Integration Tests

```typescript
// Authentication flow tests
describe('Authentication Flow', () => {
  test('should redirect to sign in when unauthenticated', async () => {
    const response = await fetch('/api/projects');
    expect(response.status).toBe(401);
  });
  
  test('should allow access when authenticated', async () => {
    const session = await createTestSession();
    const response = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    expect(response.status).toBe(200);
  });
});
```

## 🔄 Session Refresh

### Automatic Token Refresh

```typescript
// Token refresh handling
export function useSessionRefresh() {
  const { data: session, update } = useSession();
  
  useEffect(() => {
    if (session?.expires && new Date(session.expires) < new Date()) {
      update(); // Refresh the session
    }
  }, [session, update]);
}
```

### Manual Session Update

```typescript
// Update session after profile changes
const updateProfile = async (updates: Partial<User>) => {
  await updateUser(user.id, updates);
  await update(); // Refresh session with new data
};
```

This authentication system provides secure, flexible user management for the Revolution Network platform, supporting both OAuth providers and development-friendly demo authentication.
