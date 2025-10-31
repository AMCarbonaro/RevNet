import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { ServerSidebarComponent } from '../server-sidebar/server-sidebar.component';
import { ChannelSidebarComponent } from '../channel-sidebar/channel-sidebar.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { VoiceChatComponent } from '../voice-chat/voice-chat.component';
import { MemberListComponent } from '../member-list/member-list.component';
import { RevNetApiService } from '../../services/revnet-api.service';
import { RevNetWebSocketService } from '../../services/revnet-websocket.service';
import { Server, Channel, Message, User, ChannelType } from '../../store/models/revnet.models';
import { VoiceChannelParticipant } from '../voice-chat/voice-chat.component';

interface Member {
  id: string;
  username: string;
  discriminator: string;
  status: 'online' | 'away' | 'dnd' | 'offline';
  isOwner: boolean;
  isAdmin: boolean;
  avatar?: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    ServerSidebarComponent,
    ChannelSidebarComponent,
    ChatAreaComponent,
    VoiceChatComponent,
    MemberListComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  servers: Server[] = [];
  channels: Channel[] = [];
  messages: Message[] = [];
  members: Member[] = [];
  voiceParticipants: VoiceChannelParticipant[] = [];
  currentUser: User | null = null;
  
  selectedServerId: string | null = null;
  selectedChannelId: string | null = null;
  selectedServer: Server | null = null;
  selectedChannel: Channel | null = null;
  
  mobileMenuOpen = false;
  channelSidebarOpen = false;
  memberListOpen = false;
  
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private revnetApiService: RevNetApiService,
    private websocketService: RevNetWebSocketService
  ) {}

  ngOnInit(): void {
    // Initialize current user (mock for now, replace with real auth later)
    this.currentUser = {
      id: 'user1',
      username: 'CurrentUser',
      discriminator: '0001',
      avatar: null,
      status: 'online',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      bot: false,
      system: false,
      mfa_enabled: false,
      banner: null,
      accent_color: null,
      locale: 'en-US',
      verified: false,
      email: null,
      flags: 0,
      premium_type: 0,
      public_flags: 0
    };

    // Connect WebSocket
    if (!this.websocketService.isConnected()) {
      this.websocketService.connect();
    }

    // Subscribe to WebSocket messages
    this.websocketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.channelId === this.selectedChannelId) {
          // Add message to current channel
          const newMessage: Message = {
            id: message.id,
            channel_id: message.channelId,
            author: message.author as any,
            content: message.content,
            timestamp: message.timestamp,
            edited_timestamp: message.editedTimestamp || null,
            tts: message.tts,
            mention_everyone: message.mentionEveryone,
            mentions: [],
            mention_roles: [],
            attachments: [],
            embeds: [],
            reactions: [],
            nonce: null,
            pinned: message.pinned,
            type: message.type,
            flags: message.flags
          };
          this.messages = [...this.messages, newMessage];
        }
      });

    // Load initial data
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Leave channel if selected
    if (this.selectedChannelId) {
      this.websocketService.leaveChannel(this.selectedChannelId);
    }
  }

  loadInitialData(): void {
    this.loading = true;
    this.error = null;

    this.revnetApiService.getServers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (servers) => {
          this.servers = servers;
          this.loading = false;
          
          // Select first server by default
          if (this.servers.length > 0) {
            this.selectedServerId = this.servers[0].id;
            this.selectedServer = this.servers[0];
            this.loadServerData(this.selectedServerId);
          }
        },
        error: (err) => {
          console.error('Error loading servers:', err);
          this.error = 'Failed to load servers';
          this.loading = false;
        }
      });
  }

  loadServerData(serverId: string): void {
    this.loading = true;
    this.error = null;

    this.revnetApiService.getChannels(serverId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channels) => {
          this.channels = channels;
          this.members = []; // TODO: Load members from API
          this.loading = false;
          
          // Select first channel by default
          if (this.channels.length > 0) {
            this.selectedChannelId = this.channels[0].id;
            this.selectedChannel = this.channels[0];
            this.loadChannelData(this.selectedChannelId);
          }
        },
        error: (err) => {
          console.error('Error loading channels:', err);
          this.error = 'Failed to load channels';
          this.loading = false;
        }
      });
  }

  loadChannelData(channelId: string): void {
    const channel = this.channels.find(c => c.id === channelId);
    
    if (!channel) {
      return;
    }

    // Leave previous channel
    if (this.selectedChannelId && this.selectedChannelId !== channelId) {
      this.websocketService.leaveChannel(this.selectedChannelId);
    }

    this.loading = true;
    this.error = null;

    if (channel.type === ChannelType.VOICE) {
      // For voice channels, load participants
      this.voiceParticipants = []; // TODO: Load from API
      this.messages = [];
      this.loading = false;
      
      // Join voice channel via WebSocket
      if (this.selectedServerId) {
        this.websocketService.joinVoiceChannel(channelId, this.selectedServerId);
      }
    } else {
      // For text channels, load messages
      this.voiceParticipants = [];
      
      // Join channel via WebSocket
      if (this.selectedServerId) {
        this.websocketService.joinChannel(channelId, this.selectedServerId);
      }

      this.revnetApiService.getMessages(channelId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.messages = response.messages || [];
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading messages:', err);
            this.error = 'Failed to load messages';
            this.loading = false;
          }
        });
    }
  }

  onServerSelected(serverId: string): void {
    this.selectedServerId = serverId;
    this.selectedServer = this.servers.find(s => s.id === serverId) || null;
    this.selectedChannelId = null;
    this.selectedChannel = null;
    this.messages = [];
    this.voiceParticipants = [];
    
    // Close mobile menu when server is selected on mobile
    if (window.innerWidth <= 480) {
      this.mobileMenuOpen = false;
    }
    
    this.loadServerData(serverId);
  }

  onChannelSelected(channelId: string): void {
    this.selectedChannelId = channelId;
    this.selectedChannel = this.channels.find(c => c.id === channelId) || null;
    
    if (this.selectedChannel) {
      this.loadChannelData(channelId);
    }
    
    // Close mobile menu when channel is selected
    if (window.innerWidth <= 480) {
      this.mobileMenuOpen = false;
      this.channelSidebarOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleChannelSidebar(): void {
    this.channelSidebarOpen = !this.channelSidebarOpen;
  }

  toggleMemberList(): void {
    this.memberListOpen = !this.memberListOpen;
  }
}
