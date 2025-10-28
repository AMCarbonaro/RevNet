# Architecture Documentation

## Overview

Revolution Network is built on Angular 17+ with a Discord-like interface, featuring a modular architecture designed for scalability, maintainability, and real-time collaboration. The platform follows Angular best practices with NgRx state management and WebRTC for voice/video communication.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular 17+)                   │
├─────────────────────────────────────────────────────────────┤
│  Landing Page  │  Terminal  │  Letters  │  Discord UI     │
├─────────────────────────────────────────────────────────────┤
│              NgRx State Management & Services              │
├─────────────────────────────────────────────────────────────┤
│  HTTP Client  │  Socket.IO  │  WebRTC  │  Auth Guards    │
├─────────────────────────────────────────────────────────────┤
│                    Backend Services                        │
├─────────────────────────────────────────────────────────────┤
│  Node.js API  │  MongoDB  │  Redis  │  MediaSoup SFU    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── app/                    # Angular application
│   ├── core/              # Core functionality
│   │   ├── auth/          # Authentication services
│   │   ├── guards/        # Route guards
│   │   ├── interceptors/  # HTTP interceptors
│   │   └── services/      # Core services
│   ├── features/          # Feature modules
│   │   ├── landing/       # Landing page
│   │   ├── terminal/      # Terminal interface
│   │   ├── letters/       # Anthony Letters
│   │   ├── discord/       # Discord-like interface
│   │   │   ├── revolts/   # Revolt management
│   │   │   ├── channels/  # Channel system
│   │   │   ├── chat/      # Chat components
│   │   │   └── voice/     # Voice/video channels
│   │   ├── donations/     # Donation system
│   │   └── profile/       # User profiles
│   ├── shared/            # Shared components
│   │   ├── components/    # Reusable components
│   │   ├── directives/    # Custom directives
│   │   ├── pipes/         # Custom pipes
│   │   └── models/        # TypeScript interfaces
│   ├── store/             # NgRx store
│   │   ├── actions/       # NgRx actions
│   │   ├── effects/       # NgRx effects
│   │   ├── reducers/      # NgRx reducers
│   │   └── selectors/     # NgRx selectors
│   └── styles/            # Global styles
├── assets/                # Static assets
├── environments/          # Environment configs
└── main.ts               # Application bootstrap
```

## 🧩 Component Architecture

### Discord-Like Interface Structure

```
App
├── LandingPage (Public)
├── TerminalInterface (First-time users)
├── AnthonyLetters (Educational progression)
└── DiscordInterface (Main app - after 30 letters)
    ├── ServerSidebar (Left panel - Revolts list)
    ├── ChannelSidebar (Middle panel - Channels)
    ├── ChatArea (Main panel - Messages)
    ├── MemberList (Right panel - Online members)
    └── VoiceChannel (Overlay - Voice/video)
```

### Component Categories

#### 1. Landing Page Components
- **LandingPage** - Public homepage
- **RevoltCard** - Discord-style server cards
- **DonationForm** - Anonymous donation form
- **HeroSection** - Main introduction
- **FeatureShowcase** - Platform features

#### 2. Terminal Components
- **TerminalInterface** - Matrix-inspired onboarding
- **TerminalInput** - User input handling
- **TerminalCursor** - Blinking cursor animation
- **MatrixRain** - Background matrix effect
- **RedPillBluePill** - Choice interface

#### 3. Discord Interface Components
- **DiscordLayout** - Main Discord-like layout
- **ServerSidebar** - Left panel with Revolts
- **ChannelSidebar** - Middle panel with channels
- **ChatArea** - Main message area
- **MessageList** - Message display
- **MessageInput** - Message composition
- **MemberList** - Right panel with members
- **VoiceChannel** - Voice/video overlay

#### 4. Revolt Management Components
- **RevoltCard** - Server preview cards
- **RevoltSettings** - Server configuration
- **ChannelSettings** - Channel configuration
- **RoleManager** - Role and permission management
- **MemberManager** - Member management
- **InviteManager** - Invite link generation

#### 5. Real-time Components
- **ChatMessage** - Individual message display
- **TypingIndicator** - Typing status
- **UserPresence** - Online/offline status
- **VoiceControls** - Voice channel controls
- **VideoControls** - Video channel controls
- **ScreenShare** - Screen sharing interface

## 🔄 State Management (NgRx)

### Store Structure

```typescript
interface AppState {
  // User state
  user: UserState;
  
  // Revolts state
  revolts: RevoltsState;
  
  // Channels state
  channels: ChannelsState;
  
  // Messages state
  messages: MessagesState;
  
  // Voice state
  voice: VoiceState;
  
  // UI state
  ui: UiState;
  
  // Notifications state
  notifications: NotificationsState;
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  letterProgress: LetterProgress;
  isLoading: boolean;
  error: string | null;
}

interface RevoltsState {
  joinedRevolts: Revolt[];
  availableRevolts: Revolt[];
  currentRevolt: Revolt | null;
  isLoading: boolean;
  error: string | null;
}

interface ChannelsState {
  channels: Channel[];
  currentChannel: Channel | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface VoiceState {
  isConnected: boolean;
  currentVoiceChannel: VoiceChannel | null;
  participants: VoiceParticipant[];
  isMuted: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
}
```

### NgRx Actions

```typescript
// User Actions
export const login = createAction('[User] Login', props<{ user: User }>());
export const logout = createAction('[User] Logout');
export const updateLetterProgress = createAction('[User] Update Letter Progress', props<{ progress: LetterProgress }>());

// Revolt Actions
export const loadRevolts = createAction('[Revolts] Load Revolts');
export const loadRevoltsSuccess = createAction('[Revolts] Load Revolts Success', props<{ revolts: Revolt[] }>());
export const joinRevolt = createAction('[Revolts] Join Revolt', props<{ revoltId: string }>());
export const leaveRevolt = createAction('[Revolts] Leave Revolt', props<{ revoltId: string }>());
export const createRevolt = createAction('[Revolts] Create Revolt', props<{ revolt: CreateRevoltRequest }>());

// Channel Actions
export const loadChannels = createAction('[Channels] Load Channels', props<{ revoltId: string }>());
export const selectChannel = createAction('[Channels] Select Channel', props<{ channelId: string }>());
export const sendMessage = createAction('[Messages] Send Message', props<{ message: CreateMessageRequest }>());
export const receiveMessage = createAction('[Messages] Receive Message', props<{ message: Message }>());

// Voice Actions
export const joinVoiceChannel = createAction('[Voice] Join Voice Channel', props<{ channelId: string }>());
export const leaveVoiceChannel = createAction('[Voice] Leave Voice Channel');
export const toggleMute = createAction('[Voice] Toggle Mute');
export const toggleDeafen = createAction('[Voice] Toggle Deafen');
export const startScreenShare = createAction('[Voice] Start Screen Share');
export const stopScreenShare = createAction('[Voice] Stop Screen Share');
```

### NgRx Effects

```typescript
@Injectable()
export class RevoltEffects {
  loadRevolts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevoltActions.loadRevolts),
      switchMap(() =>
        this.revoltService.getRevolts().pipe(
          map(revolts => RevoltActions.loadRevoltsSuccess({ revolts })),
          catchError(error => of(RevoltActions.loadRevoltsFailure({ error })))
        )
      )
    )
  );

  joinRevolt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevoltActions.joinRevolt),
      switchMap(({ revoltId }) =>
        this.revoltService.joinRevolt(revoltId).pipe(
          map(() => RevoltActions.joinRevoltSuccess({ revoltId })),
          catchError(error => of(RevoltActions.joinRevoltFailure({ error })))
        )
      )
    )
  );
}
```

## 🔌 API Architecture

### Backend Structure (Node.js + Express)

```
backend/
├── src/
│   ├── controllers/       # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── revolt.controller.ts
│   │   ├── channel.controller.ts
│   │   ├── message.controller.ts
│   │   └── voice.controller.ts
│   ├── services/          # Business logic
│   │   ├── revolt.service.ts
│   │   ├── channel.service.ts
│   │   ├── message.service.ts
│   │   └── voice.service.ts
│   ├── models/            # Database models
│   │   ├── user.model.ts
│   │   ├── revolt.model.ts
│   │   ├── channel.model.ts
│   │   └── message.model.ts
│   ├── middleware/        # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rateLimit.middleware.ts
│   ├── routes/            # API routes
│   │   ├── auth.routes.ts
│   │   ├── revolt.routes.ts
│   │   ├── channel.routes.ts
│   │   └── voice.routes.ts
│   └── websocket/         # Socket.IO handlers
│       ├── chat.handler.ts
│       ├── voice.handler.ts
│       └── presence.handler.ts
```

### API Endpoints

```typescript
// Authentication
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh

// Revolts
GET    /api/revolts                    # Get user's revolts
POST   /api/revolts                    # Create new revolt
GET    /api/revolts/:id                # Get revolt details
PUT    /api/revolts/:id                # Update revolt
DELETE /api/revolts/:id                # Delete revolt
POST   /api/revolts/:id/join           # Join revolt
POST   /api/revolts/:id/leave          # Leave revolt

// Channels
GET    /api/revolts/:revoltId/channels # Get revolt channels
POST   /api/revolts/:revoltId/channels # Create channel
PUT    /api/channels/:id               # Update channel
DELETE /api/channels/:id               # Delete channel

// Messages
GET    /api/channels/:id/messages      # Get channel messages
POST   /api/channels/:id/messages      # Send message
PUT    /api/messages/:id               # Edit message
DELETE /api/messages/:id               # Delete message

// Voice/Video
POST   /api/voice/join                 # Join voice channel
POST   /api/voice/leave                # Leave voice channel
POST   /api/voice/mute                 # Toggle mute
POST   /api/voice/deafen               # Toggle deafen
POST   /api/voice/screenshare          # Start/stop screen share

// Donations
POST   /api/donations                  # Create donation
GET    /api/revolts/:id/donations      # Get revolt donations
```

## 🗄️ Database Architecture

### MongoDB Collections

#### 1. Users Collection
```typescript
{
  _id: ObjectId,
  id: string,
  username: string,
  email: string,
  avatar: string,
  letterProgress: {
    completedLetters: number[],
    currentBook: 'awakening' | 'foundation' | 'arsenal' | 'revolution',
    totalProgress: number
  },
  stats: {
    revoltsJoined: number,
    messagesSent: number,
    donationsMade: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Revolts Collection
```typescript
{
  _id: ObjectId,
  id: string,
  name: string,
  description: string,
  icon: string,
  banner: string,
  owner: ObjectId, // User ID
  members: ObjectId[], // User IDs
  channels: ObjectId[], // Channel IDs
  roles: {
    [roleName: string]: {
      permissions: string[],
      color: string,
      members: ObjectId[]
    }
  },
  settings: {
    isPublic: boolean,
    inviteCode: string,
    maxMembers: number,
    verificationLevel: number
  },
  stats: {
    memberCount: number,
    messageCount: number,
    totalDonations: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Channels Collection
```typescript
{
  _id: ObjectId,
  id: string,
  revoltId: ObjectId,
  name: string,
  type: 'text' | 'voice' | 'video',
  description: string,
  position: number,
  permissions: {
    [roleId: string]: {
      view: boolean,
      send: boolean,
      manage: boolean
    }
  },
  settings: {
    isNsfw: boolean,
    slowMode: number, // seconds
    maxMembers: number // for voice channels
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Messages Collection
```typescript
{
  _id: ObjectId,
  id: string,
  channelId: ObjectId,
  authorId: ObjectId,
  content: string,
  type: 'text' | 'image' | 'file' | 'embed',
  attachments: {
    url: string,
    filename: string,
    size: number,
    type: string
  }[],
  embeds: {
    title: string,
    description: string,
    color: string,
    fields: { name: string, value: string, inline: boolean }[]
  }[],
  reactions: {
    [emoji: string]: ObjectId[] // User IDs who reacted
  },
  editedAt: Date,
  createdAt: Date
}
```

## 🔄 Real-time Architecture

### Socket.IO Implementation

#### 1. Server Setup
```typescript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Redis adapter for scaling
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  // Authentication
  socket.on('authenticate', (token) => {
    // Verify JWT token
    const user = verifyToken(token);
    socket.userId = user.id;
    socket.join(`user:${user.id}`);
  });

  // Join revolt
  socket.on('join-revolt', (revoltId) => {
    socket.join(`revolt:${revoltId}`);
  });

  // Join channel
  socket.on('join-channel', (channelId) => {
    socket.join(`channel:${channelId}`);
  });

  // Send message
  socket.on('send-message', async (data) => {
    const message = await messageService.create(data);
    io.to(`channel:${data.channelId}`).emit('receive-message', message);
  });

  // Typing indicator
  socket.on('typing-start', (data) => {
    socket.to(`channel:${data.channelId}`).emit('user-typing', {
      userId: socket.userId,
      channelId: data.channelId
    });
  });

  // Voice channel events
  socket.on('join-voice', (data) => {
    socket.join(`voice:${data.channelId}`);
    io.to(`voice:${data.channelId}`).emit('user-joined-voice', {
      userId: socket.userId,
      channelId: data.channelId
    });
  });
});
```

#### 2. Angular Service Integration
```typescript
@Injectable()
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl, {
      auth: {
        token: localStorage.getItem('token')
      }
    });
  }

  joinRevolt(revoltId: string): void {
    this.socket.emit('join-revolt', revoltId);
  }

  joinChannel(channelId: string): void {
    this.socket.emit('join-channel', channelId);
  }

  sendMessage(message: CreateMessageRequest): void {
    this.socket.emit('send-message', message);
  }

  onMessageReceived(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('receive-message', (message) => {
        observer.next(message);
      });
    });
  }

  onUserTyping(): Observable<TypingEvent> {
    return new Observable(observer => {
      this.socket.on('user-typing', (event) => {
        observer.next(event);
      });
    });
  }
}
```

## 🎥 WebRTC Architecture

### MediaSoup SFU Setup

#### 1. MediaSoup Server
```typescript
import { createWorker } from 'mediasoup';

const worker = await createWorker({
  logLevel: 'warn',
  rtcMinPort: 2000,
  rtcMaxPort: 2020,
});

const router = await worker.createRouter({
  mediaCodecs: [
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000,
      },
    },
  ],
});
```

#### 2. Angular WebRTC Service
```typescript
@Injectable()
export class WebRTCService {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream;
  private remoteStreams: Map<string, MediaStream> = new Map();

  async initializeWebRTC(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:your-turn-server.com' }
      ]
    });

    // Get user media
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    // Add tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Handle remote streams
    this.peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.remoteStreams.set(event.track.id, remoteStream);
    };
  }

  async joinVoiceChannel(channelId: string): Promise<void> {
    // Connect to MediaSoup SFU
    const transport = await this.createTransport();
    await this.produceAudio();
    await this.produceVideo();
  }

  async startScreenShare(): Promise<void> {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    
    const screenTrack = screenStream.getVideoTracks()[0];
    this.peerConnection.addTrack(screenTrack, screenStream);
  }
}
```

## 🎨 Styling Architecture

### Tailwind Configuration for Discord Clone

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Discord color palette
        discord: {
          dark: '#2C2F33',
          darker: '#23272A',
          darkest: '#1E2124',
          light: '#36393F',
          lighter: '#40444B',
          lightest: '#B9BBBE',
          brand: '#5865F2',
          green: '#3BA55C',
          yellow: '#FEE75C',
          red: '#ED4245',
        },
        // Cyberpunk accents
        neon: {
          green: '#39FF14',
          cyan: '#00DDEB',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        'discord': ['Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'typing': 'typing 1.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Discord Component Styles

```scss
// Discord-like message styles
.message {
  @apply flex px-4 py-2 hover:bg-discord-dark;
  
  &-avatar {
    @apply w-10 h-10 rounded-full mr-3 flex-shrink-0;
  }
  
  &-content {
    @apply flex-1 min-w-0;
  }
  
  &-header {
    @apply flex items-center mb-1;
  }
  
  &-author {
    @apply text-white font-medium mr-2;
  }
  
  &-timestamp {
    @apply text-discord-lightest text-xs;
  }
  
  &-body {
    @apply text-discord-lightest leading-relaxed;
  }
}

// Voice channel styles
.voice-channel {
  @apply flex items-center px-2 py-1 rounded hover:bg-discord-dark cursor-pointer;
  
  &-icon {
    @apply w-4 h-4 mr-2 text-discord-lightest;
  }
  
  &-name {
    @apply text-discord-lightest text-sm;
  }
  
  &-user-count {
    @apply text-discord-lightest text-xs ml-auto;
  }
}
```

## 🔒 Security Architecture

### Authentication & Authorization

#### 1. JWT Token Management
```typescript
@Injectable()
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.tokenSubject.next(response.token);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
```

#### 2. Route Guards
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isTokenValid()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable()
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
```

### Data Protection

#### 1. HTTP Interceptors
```typescript
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

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Redirect to login
          this.router.navigate(['/login']);
        }
        
        return throwError(error);
      })
    );
  }
}
```

## 📱 Mobile Architecture

### Ionic/Capacitor Integration

#### 1. Mobile-Specific Components
```typescript
@Component({
  selector: 'app-mobile-discord',
  template: `
    <ion-content>
      <ion-tabs>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="revolts">
            <ion-icon name="server"></ion-icon>
            <ion-label>Revolts</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="channels">
            <ion-icon name="chatbubbles"></ion-icon>
            <ion-label>Channels</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="voice">
            <ion-icon name="mic"></ion-icon>
            <ion-label>Voice</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  `
})
export class MobileDiscordComponent {}
```

#### 2. Native Features
```typescript
@Injectable()
export class NativeService {
  constructor(private capacitor: Capacitor) {}

  async requestPermissions(): Promise<void> {
    if (this.capacitor.isNativePlatform()) {
      const permissions = await Camera.requestPermissions();
      const microphone = await Microphone.requestPermissions();
    }
  }

  async shareRevolt(revolt: Revolt): Promise<void> {
    if (this.capacitor.isNativePlatform()) {
      await Share.share({
        title: revolt.name,
        text: revolt.description,
        url: `https://revnet.com/revolts/${revolt.id}`
      });
    }
  }
}
```

## 🚀 Performance Architecture

### Angular Optimization

#### 1. Lazy Loading Modules
```typescript
const routes: Routes = [
  {
    path: 'discord',
    loadChildren: () => import('./features/discord/discord.module').then(m => m.DiscordModule),
    canActivate: [LettersCompletedGuard]
  },
  {
    path: 'letters',
    loadChildren: () => import('./features/letters/letters.module').then(m => m.LettersModule)
  }
];
```

#### 2. OnPush Change Detection
```typescript
@Component({
  selector: 'app-message-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let message of messages$ | async">
      <app-message [message]="message"></app-message>
    </div>
  `
})
export class MessageListComponent {
  messages$ = this.store.select(selectChannelMessages);
  
  constructor(private store: Store<AppState>) {}
}
```

#### 3. Virtual Scrolling
```typescript
@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="message-viewport">
      <div *cdkVirtualFor="let message of messages">
        <app-message [message]="message"></app-message>
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class MessageListComponent {}
```

## 🔧 Development Architecture

### Build Configuration

#### 1. Angular Build Optimization
```json
{
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
      "outputPath": "dist/revnet",
      "index": "src/index.html",
      "main": "src/main.ts",
      "polyfills": "src/polyfills.ts",
      "tsConfig": "tsconfig.app.json",
      "aot": true,
      "assets": ["src/favicon.ico", "src/assets"],
      "styles": ["src/styles.scss"],
      "scripts": [],
      "optimization": true,
      "outputHashing": "all",
      "sourceMap": false,
      "namedChunks": false,
      "extractLicenses": true,
      "vendorChunk": false,
      "buildOptimizer": true
    }
  }
}
```

#### 2. Environment Configuration
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.revnet.com',
  socketUrl: 'https://socket.revnet.com',
  webrtcUrl: 'https://webrtc.revnet.com',
  stripePublishableKey: 'pk_live_...',
  googleClientId: '...',
  githubClientId: '...',
  discordClientId: '...'
};
```

## 📊 Monitoring Architecture

### Application Monitoring

#### 1. Error Tracking
```typescript
@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  handleError(error: any): void {
    // Log to external service (Sentry, etc.)
    console.error('Global error:', error);
    
    // Send to monitoring service
    this.monitoringService.captureException(error);
  }
}
```

#### 2. Performance Monitoring
```typescript
@Injectable()
export class PerformanceService {
  trackPageLoad(page: string): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.monitoringService.track('page_load', {
      page,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    });
  }
}
```

## 🔄 Deployment Architecture

### DigitalOcean Deployment

#### 1. Frontend (Angular)
```yaml
# DigitalOcean App Platform
name: revnet-frontend
source:
  type: github
  repo: revnet/revnet-frontend
  branch: main
  deploy_on_push: true
build:
  run_command: npm run build
  environment_slug: node-js
  output_dir: dist
routes:
  - path: /
    preserve_path_prefix: true
```

#### 2. Backend (Node.js)
```yaml
name: revnet-backend
source:
  type: github
  repo: revnet/revnet-backend
  branch: main
  deploy_on_push: true
build:
  run_command: npm run build
  environment_slug: node-js
run:
  run_command: npm start
  environment_slug: node-js
  instance_count: 2
  instance_size_slug: basic-xxs
```

#### 3. WebRTC Server (MediaSoup)
```yaml
name: revnet-webrtc
source:
  type: github
  repo: revnet/revnet-webrtc
  branch: main
  deploy_on_push: true
build:
  run_command: npm run build
  environment_slug: node-js
run:
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-s
```

This architecture provides a solid foundation for the Revolution Network platform with Discord-like features, ensuring scalability, maintainability, and real-time collaboration capabilities using Angular 17+ and modern web technologies.