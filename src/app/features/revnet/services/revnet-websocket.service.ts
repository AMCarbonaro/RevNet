import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WebSocketMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  channelId: string;
  timestamp: string;
  editedTimestamp?: string | null;
  type: number;
  tts: boolean;
  mentionEveryone: boolean;
  pinned: boolean;
  flags: number;
}

export interface TypingUser {
  userId: string;
  username: string;
  channelId: string;
}

export interface VoiceChannelUser {
  userId: string;
  username: string;
  channelId: string;
}

export interface WebRTCSignal {
  fromUserId: string;
  fromUsername: string;
  channelId: string;
  offer?: any;
  answer?: any;
  candidate?: any;
}

export interface FriendRequestEvent {
  request: any;
  fromUserId: string;
  fromUsername: string;
}

export interface FriendAcceptedEvent {
  request: any;
  byUserId: string;
  byUsername: string;
}

export interface DMOpenedEvent {
  channel: any;
  fromUserId: string;
  fromUsername: string;
}

@Injectable({
  providedIn: 'root'
})
export class RevNetWebSocketService {
  private socket: Socket | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  private messages = new Subject<WebSocketMessage>();
  private typingUsers = new Subject<TypingUser>();
  private stopTypingUsers = new Subject<TypingUser>();
  private voiceChannelUsers = new Subject<VoiceChannelUser[]>();
  private webrtcSignals = new Subject<WebRTCSignal>();
  private friendRequestReceived = new Subject<FriendRequestEvent>();
  private friendAccepted = new Subject<FriendAcceptedEvent>();
  private dmOpened = new Subject<DMOpenedEvent>();
  private groupDMOpened = new Subject<DMOpenedEvent>();

  // Observable streams
  public connected$ = this.connected.asObservable();
  public messages$ = this.messages.asObservable();
  public typingUsers$ = this.typingUsers.asObservable();
  public stopTypingUsers$ = this.stopTypingUsers.asObservable();
  public voiceChannelUsers$ = this.voiceChannelUsers.asObservable();
  public webrtcSignals$ = this.webrtcSignals.asObservable();
  public friendRequestReceived$ = this.friendRequestReceived.asObservable();
  public friendAccepted$ = this.friendAccepted.asObservable();
  public dmOpened$ = this.dmOpened.asObservable();
  public groupDMOpened$ = this.groupDMOpened.asObservable();

  constructor() {
    // Initialize socket immediately for better performance
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const wsUrl = environment.production 
      ? 'wss://revnet-backend.onrender.com' 
      : 'http://localhost:3000';

    this.socket = io(`${wsUrl}/revnet`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to RevNet WebSocket');
      this.connected.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from RevNet WebSocket');
      this.connected.next(false);
    });

    this.socket.on('connected', (data) => {
      console.log('WebSocket connected:', data);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Message events
    this.socket.on('message_received', (data) => {
      console.log('WebSocket received message:', data);
      this.messages.next(data.message);
    });

    this.socket.on('message_updated', (data) => {
      this.messages.next(data.message);
    });

    this.socket.on('message_deleted', (data) => {
      // Handle message deletion in the component
      console.log('Message deleted:', data);
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      this.typingUsers.next(data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.stopTypingUsers.next(data);
    });

    // Channel events
    this.socket.on('channel_joined', (data) => {
      console.log('Joined channel:', data);
    });

    this.socket.on('channel_left', (data) => {
      console.log('Left channel:', data);
    });

    this.socket.on('channel_created', (data) => {
      console.log('Channel created:', data);
    });

    this.socket.on('channel_updated', (data) => {
      console.log('Channel updated:', data);
    });

    this.socket.on('channel_deleted', (data) => {
      console.log('Channel deleted:', data);
    });

    // Voice channel events
    this.socket.on('voice_joined', (data) => {
      console.log('Joined voice channel:', data);
      this.voiceChannelUsers.next(data.participants);
    });

    this.socket.on('user_joined_voice', (data) => {
      console.log('User joined voice:', data);
    });

    this.socket.on('user_left_voice', (data) => {
      console.log('User left voice:', data);
    });

    // WebRTC events
    this.socket.on('voice_offer', (data) => {
      this.webrtcSignals.next(data);
    });

    this.socket.on('voice_answer', (data) => {
      this.webrtcSignals.next(data);
    });

    this.socket.on('ice_candidate', (data) => {
      this.webrtcSignals.next(data);
    });

    // Friend events
    this.socket.on('friend_request_received', (data) => {
      console.log('Friend request received:', data);
      this.friendRequestReceived.next(data);
    });

    this.socket.on('friend_accepted', (data) => {
      console.log('Friend accepted:', data);
      this.friendAccepted.next(data);
    });

    // DM events
    this.socket.on('dm_opened', (data) => {
      console.log('DM opened:', data);
      this.dmOpened.next(data);
    });

    this.socket.on('group_dm_opened', (data) => {
      console.log('Group DM opened:', data);
      this.groupDMOpened.next(data);
    });
  }

  // Connection methods
  connect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Channel methods
  joinChannel(channelId: string, serverId: string): void {
    if (this.socket) {
      console.log('WebSocket joining channel:', channelId, 'server:', serverId);
      this.socket.emit('join_channel', { channelId, serverId });
    }
  }

  leaveChannel(channelId: string): void {
    if (this.socket) {
      this.socket.emit('leave_channel', { channelId });
    }
  }

  // Message methods
  sendMessage(channelId: string, content: string, type: number = 0): void {
    if (this.socket) {
      this.socket.emit('send_message', { channelId, content, type });
    }
  }

  editMessage(messageId: string, content: string): void {
    if (this.socket) {
      this.socket.emit('edit_message', { messageId, content });
    }
  }

  deleteMessage(messageId: string): void {
    if (this.socket) {
      this.socket.emit('delete_message', { messageId });
    }
  }

  // Typing methods
  startTyping(channelId: string): void {
    if (this.socket) {
      this.socket.emit('typing_start', { channelId });
    }
  }

  stopTyping(channelId: string): void {
    if (this.socket) {
      this.socket.emit('typing_stop', { channelId });
    }
  }

  // Voice channel methods
  joinVoiceChannel(channelId: string, serverId: string): void {
    if (this.socket) {
      this.socket.emit('join_voice_channel', { channelId, serverId });
    }
  }

  leaveVoiceChannel(channelId: string): void {
    if (this.socket) {
      this.socket.emit('leave_voice_channel', { channelId });
    }
  }

  // WebRTC methods
  sendVoiceOffer(channelId: string, targetUserId: string, offer: any): void {
    if (this.socket) {
      this.socket.emit('voice_offer', { channelId, targetUserId, offer });
    }
  }

  sendVoiceAnswer(channelId: string, targetUserId: string, answer: any): void {
    if (this.socket) {
      this.socket.emit('voice_answer', { channelId, targetUserId, answer });
    }
  }

  sendIceCandidate(channelId: string, targetUserId: string, candidate: any): void {
    if (this.socket) {
      this.socket.emit('ice_candidate', { channelId, targetUserId, candidate });
    }
  }

  // Friend methods
  sendFriendRequest(friendUsername: string): void {
    if (this.socket) {
      this.socket.emit('friend_request', { friendUsername });
    }
  }

  acceptFriendRequest(requestId: string): void {
    if (this.socket) {
      this.socket.emit('friend_accept', { requestId });
    }
  }

  declineFriendRequest(requestId: string): void {
    if (this.socket) {
      this.socket.emit('friend_decline', { requestId });
    }
  }

  // DM methods
  openDM(recipientId: string): void {
    if (this.socket) {
      this.socket.emit('dm_open', { recipientId });
    }
  }

  openGroupDM(recipientIds: string[], name?: string): void {
    if (this.socket) {
      this.socket.emit('group_dm_open', { recipientIds, name });
    }
  }

  // Utility methods
  getSocket(): Socket | null {
    return this.socket;
  }

  // Cleanup
  ngOnDestroy(): void {
    this.disconnect();
  }
}