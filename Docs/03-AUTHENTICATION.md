# Authentication System Documentation

## Overview

Revolution Network uses Angular's built-in authentication with JWT tokens, supporting multiple OAuth providers and a demo mode for development. The system handles user registration, session management, and role-based access control for Revolt (server) permissions and Discord-like features.

## 🔐 Authentication Architecture

### Angular Authentication Service

```typescript
// src/app/core/services/auth.service.ts
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('token');
    if (token && this.isTokenValid(token)) {
      this.tokenSubject.next(token);
      this.loadUserProfile();
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.http.post<AuthResponse>('/api/auth/login', credentials).toPromise();
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        this.tokenSubject.next(response.token);
        this.userSubject.next(response.user);
        
        // Update NgRx store
        this.store.dispatch(AuthActions.loginSuccess({ user: response.user }));
        
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    
    // Clear NgRx store
    this.store.dispatch(AuthActions.logout());
    
    this.router.navigate(['/login']);
  }

  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? this.isTokenValid(token) : false;
  }
}
```

### OAuth Integration

```typescript
// src/app/core/services/oauth.service.ts
@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  constructor(private http: HttpClient) {}

  async loginWithGoogle(): Promise<void> {
    window.location.href = '/api/auth/google';
  }

  async loginWithGitHub(): Promise<void> {
    window.location.href = '/api/auth/github';
  }

  async loginWithDiscord(): Promise<void> {
    window.location.href = '/api/auth/discord';
  }

  async handleOAuthCallback(code: string, provider: string): Promise<AuthResponse> {
    return this.http.post<AuthResponse>(`/api/auth/${provider}/callback`, { code }).toPromise();
  }
}
```

## 👥 User Types

### Creator
Users who create and manage Revolts (Discord-style servers).

**Capabilities**:
- Create Revolts
- Manage Revolt settings
- Assign roles and permissions
- Manage channels
- Access creator dashboard
- Invite members
- Moderate content

**Required Information**:
- Username and discriminator
- Email address
- Bio and social links
- Location information (optional)

### Supporter
Users who join and participate in Revolts.

**Capabilities**:
- Join existing Revolts
- Participate in channels
- Make donations
- Voice/video chat
- Complete Anthony Letters
- Follow other users

**Required Information**:
- Username and discriminator
- Email address
- Basic profile information

## 🔑 OAuth Providers

### Google OAuth Setup

1. **Google Cloud Console Configuration**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:4200/api/auth/callback/google`
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
     - `http://localhost:4200/api/auth/callback/github`
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
     - `http://localhost:4200/api/auth/callback/discord`
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
// src/app/core/services/demo-auth.service.ts
@Injectable({
  providedIn: 'root'
})
export class DemoAuthService {
  constructor(private authService: AuthService) {}

  async signInAsCreator(): Promise<void> {
    const demoUser: User = {
      id: 'demo-creator',
      username: 'DemoCreator',
      discriminator: '1234',
      email: 'creator@demo.revnet',
      userType: 'creator',
      status: 'online',
      joinedAt: new Date(),
      isVerified: false,
      letterProgress: {
        completedLetters: [1, 2, 3, 4, 5],
        currentLetter: 6,
        totalLetters: 30,
        assignments: []
      },
      achievements: [],
      stats: {
        revoltsJoined: 5,
        revoltsCreated: 2,
        messagesSent: 150,
        totalDonated: 5000,
        totalRaised: 15000,
        voiceTime: 120,
        screenShareTime: 30,
        followers: 25,
        following: 15,
        reputation: 100
      },
      revoltMemberships: []
    };
    
    await this.authService.setDemoUser(demoUser);
  }

  async signInAsSupporter(): Promise<void> {
    const demoUser: User = {
      id: 'demo-supporter',
      username: 'DemoSupporter',
      discriminator: '5678',
      email: 'supporter@demo.revnet',
      userType: 'supporter',
      status: 'online',
      joinedAt: new Date(),
      isVerified: false,
      letterProgress: {
        completedLetters: [1, 2, 3],
        currentLetter: 4,
        totalLetters: 30,
        assignments: []
      },
      achievements: [],
      stats: {
        revoltsJoined: 3,
        revoltsCreated: 0,
        messagesSent: 75,
        totalDonated: 2500,
        totalRaised: 0,
        voiceTime: 60,
        screenShareTime: 0,
        followers: 10,
        following: 20,
        reputation: 50
      },
      revoltMemberships: []
    };
    
    await this.authService.setDemoUser(demoUser);
  }
}
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
  username: string;      // Username
  discriminator: string; // 4-digit discriminator
  email: string;         // User email
  avatar?: string;       // User avatar
  userType: 'creator' | 'supporter';
  id: string;            // User ID
  iat: number;           // Issued at
  exp: number;           // Expires at
  jti: string;           // JWT ID
}
```

### Session Configuration

```typescript
// Angular HTTP interceptor for token management
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

### Session Persistence

- **JWT Tokens**: Stateless authentication
- **Local Storage**: Secure token storage
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
   - HTTP-only cookies (server-side)
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
// Angular service for rate limiting
@Injectable({
  providedIn: 'root'
})
export class RateLimitService {
  private requestCounts = new Map<string, number>();
  private readonly maxRequests = 100;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old entries
    for (const [key, timestamp] of this.requestCounts.entries()) {
      if (timestamp < windowStart) {
        this.requestCounts.delete(key);
      }
    }
    
    // Check current count
    const currentCount = Array.from(this.requestCounts.values())
      .filter(timestamp => timestamp >= windowStart).length;
    
    if (currentCount >= this.maxRequests) {
      return false;
    }
    
    this.requestCounts.set(identifier, now);
    return true;
  }
}
```

## 🔐 User Registration Flow

### 1. OAuth Provider Selection

```typescript
// Angular component for OAuth selection
@Component({
  selector: 'app-oauth-login',
  template: `
    <div class="oauth-login">
      <h2>Sign in to RevNet</h2>
      <div class="oauth-buttons">
        <button (click)="loginWithGoogle()" class="oauth-btn google">
          <i class="fab fa-google"></i>
          Continue with Google
        </button>
        <button (click)="loginWithGitHub()" class="oauth-btn github">
          <i class="fab fa-github"></i>
          Continue with GitHub
        </button>
        <button (click)="loginWithDiscord()" class="oauth-btn discord">
          <i class="fab fa-discord"></i>
          Continue with Discord
        </button>
      </div>
      <div class="demo-login" *ngIf="isDevelopment">
        <h3>Demo Mode</h3>
        <button (click)="demoAsCreator()">Demo as Creator</button>
        <button (click)="demoAsSupporter()">Demo as Supporter</button>
      </div>
    </div>
  `
})
export class OAuthLoginComponent {
  isDevelopment = environment.production === false;

  constructor(
    private oauthService: OAuthService,
    private demoAuthService: DemoAuthService
  ) {}

  loginWithGoogle(): void {
    this.oauthService.loginWithGoogle();
  }

  loginWithGitHub(): void {
    this.oauthService.loginWithGitHub();
  }

  loginWithDiscord(): void {
    this.oauthService.loginWithDiscord();
  }

  demoAsCreator(): void {
    this.demoAuthService.signInAsCreator();
  }

  demoAsSupporter(): void {
    this.demoAuthService.signInAsSupporter();
  }
}
```

### 2. OAuth Callback Handling

```typescript
// Angular component for OAuth callback
@Component({
  selector: 'app-oauth-callback',
  template: `
    <div class="callback-loading">
      <div class="spinner"></div>
      <p>Completing sign in...</p>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private oauthService: OAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    const provider = this.route.snapshot.queryParamMap.get('provider');
    
    if (code && provider) {
      try {
        const response = await this.oauthService.handleOAuthCallback(code, provider);
        await this.authService.handleOAuthResponse(response);
        this.router.navigate(['/discord']);
      } catch (error) {
        console.error('OAuth callback error:', error);
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
```

### 3. User Type Selection

```typescript
// Angular component for user type selection
@Component({
  selector: 'app-user-type-selection',
  template: `
    <div class="user-type-selection">
      <h2>Choose Your Role</h2>
      <div class="role-options">
        <div class="role-card" (click)="selectUserType('creator')">
          <div class="role-icon">👑</div>
          <h3>Creator</h3>
          <p>Create and manage Revolts (Discord-style servers)</p>
          <ul>
            <li>Create Revolts</li>
            <li>Manage channels</li>
            <li>Assign roles</li>
            <li>Moderate content</li>
          </ul>
        </div>
        <div class="role-card" (click)="selectUserType('supporter')">
          <div class="role-icon">👥</div>
          <h3>Supporter</h3>
          <p>Join Revolts and participate in communities</p>
          <ul>
            <li>Join Revolts</li>
            <li>Participate in channels</li>
            <li>Voice/video chat</li>
            <li>Make donations</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class UserTypeSelectionComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async selectUserType(userType: 'creator' | 'supporter'): Promise<void> {
    try {
      await this.authService.updateUserType(userType);
      this.router.navigate(['/discord']);
    } catch (error) {
      console.error('Error updating user type:', error);
    }
  }
}
```

## 👤 User Profile Management

### Profile Data Structure

```typescript
interface UserProfile {
  // Basic Information
  username: string;
  discriminator: string;
  email: string;
  avatar?: string;
  bio?: string;
  status: 'online' | 'away' | 'busy' | 'invisible';
  customStatus?: string;
  location?: string;
  website?: string;
  
  // User Type Specific
  userType: 'creator' | 'supporter';
  
  // Social Links
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  
  // Progress Tracking
  letterProgress: LetterProgress;
  achievements: Achievement[];
  stats: UserStats;
  revoltMemberships: RevoltMembership[];
}
```

### Profile Update Service

```typescript
// src/app/core/services/profile.service.ts
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private store: Store<AppState>
  ) {}

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.http.put<UserProfile>('/api/user/profile', updates).toPromise();
      
      // Update local state
      this.authService.updateUser(response);
      
      // Update NgRx store
      this.store.dispatch(AuthActions.updateProfile({ profile: response }));
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await this.http.post<{ url: string }>('/api/user/avatar', formData).toPromise();
    return response.url;
  }
}
```

## 🔒 Access Control

### Angular Guards

```typescript
// src/app/core/guards/auth.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}

// src/app/core/guards/letters-completed.guard.ts
@Injectable({
  providedIn: 'root'
})
export class LettersCompletedGuard implements CanActivate {
  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.select(selectLetterProgress).pipe(
      map(progress => {
        if (progress.completedLetters.length >= 30) {
          return true;
        }
        
        this.router.navigate(['/letters']);
        return false;
      })
    );
  }
}

// src/app/core/guards/revolt-permission.guard.ts
@Injectable({
  providedIn: 'root'
})
export class RevoltPermissionGuard implements CanActivate {
  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute
  ) {}

  canActivate(): Observable<boolean> {
    const revoltId = this.route.snapshot.paramMap.get('revoltId');
    const requiredPermission = this.route.snapshot.data['permission'];
    
    return this.store.select(selectRevoltPermissions(revoltId)).pipe(
      map(permissions => {
        return permissions.includes(requiredPermission);
      })
    );
  }
}
```

### Role-Based Permissions

```typescript
// src/app/core/services/permission.service.ts
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private revoltPermissions = new Map<string, string[]>();

  hasRevoltPermission(revoltId: string, permission: string): boolean {
    const permissions = this.revoltPermissions.get(revoltId) || [];
    return permissions.includes(permission);
  }

  hasGlobalPermission(permission: string): boolean {
    const globalPermissions = [
      'create_revolt',
      'join_revolt',
      'send_message',
      'use_voice',
      'donate'
    ];
    
    return globalPermissions.includes(permission);
  }

  canManageRevolt(revoltId: string): boolean {
    return this.hasRevoltPermission(revoltId, 'manage_revolt');
  }

  canManageChannels(revoltId: string): boolean {
    return this.hasRevoltPermission(revoltId, 'manage_channels');
  }

  canManageMembers(revoltId: string): boolean {
    return this.hasRevoltPermission(revoltId, 'manage_members');
  }

  canModerateContent(revoltId: string): boolean {
    return this.hasRevoltPermission(revoltId, 'moderate_content');
  }
}
```

## 🔄 Authentication States

### NgRx State Management

```typescript
// src/app/store/auth/auth.state.ts
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// src/app/store/auth/auth.actions.ts
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Request': props<{ credentials: LoginRequest }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Update Profile': props<{ profile: UserProfile }>(),
    'Update Letter Progress': props<{ progress: LetterProgress }>()
  }
});

// src/app/store/auth/auth.reducer.ts
export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginRequest, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }))
);
```

### Loading States

```typescript
// Angular component for authentication status
@Component({
  selector: 'app-auth-status',
  template: `
    <div *ngIf="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Authenticating...</p>
    </div>
    
    <div *ngIf="!isAuthenticated && !isLoading" class="unauthenticated">
      <app-oauth-login></app-oauth-login>
    </div>
    
    <div *ngIf="isAuthenticated && !isLoading" class="authenticated">
      <app-discord-interface [user]="user"></app-discord-interface>
    </div>
  `
})
export class AuthStatusComponent {
  user$ = this.store.select(selectCurrentUser);
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  isLoading$ = this.store.select(selectAuthLoading);

  constructor(private store: Store<AppState>) {}
}
```

## 🚀 Authentication Hooks

### Custom Authentication Hook

```typescript
// src/app/core/hooks/use-auth.hook.ts
export function useAuth() {
  const user$ = inject(Store).select(selectCurrentUser);
  const isAuthenticated$ = inject(Store).select(selectIsAuthenticated);
  const isLoading$ = inject(Store).select(selectAuthLoading);
  
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);

  return {
    user$,
    isAuthenticated$,
    isLoading$,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    hasPermission: permissionService.hasRevoltPermission.bind(permissionService)
  };
}
```

### User Type Hook

```typescript
// User type specific hook
export function useUserType() {
  const user$ = inject(Store).select(selectCurrentUser);
  
  return {
    isCreator$: user$.pipe(map(user => user?.userType === 'creator')),
    isSupporter$: user$.pipe(map(user => user?.userType === 'supporter')),
    canCreateRevolts$: user$.pipe(map(user => user?.userType === 'creator')),
    canJoinRevolts$: user$.pipe(map(() => true)), // All users can join
    canDonate$: user$.pipe(map(() => true)) // All users can donate
  };
}
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# API Configuration
API_URL=http://localhost:3000/api
SOCKET_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Database
MONGODB_URI=mongodb://localhost:27017/revolution-network
```

### Angular Environment Files

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
  googleClientId: 'your-google-client-id',
  githubClientId: 'your-github-client-id',
  discordClientId: 'your-discord-client-id'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.revnet.com',
  socketUrl: 'https://socket.revnet.com',
  googleClientId: 'your-prod-google-client-id',
  githubClientId: 'your-prod-github-client-id',
  discordClientId: 'your-prod-discord-client-id'
};
```

## 🧪 Testing Authentication

### Unit Tests

```typescript
// Authentication service tests
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login successfully', async () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const mockResponse = { success: true, token: 'jwt-token', user: mockUser };

    service.login(credentials).then(response => {
      expect(response.success).toBe(true);
      expect(response.token).toBe('jwt-token');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should validate token correctly', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const invalidToken = 'invalid-token';

    expect(service.isTokenValid(validToken)).toBe(true);
    expect(service.isTokenValid(invalidToken)).toBe(false);
  });
});
```

### Integration Tests

```typescript
// Authentication flow tests
describe('Authentication Flow', () => {
  it('should redirect to login when unauthenticated', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    // Simulate unauthenticated state
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'isAuthenticated').and.returnValue(false);

    await fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
```

## 🔄 Session Refresh

### Automatic Token Refresh

```typescript
// Token refresh service
@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.startTokenRefreshTimer();
  }

  private startTokenRefreshTimer(): void {
    setInterval(() => {
      const token = this.authService.getToken();
      if (token && this.isTokenExpiringSoon(token)) {
        this.refreshToken();
      }
    }, 60000); // Check every minute
  }

  private isTokenExpiringSoon(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Refresh if token expires within 5 minutes
      return timeUntilExpiry < 5 * 60 * 1000;
    } catch {
      return true;
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await this.http.post<{ token: string }>('/api/auth/refresh').toPromise();
      if (response.token) {
        localStorage.setItem('token', response.token);
        this.authService.setToken(response.token);
      }
    } catch (error) {
      // If refresh fails, logout user
      this.authService.logout();
    }
  }
}
```

This authentication system provides secure, flexible user management for the Revolution Network platform with Discord-like features, supporting both OAuth providers and development-friendly demo authentication using Angular 17+ and modern web technologies.