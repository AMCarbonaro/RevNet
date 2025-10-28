# Real-Time Communication Documentation

## Overview

Revolution Network implements a comprehensive real-time communication system using Socket.IO for text messaging and WebRTC for voice/video communication. The system provides Discord-like real-time features including instant messaging, voice channels, video calls, screen sharing, and user presence tracking.

## 🔌 Socket.IO Implementation

### Connection Management

```typescript
// src/app/core/services/socket.service.ts
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connectionState$ = new BehaviorSubject<ConnectionState>('disconnected');
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private authService: AuthService,
    private store: Store<AppState>
  ) {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.socket = io(environment.socketUrl, {
      auth: {
        token: this.authService.getAccessToken()
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.connectionState$.next('connected');
      this.reconnectAttempts = 0;
      this.store.dispatch(SocketActions.connected());
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionState$.next('disconnected');
      this.store.dispatch(SocketActions.disconnected({ reason }));
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.connectionState$.next('connected');
      this.reconnectAttempts = attemptNumber;
      this.store.dispatch(SocketActions.reconnected({ attemptNumber }));
    });

    this.socket.on('reconnect_error', (error) => {
      this.connectionState$.next('reconnecting');
      this.store.dispatch(SocketActions.reconnectError({ error: error.message }));
    });

    // Authentication events
    this.socket.on('auth_error', (error) => {
      this.authService.logout();
      this.store.dispatch(AuthActions.logout());
    });

    // Message events
    this.socket.on('message_created', (message) => {
      this.store.dispatch(MessageActions.messageReceived({ message }));
    });

    this.socket.on('message_updated', (message) => {
      this.store.dispatch(MessageActions.messageUpdated({ message }));
    });

    this.socket.on('message_deleted', (data) => {
      this.store.dispatch(MessageActions.messageDeleted({ messageId: data.messageId }));
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      this.store.dispatch(MessageActions.userTyping({ 
        channelId: data.channelId, 
        user: data.user 
      }));
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.store.dispatch(MessageActions.userStoppedTyping({ 
        channelId: data.channelId, 
        userId: data.userId 
      }));
    });

    // Presence events
    this.socket.on('user_presence_updated', (data) => {
      this.store.dispatch(UserActions.presenceUpdated({ 
        userId: data.userId, 
        status: data.status,
        activity: data.activity 
      }));
    });

    // Voice events
    this.socket.on('voice_user_joined', (data) => {
      this.store.dispatch(VoiceActions.userJoined({ 
        channelId: data.channelId, 
        user: data.user 
      }));
    });

    this.socket.on('voice_user_left', (data) => {
      this.store.dispatch(VoiceActions.userLeft({ 
        channelId: data.channelId, 
        userId: data.userId 
      }));
    });

    this.socket.on('voice_user_muted', (data) => {
      this.store.dispatch(VoiceActions.userMuted({ 
        channelId: data.channelId, 
        userId: data.userId 
      }));
    });

    this.socket.on('voice_user_unmuted', (data) => {
      this.store.dispatch(VoiceActions.userUnmuted({ 
        channelId: data.channelId, 
        userId: data.userId 
      }));
    });
  }

  // Message methods
  joinChannel(channelId: string): void {
    this.socket?.emit('join_channel', { channelId });
  }

  leaveChannel(channelId: string): void {
    this.socket?.emit('leave_channel', { channelId });
  }

  sendMessage(message: SendMessageRequest): void {
    this.socket?.emit('send_message', message);
  }

  updateMessage(messageId: string, content: string): void {
    this.socket?.emit('update_message', { messageId, content });
  }

  deleteMessage(messageId: string): void {
    this.socket?.emit('delete_message', { messageId });
  }

  addReaction(messageId: string, emoji: string): void {
    this.socket?.emit('add_reaction', { messageId, emoji });
  }

  removeReaction(messageId: string, emoji: string): void {
    this.socket?.emit('remove_reaction', { messageId, emoji });
  }

  // Typing methods
  startTyping(channelId: string): void {
    this.socket?.emit('start_typing', { channelId });
  }

  stopTyping(channelId: string): void {
    this.socket?.emit('stop_typing', { channelId });
  }

  // Presence methods
  updatePresence(status: UserStatus, activity?: string): void {
    this.socket?.emit('update_presence', { status, activity });
  }

  // Voice methods
  joinVoiceChannel(channelId: string): void {
    this.socket?.emit('join_voice', { channelId });
  }

  leaveVoiceChannel(channelId: string): void {
    this.socket?.emit('leave_voice', { channelId });
  }

  updateVoiceState(isMuted: boolean, isDeafened: boolean): void {
    this.socket?.emit('update_voice_state', { isMuted, isDeafened });
  }

  // Connection state
  getConnectionState(): Observable<ConnectionState> {
    return this.connectionState$.asObservable();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}

type ConnectionState = 'connected' | 'disconnected' | 'reconnecting' | 'error';
```

### Message Service

```typescript
// src/app/core/services/message.service.ts
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private store: Store<AppState>
  ) {}

  async getMessages(channelId: string, limit = 50, before?: string): Promise<Message[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('before', before || '');

    const response = await this.http.get<ApiResponse<Message[]>>(
      `/api/channels/${channelId}/messages`, 
      { params }
    ).toPromise();

    return response?.data || [];
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    // Optimistic update
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content: request.content,
      author: this.getCurrentUser(),
      channelId: request.channelId,
      revoltId: request.revoltId,
      createdAt: new Date(),
      editedAt: null,
      isDeleted: false,
      reactions: [],
      attachments: [],
      replyTo: request.replyTo
    };

    this.store.dispatch(MessageActions.messageSent({ message: tempMessage }));

    try {
      // Send via Socket.IO for real-time delivery
      this.socketService.sendMessage(request);

      // Also send via HTTP for persistence
      const response = await this.http.post<ApiResponse<Message>>(
        `/api/channels/${request.channelId}/messages`,
        request
      ).toPromise();

      // Replace temp message with real message
      this.store.dispatch(MessageActions.messageSent({ message: response?.data || tempMessage }));

      return response?.data || tempMessage;
    } catch (error) {
      // Mark message as failed
      this.store.dispatch(MessageActions.messageFailed({ 
        messageId: tempMessage.id, 
        error: error.message 
      }));
      throw error;
    }
  }

  async updateMessage(messageId: string, content: string): Promise<Message> {
    this.socketService.updateMessage(messageId, content);

    const response = await this.http.put<ApiResponse<Message>>(
      `/api/messages/${messageId}`,
      { content }
    ).toPromise();

    return response?.data!;
  }

  async deleteMessage(messageId: string): Promise<void> {
    this.socketService.deleteMessage(messageId);

    await this.http.delete(`/api/messages/${messageId}`).toPromise();
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    this.socketService.addReaction(messageId, emoji);

    await this.http.post(`/api/messages/${messageId}/reactions`, { emoji }).toPromise();
  }

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    this.socketService.removeReaction(messageId, emoji);

    await this.http.delete(`/api/messages/${messageId}/reactions/${emoji}`).toPromise();
  }

  startTyping(channelId: string): void {
    this.socketService.startTyping(channelId);
  }

  stopTyping(channelId: string): void {
    this.socketService.stopTyping(channelId);
  }

  private getCurrentUser(): User {
    // Get current user from store
    let currentUser: User | null = null;
    this.store.select(selectCurrentUser).subscribe(user => currentUser = user).unsubscribe();
    return currentUser!;
  }
}
```

## 🎤 WebRTC Voice/Video Implementation

### Voice Service

```typescript
// src/app/core/services/voice.service.ts
@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private isMuted = false;
  private isDeafened = false;
  private currentChannelId: string | null = null;

  constructor(
    private socketService: SocketService,
    private store: Store<AppState>
  ) {
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load audio worklet for noise suppression
      await this.audioContext.audioWorklet.addModule('/assets/audio-worklets/noise-suppression.js');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async joinVoiceChannel(channelId: string): Promise<void> {
    try {
      this.currentChannelId = channelId;

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: false
      });

      // Apply audio processing
      await this.setupAudioProcessing();

      // Join via Socket.IO
      this.socketService.joinVoiceChannel(channelId);

      // Set up peer connections for other users
      this.setupPeerConnections();

      this.store.dispatch(VoiceActions.joinedChannel({ channelId }));
    } catch (error) {
      console.error('Failed to join voice channel:', error);
      this.store.dispatch(VoiceActions.joinFailed({ error: error.message }));
    }
  }

  async leaveVoiceChannel(): Promise<void> {
    if (!this.currentChannelId) return;

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach(connection => connection.close());
    this.peerConnections.clear();

    // Leave via Socket.IO
    this.socketService.leaveVoiceChannel(this.currentChannelId);

    this.store.dispatch(VoiceActions.leftChannel({ channelId: this.currentChannelId }));
    this.currentChannelId = null;
  }

  async toggleMute(): Promise<void> {
    if (!this.localStream) return;

    this.isMuted = !this.isMuted;
    
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = !this.isMuted;
    });

    this.socketService.updateVoiceState(this.isMuted, this.isDeafened);
    this.store.dispatch(VoiceActions.muteToggled({ isMuted: this.isMuted }));
  }

  async toggleDeafen(): Promise<void> {
    this.isDeafened = !this.isDeafened;

    // Mute/unmute all incoming audio
    this.peerConnections.forEach(connection => {
      const audioElements = document.querySelectorAll(`audio[data-peer-id="${connection}"]`);
      audioElements.forEach(element => {
        (element as HTMLAudioElement).muted = this.isDeafened;
      });
    });

    this.socketService.updateVoiceState(this.isMuted, this.isDeafened);
    this.store.dispatch(VoiceActions.deafenToggled({ isDeafened: this.isDeafened }));
  }

  private async setupAudioProcessing(): Promise<void> {
    if (!this.audioContext || !this.localStream) return;

    const source = this.audioContext.createMediaStreamSource(this.localStream);
    
    // Create noise suppression worklet
    this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'noise-suppression');
    
    // Connect audio processing chain
    source.connect(this.audioWorkletNode);
    this.audioWorkletNode.connect(this.audioContext.destination);
  }

  private setupPeerConnections(): void {
    // Set up peer connections for each user in the voice channel
    // This would be called when other users join/leave
  }

  // WebRTC signaling
  async handleOffer(offer: RTCSessionDescriptionInit, userId: string): Promise<void> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    await peerConnection.setRemoteDescription(offer);
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send answer back to the other peer
    this.socketService.emit('voice_answer', {
      answer,
      targetUserId: userId
    });

    this.peerConnections.set(userId, peerConnection);
  }

  async handleAnswer(answer: RTCSessionDescriptionInit, userId: string): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit, userId: string): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  }
}
```

### Video Service

```typescript
// src/app/core/services/video.service.ts
@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private isVideoEnabled = true;
  private isScreenSharing = false;
  private currentChannelId: string | null = null;

  constructor(
    private socketService: SocketService,
    private store: Store<AppState>
  ) {}

  async joinVideoChannel(channelId: string): Promise<void> {
    try {
      this.currentChannelId = channelId;

      // Get user media with video
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });

      // Join via Socket.IO
      this.socketService.joinVideoChannel(channelId);

      this.store.dispatch(VideoActions.joinedChannel({ channelId }));
    } catch (error) {
      console.error('Failed to join video channel:', error);
      this.store.dispatch(VideoActions.joinFailed({ error: error.message }));
    }
  }

  async leaveVideoChannel(): Promise<void> {
    if (!this.currentChannelId) return;

    // Stop local streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach(connection => connection.close());
    this.peerConnections.clear();

    // Leave via Socket.IO
    this.socketService.leaveVideoChannel(this.currentChannelId);

    this.store.dispatch(VideoActions.leftChannel({ channelId: this.currentChannelId }));
    this.currentChannelId = null;
  }

  async toggleVideo(): Promise<void> {
    if (!this.localStream) return;

    this.isVideoEnabled = !this.isVideoEnabled;
    
    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = this.isVideoEnabled;
    });

    this.socketService.updateVideoState(this.isVideoEnabled);
    this.store.dispatch(VideoActions.videoToggled({ isEnabled: this.isVideoEnabled }));
  }

  async startScreenShare(): Promise<void> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      this.isScreenSharing = true;

      // Replace video track in all peer connections
      this.peerConnections.forEach(connection => {
        const sender = connection.getSenders().find(s => s.track?.kind === 'video');
        if (sender && this.screenStream) {
          sender.replaceTrack(this.screenStream.getVideoTracks()[0]);
        }
      });

      this.store.dispatch(VideoActions.screenShareStarted());
    } catch (error) {
      console.error('Failed to start screen share:', error);
      this.store.dispatch(VideoActions.screenShareFailed({ error: error.message }));
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    this.isScreenSharing = false;

    // Restore original video track
    if (this.localStream) {
      this.peerConnections.forEach(connection => {
        const sender = connection.getSenders().find(s => s.track?.kind === 'video');
        if (sender && this.localStream) {
          sender.replaceTrack(this.localStream.getVideoTracks()[0]);
        }
      });
    }

    this.store.dispatch(VideoActions.screenShareStopped());
  }

  // WebRTC signaling for video
  async handleVideoOffer(offer: RTCSessionDescriptionInit, userId: string): Promise<void> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    await peerConnection.setRemoteDescription(offer);
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send answer back to the other peer
    this.socketService.emit('video_answer', {
      answer,
      targetUserId: userId
    });

    this.peerConnections.set(userId, peerConnection);
  }
}
```

## 📱 Presence System

### Presence Service

```typescript
// src/app/core/services/presence.service.ts
@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private presenceInterval: any;
  private lastActivity = Date.now();
  private isOnline = true;

  constructor(
    private socketService: SocketService,
    private store: Store<AppState>
  ) {
    this.setupActivityTracking();
    this.setupVisibilityTracking();
  }

  private setupActivityTracking(): void {
    // Track user activity
    document.addEventListener('mousedown', () => this.updateActivity());
    document.addEventListener('keydown', () => this.updateActivity());
    document.addEventListener('scroll', () => this.updateActivity());
    document.addEventListener('touchstart', () => this.updateActivity());

    // Update presence every 30 seconds
    this.presenceInterval = setInterval(() => {
      this.updatePresence();
    }, 30000);
  }

  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setStatus('away');
      } else {
        this.setStatus('online');
      }
    });
  }

  private updateActivity(): void {
    this.lastActivity = Date.now();
    this.isOnline = true;
  }

  private updatePresence(): void {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;

    // Auto-set to away if inactive for 5 minutes
    if (timeSinceActivity > 300000 && this.isOnline) {
      this.setStatus('away');
    }

    // Auto-set to offline if inactive for 30 minutes
    if (timeSinceActivity > 1800000) {
      this.setStatus('invisible');
    }
  }

  setStatus(status: UserStatus, activity?: string): void {
    this.socketService.updatePresence(status, activity);
    this.store.dispatch(UserActions.statusChanged({ status, activity }));
  }

  setActivity(activity: string): void {
    this.socketService.updatePresence('online', activity);
    this.store.dispatch(UserActions.activityChanged({ activity }));
  }

  destroy(): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
    }
  }
}
```

## 🔄 Real-Time State Management

### Socket Actions

```typescript
// src/app/store/socket/socket.actions.ts
export const SocketActions = createActionGroup({
  source: 'Socket',
  events: {
    'Connected': emptyProps(),
    'Disconnected': props<{ reason: string }>(),
    'Reconnected': props<{ attemptNumber: number }>(),
    'Reconnect Error': props<{ error: string }>(),
    'Auth Error': props<{ error: string }>()
  }
});

// src/app/store/messages/message.actions.ts
export const MessageActions = createActionGroup({
  source: 'Messages',
  events: {
    'Message Sent': props<{ message: Message }>(),
    'Message Received': props<{ message: Message }>(),
    'Message Updated': props<{ message: Message }>(),
    'Message Deleted': props<{ messageId: string }>(),
    'Message Failed': props<{ messageId: string; error: string }>(),
    'User Typing': props<{ channelId: string; user: User }>(),
    'User Stopped Typing': props<{ channelId: string; userId: string }>(),
    'Reaction Added': props<{ messageId: string; reaction: Reaction }>(),
    'Reaction Removed': props<{ messageId: string; emoji: string }>()
  }
});

// src/app/store/voice/voice.actions.ts
export const VoiceActions = createActionGroup({
  source: 'Voice',
  events: {
    'Joined Channel': props<{ channelId: string }>(),
    'Left Channel': props<{ channelId: string }>(),
    'Join Failed': props<{ error: string }>(),
    'User Joined': props<{ channelId: string; user: User }>(),
    'User Left': props<{ channelId: string; userId: string }>(),
    'User Muted': props<{ channelId: string; userId: string }>(),
    'User Unmuted': props<{ channelId: string; userId: string }>(),
    'Mute Toggled': props<{ isMuted: boolean }>(),
    'Deafen Toggled': props<{ isDeafened: boolean }>()
  }
});
```

### Socket Effects

```typescript
// src/app/store/socket/socket.effects.ts
@Injectable()
export class SocketEffects {
  constructor(
    private actions$: Actions,
    private socketService: SocketService
  ) {}

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => {
        this.socketService.initializeConnection();
      })
    ), { dispatch: false }
  );

  disconnect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.socketService.disconnect();
      })
    ), { dispatch: false }
  );

  joinChannel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChannelActions.selectChannel),
      tap(({ channelId }) => {
        this.socketService.joinChannel(channelId);
      })
    ), { dispatch: false }
  );

  leaveChannel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChannelActions.deselectChannel),
      tap(({ channelId }) => {
        this.socketService.leaveChannel(channelId);
      })
    ), { dispatch: false }
  );
}
```

## 🎛️ Audio/Video Controls

### Voice Controls Component

```typescript
// src/app/features/voice/components/voice-controls/voice-controls.component.ts
@Component({
  selector: 'app-voice-controls',
  standalone: true,
  template: `
    <div class="voice-controls">
      <div class="control-buttons">
        <button 
          class="control-btn mute"
          [class.active]="isMuted"
          (click)="toggleMute()"
          [attr.aria-label]="isMuted ? 'Unmute' : 'Mute'">
          <i [class]="isMuted ? 'icon-mic-off' : 'icon-mic'"></i>
        </button>

        <button 
          class="control-btn deafen"
          [class.active]="isDeafened"
          (click)="toggleDeafen()"
          [attr.aria-label]="isDeafened ? 'Undeafen' : 'Deafen'">
          <i [class]="isDeafened ? 'icon-volume-x' : 'icon-volume-2'"></i>
        </button>

        <button 
          class="control-btn settings"
          (click)="openSettings()"
          aria-label="Voice Settings">
          <i class="icon-settings"></i>
        </button>

        <button 
          class="control-btn leave"
          (click)="leaveChannel()"
          aria-label="Leave Voice Channel">
          <i class="icon-phone-off"></i>
        </button>
      </div>

      <!-- Audio Level Indicator -->
      <div class="audio-level" *ngIf="!isMuted">
        <div 
          class="level-bar"
          [style.width.%]="audioLevel">
        </div>
      </div>
    </div>
  `
})
export class VoiceControlsComponent {
  @Input() isMuted = false;
  @Input() isDeafened = false;
  @Input() audioLevel = 0;

  @Output() muteToggled = new EventEmitter<void>();
  @Output() deafenToggled = new EventEmitter<void>();
  @Output() settingsOpened = new EventEmitter<void>();
  @Output() channelLeft = new EventEmitter<void>();

  toggleMute(): void {
    this.muteToggled.emit();
  }

  toggleDeafen(): void {
    this.deafenToggled.emit();
  }

  openSettings(): void {
    this.settingsOpened.emit();
  }

  leaveChannel(): void {
    this.channelLeft.emit();
  }
}
```

## 📊 Performance Optimization

### Connection Pooling

```typescript
// src/app/core/services/connection-pool.service.ts
@Injectable({
  providedIn: 'root'
})
export class ConnectionPoolService {
  private connectionPool = new Map<string, RTCPeerConnection>();
  private maxConnections = 10;

  createConnection(userId: string): RTCPeerConnection {
    if (this.connectionPool.has(userId)) {
      return this.connectionPool.get(userId)!;
    }

    if (this.connectionPool.size >= this.maxConnections) {
      // Remove oldest connection
      const oldestKey = this.connectionPool.keys().next().value;
      this.connectionPool.delete(oldestKey);
    }

    const connection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.connectionPool.set(userId, connection);
    return connection;
  }

  getConnection(userId: string): RTCPeerConnection | undefined {
    return this.connectionPool.get(userId);
  }

  removeConnection(userId: string): void {
    const connection = this.connectionPool.get(userId);
    if (connection) {
      connection.close();
      this.connectionPool.delete(userId);
    }
  }

  cleanup(): void {
    this.connectionPool.forEach(connection => connection.close());
    this.connectionPool.clear();
  }
}
```

### Message Pagination

```typescript
// src/app/core/services/message-pagination.service.ts
@Injectable({
  providedIn: 'root'
})
export class MessagePaginationService {
  private messageCache = new Map<string, Message[]>();
  private loadingStates = new Map<string, boolean>();

  async loadMessages(
    channelId: string, 
    limit = 50, 
    before?: string
  ): Promise<Message[]> {
    if (this.loadingStates.get(channelId)) {
      return [];
    }

    this.loadingStates.set(channelId, true);

    try {
      const messages = await this.messageService.getMessages(channelId, limit, before);
      
      const existingMessages = this.messageCache.get(channelId) || [];
      const newMessages = [...existingMessages, ...messages];
      
      // Sort by creation date
      newMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      this.messageCache.set(channelId, newMessages);
      return messages;
    } finally {
      this.loadingStates.set(channelId, false);
    }
  }

  getCachedMessages(channelId: string): Message[] {
    return this.messageCache.get(channelId) || [];
  }

  addMessage(channelId: string, message: Message): void {
    const existingMessages = this.messageCache.get(channelId) || [];
    this.messageCache.set(channelId, [...existingMessages, message]);
  }

  updateMessage(channelId: string, message: Message): void {
    const existingMessages = this.messageCache.get(channelId) || [];
    const updatedMessages = existingMessages.map(m => 
      m.id === message.id ? message : m
    );
    this.messageCache.set(channelId, updatedMessages);
  }

  removeMessage(channelId: string, messageId: string): void {
    const existingMessages = this.messageCache.get(channelId) || [];
    const filteredMessages = existingMessages.filter(m => m.id !== messageId);
    this.messageCache.set(channelId, filteredMessages);
  }

  clearCache(channelId: string): void {
    this.messageCache.delete(channelId);
    this.loadingStates.delete(channelId);
  }
}
```

This comprehensive real-time communication system provides Discord-like functionality with Socket.IO for text messaging and WebRTC for voice/video communication, including screen sharing, presence tracking, and performance optimizations for scaling to thousands of users.
