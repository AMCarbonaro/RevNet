# Discord Interface Documentation

## Overview

Revolution Network features a complete Discord-like interface built with Angular 17+ that provides an exact replica of Discord's user experience. The interface includes server (Revolt) management, channel navigation, real-time messaging, voice/video chat, and member management with a cyberpunk aesthetic overlay.

## 🏗️ Interface Architecture

### Main Layout Structure

```typescript
// src/app/features/discord/components/discord-layout/discord-layout.component.ts
@Component({
  selector: 'app-discord-layout',
  standalone: true,
  template: `
    <div class="discord-layout">
      <!-- Server Sidebar (Left) -->
      <app-server-sidebar
        [servers]="servers$ | async"
        [currentServer]="currentServer$ | async"
        (serverSelected)="onServerSelected($event)"
        (addServer)="onAddServer()">
      </app-server-sidebar>

      <!-- Channel Sidebar (Middle) -->
      <app-channel-sidebar
        *ngIf="currentServer$ | async as server"
        [server]="server"
        [channels]="channels$ | async"
        [currentChannel]="currentChannel$ | async"
        (channelSelected)="onChannelSelected($event)"
        (createChannel)="onCreateChannel()">
      </app-channel-sidebar>

      <!-- Main Chat Area -->
      <app-chat-area
        *ngIf="currentChannel$ | async as channel"
        [channel]="channel"
        [messages]="messages$ | async"
        [typingUsers]="typingUsers$ | async"
        (sendMessage)="onSendMessage($event)"
        (typing)="onTyping($event)">
      </app-chat-area>

      <!-- Member List (Right) -->
      <app-member-list
        *ngIf="currentServer$ | async as server"
        [server]="server"
        [members]="members$ | async"
        [onlineCount]="onlineCount$ | async">
      </app-member-list>

      <!-- Voice Channel Overlay -->
      <app-voice-overlay
        *ngIf="voiceChannel$ | async as voiceChannel"
        [channel]="voiceChannel"
        [participants]="voiceParticipants$ | async"
        (leaveVoice)="onLeaveVoice()"
        (toggleMute)="onToggleMute()"
        (toggleDeafen)="onToggleDeafen()">
      </app-voice-overlay>
    </div>
  `
})
export class DiscordLayoutComponent {
  servers$ = this.store.select(selectServers);
  currentServer$ = this.store.select(selectCurrentServer);
  channels$ = this.store.select(selectChannels);
  currentChannel$ = this.store.select(selectCurrentChannel);
  messages$ = this.store.select(selectMessages);
  typingUsers$ = this.store.select(selectTypingUsers);
  members$ = this.store.select(selectMembers);
  onlineCount$ = this.store.select(selectOnlineCount);
  voiceChannel$ = this.store.select(selectVoiceChannel);
  voiceParticipants$ = this.store.select(selectVoiceParticipants);

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {}

  onServerSelected(serverId: string): void {
    this.store.dispatch(ServerActions.selectServer({ serverId }));
    this.router.navigate(['/discord', serverId]);
  }

  onChannelSelected(channelId: string): void {
    this.store.dispatch(ChannelActions.selectChannel({ channelId }));
  }

  onSendMessage(message: SendMessageRequest): void {
    this.store.dispatch(MessageActions.sendMessage({ message }));
  }

  onTyping(isTyping: boolean): void {
    this.store.dispatch(MessageActions.setTyping({ isTyping }));
  }
}
```

## 🏛️ Server Sidebar

### Server List Component

```typescript
// src/app/features/discord/components/server-sidebar/server-sidebar.component.ts
@Component({
  selector: 'app-server-sidebar',
  standalone: true,
  template: `
    <div class="server-sidebar">
      <!-- Home Button -->
      <div class="server-item home" (click)="goHome()">
        <div class="server-icon">
          <i class="icon-home"></i>
        </div>
      </div>

      <!-- Server List -->
      <div class="server-list">
        <div 
          *ngFor="let server of servers; trackBy: trackByServerId"
          class="server-item"
          [class.active]="server.id === currentServer?.id"
          [class.unread]="server.unreadCount > 0"
          (click)="selectServer(server.id)"
          (contextmenu)="openServerMenu($event, server)">
          
          <!-- Server Icon -->
          <div class="server-icon">
            <img 
              *ngIf="server.icon" 
              [src]="server.icon" 
              [alt]="server.name">
            <span 
              *ngIf="!server.icon" 
              class="server-initials">
              {{ getServerInitials(server.name) }}
            </span>
          </div>

          <!-- Unread Indicator -->
          <div 
            *ngIf="server.unreadCount > 0" 
            class="unread-indicator">
            {{ server.unreadCount > 99 ? '99+' : server.unreadCount }}
          </div>

          <!-- Server Name Tooltip -->
          <div class="server-tooltip">
            {{ server.name }}
          </div>
        </div>
      </div>

      <!-- Add Server Button -->
      <div class="server-item add-server" (click)="openCreateServerModal()">
        <div class="server-icon">
          <i class="icon-plus"></i>
        </div>
        <div class="server-tooltip">
          Add a Server
        </div>
      </div>

      <!-- Explore Servers Button -->
      <div class="server-item explore" (click)="openExploreModal()">
        <div class="server-icon">
          <i class="icon-compass"></i>
        </div>
        <div class="server-tooltip">
          Explore Public Servers
        </div>
      </div>

      <!-- Download App Button -->
      <div class="server-item download" (click)="downloadApp()">
        <div class="server-icon">
          <i class="icon-download"></i>
        </div>
        <div class="server-tooltip">
          Download App
        </div>
      </div>
    </div>
  `
})
export class ServerSidebarComponent {
  @Input() servers: Server[] = [];
  @Input() currentServer: Server | null = null;

  @Output() serverSelected = new EventEmitter<string>();
  @Output() addServer = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  trackByServerId(index: number, server: Server): string {
    return server.id;
  }

  getServerInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  selectServer(serverId: string): void {
    this.serverSelected.emit(serverId);
  }

  goHome(): void {
    this.store.dispatch(ServerActions.goHome());
  }

  openCreateServerModal(): void {
    const dialogRef = this.dialog.open(CreateServerModalComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(server => {
      if (server) {
        this.store.dispatch(ServerActions.createServer({ server }));
      }
    });
  }

  openServerMenu(event: MouseEvent, server: Server): void {
    event.preventDefault();
    // Open context menu
  }
}
```

### Server Context Menu

```typescript
// src/app/features/discord/components/server-context-menu/server-context-menu.component.ts
@Component({
  selector: 'app-server-context-menu',
  standalone: true,
  template: `
    <div class="server-context-menu">
      <div class="menu-item" (click)="invitePeople()">
        <i class="icon-user-plus"></i>
        Invite People
      </div>
      
      <div class="menu-item" (click)="serverSettings()">
        <i class="icon-settings"></i>
        Server Settings
      </div>
      
      <div class="menu-item" (click)="createChannel()">
        <i class="icon-hash"></i>
        Create Channel
      </div>
      
      <div class="menu-item" (click)="createCategory()">
        <i class="icon-folder-plus"></i>
        Create Category
      </div>
      
      <div class="menu-separator"></div>
      
      <div class="menu-item" (click)="notificationSettings()">
        <i class="icon-bell"></i>
        Notification Settings
      </div>
      
      <div class="menu-item" (click)="privacySettings()">
        <i class="icon-shield"></i>
        Privacy Settings
      </div>
      
      <div class="menu-separator"></div>
      
      <div class="menu-item danger" (click)="leaveServer()">
        <i class="icon-log-out"></i>
        Leave Server
      </div>
    </div>
  `
})
export class ServerContextMenuComponent {
  @Input() server!: Server;

  constructor(
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  invitePeople(): void {
    const dialogRef = this.dialog.open(InvitePeopleModalComponent, {
      data: { server: this.server },
      width: '500px'
    });
  }

  serverSettings(): void {
    this.store.dispatch(ServerActions.openSettings({ serverId: this.server.id }));
  }

  createChannel(): void {
    const dialogRef = this.dialog.open(CreateChannelModalComponent, {
      data: { serverId: this.server.id },
      width: '500px'
    });
  }

  leaveServer(): void {
    if (confirm(`Are you sure you want to leave "${this.server.name}"?`)) {
      this.store.dispatch(ServerActions.leaveServer({ serverId: this.server.id }));
    }
  }
}
```

## 📋 Channel Sidebar

### Channel List Component

```typescript
// src/app/features/discord/components/channel-sidebar/channel-sidebar.component.ts
@Component({
  selector: 'app-channel-sidebar',
  standalone: true,
  template: `
    <div class="channel-sidebar">
      <!-- Server Header -->
      <div class="server-header">
        <h2 class="server-name">{{ server.name }}</h2>
        <button 
          class="server-menu-btn"
          (click)="openServerMenu($event)">
          <i class="icon-chevron-down"></i>
        </button>
      </div>

      <!-- Channel Categories -->
      <div class="channel-categories">
        <div 
          *ngFor="let category of channelCategories; trackBy: trackByCategoryId"
          class="channel-category">
          
          <div 
            class="category-header"
            (click)="toggleCategory(category.id)">
            <i 
              class="icon-chevron-right"
              [class.rotated]="!category.collapsed">
            </i>
            <span class="category-name">{{ category.name }}</span>
          </div>

          <div 
            class="category-channels"
            [class.collapsed]="category.collapsed">
            
            <div 
              *ngFor="let channel of category.channels; trackBy: trackByChannelId"
              class="channel-item"
              [class.active]="channel.id === currentChannel?.id"
              [class.unread]="channel.unreadCount > 0"
              (click)="selectChannel(channel.id)"
              (contextmenu)="openChannelMenu($event, channel)">
              
              <div class="channel-icon">
                <i 
                  [class]="getChannelIcon(channel.type)"
                  *ngIf="channel.type !== 'text'">
                </i>
                <span *ngIf="channel.type === 'text'">#</span>
              </div>
              
              <span class="channel-name">{{ channel.name }}</span>
              
              <div 
                *ngIf="channel.unreadCount > 0" 
                class="unread-indicator">
                {{ channel.unreadCount > 99 ? '99+' : channel.unreadCount }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Section -->
      <div class="user-section">
        <div class="user-info">
          <div class="user-avatar">
            <img [src]="currentUser?.avatar" [alt]="currentUser?.name">
            <div class="status-indicator" [class]="currentUser?.status"></div>
          </div>
          
          <div class="user-details">
            <div class="username">{{ currentUser?.name }}</div>
            <div class="user-tag">#{{ currentUser?.tag }}</div>
          </div>
        </div>

        <div class="user-actions">
          <button 
            class="user-action-btn"
            (click)="openUserSettings()">
            <i class="icon-settings"></i>
          </button>
          
          <button 
            class="user-action-btn"
            (click)="openUserMenu()">
            <i class="icon-more"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChannelSidebarComponent {
  @Input() server!: Server;
  @Input() channels: Channel[] = [];
  @Input() currentChannel: Channel | null = null;
  @Input() currentUser: User | null = null;

  @Output() channelSelected = new EventEmitter<string>();
  @Output() createChannel = new EventEmitter<void>();

  channelCategories: ChannelCategory[] = [];

  constructor(
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.groupChannelsByCategory();
  }

  ngOnChanges(): void {
    this.groupChannelsByCategory();
  }

  groupChannelsByCategory(): void {
    const categories: { [key: string]: Channel[] } = {};
    
    this.channels.forEach(channel => {
      const categoryName = channel.category || 'Text Channels';
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(channel);
    });

    this.channelCategories = Object.entries(categories).map(([name, channels]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      channels: channels.sort((a, b) => a.position - b.position),
      collapsed: false
    }));
  }

  getChannelIcon(type: ChannelType): string {
    switch (type) {
      case 'voice': return 'icon-phone';
      case 'video': return 'icon-video';
      case 'stage': return 'icon-mic';
      default: return 'icon-hash';
    }
  }

  selectChannel(channelId: string): void {
    this.channelSelected.emit(channelId);
  }

  toggleCategory(categoryId: string): void {
    this.channelCategories = this.channelCategories.map(category =>
      category.id === categoryId 
        ? { ...category, collapsed: !category.collapsed }
        : category
    );
  }

  openChannelMenu(event: MouseEvent, channel: Channel): void {
    event.preventDefault();
    // Open channel context menu
  }

  trackByCategoryId(index: number, category: ChannelCategory): string {
    return category.id;
  }

  trackByChannelId(index: number, channel: Channel): string {
    return channel.id;
  }
}
```

## 💬 Chat Area

### Message List Component

```typescript
// src/app/features/discord/components/chat-area/chat-area.component.ts
@Component({
  selector: 'app-chat-area',
  standalone: true,
  template: `
    <div class="chat-area">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="channel-info">
          <i 
            [class]="getChannelIcon(channel.type)"
            *ngIf="channel.type !== 'text'">
          </i>
          <span *ngIf="channel.type === 'text'">#</span>
          <h1 class="channel-name">{{ channel.name }}</h1>
        </div>

        <div class="channel-actions">
          <button 
            class="action-btn"
            (click)="toggleThreads()">
            <i class="icon-message-square"></i>
          </button>
          
          <button 
            class="action-btn"
            (click)="toggleNotifications()">
            <i 
              [class]="channel.notifications ? 'icon-bell' : 'icon-bell-off'">
            </i>
          </button>
          
          <button 
            class="action-btn"
            (click)="togglePinned()">
            <i class="icon-pin"></i>
          </button>
          
          <button 
            class="action-btn"
            (click)="openChannelSettings()">
            <i class="icon-settings"></i>
          </button>
        </div>
      </div>

      <!-- Messages Container -->
      <div 
        class="messages-container"
        #messagesContainer
        (scroll)="onScroll($event)">
        
        <!-- Loading Spinner -->
        <div 
          *ngIf="isLoadingMessages" 
          class="loading-messages">
          <div class="spinner"></div>
        </div>

        <!-- Messages -->
        <div class="messages">
          <div 
            *ngFor="let message of messages; trackBy: trackByMessageId"
            class="message-group"
            [class.first-in-group]="isFirstInGroup(message, messages)"
            [class.last-in-group]="isLastInGroup(message, messages)">
            
            <div class="message" [class.own-message]="isOwnMessage(message)">
              <!-- Message Avatar -->
              <div 
                class="message-avatar"
                *ngIf="isFirstInGroup(message, messages)">
                <img 
                  [src]="message.author.avatar" 
                  [alt]="message.author.name">
              </div>

              <!-- Message Content -->
              <div class="message-content">
                <!-- Message Header -->
                <div 
                  class="message-header"
                  *ngIf="isFirstInGroup(message, messages)">
                  <span class="author-name" [style.color]="message.author.roleColor">
                    {{ message.author.name }}
                  </span>
                  <span class="author-role" *ngIf="message.author.role">
                    {{ message.author.role }}
                  </span>
                  <span class="message-timestamp">
                    {{ message.createdAt | date:'short' }}
                  </span>
                </div>

                <!-- Message Body -->
                <div class="message-body">
                  <div 
                    class="message-text"
                    [innerHTML]="formatMessage(message.content)">
                  </div>

                  <!-- Message Attachments -->
                  <div 
                    *ngIf="message.attachments?.length" 
                    class="message-attachments">
                    <div 
                      *ngFor="let attachment of message.attachments"
                      class="attachment">
                      <img 
                        *ngIf="isImage(attachment.type)"
                        [src]="attachment.url" 
                        [alt]="attachment.filename"
                        (click)="openImageModal(attachment)">
                      
                      <div 
                        *ngIf="!isImage(attachment.type)"
                        class="file-attachment">
                        <i [class]="getFileIcon(attachment.type)"></i>
                        <div class="file-info">
                          <div class="filename">{{ attachment.filename }}</div>
                          <div class="filesize">{{ formatFileSize(attachment.size) }}</div>
                        </div>
                        <button 
                          class="download-btn"
                          (click)="downloadFile(attachment)">
                          <i class="icon-download"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Message Embeds -->
                  <div 
                    *ngIf="message.embeds?.length" 
                    class="message-embeds">
                    <div 
                      *ngFor="let embed of message.embeds"
                      class="embed">
                      <div class="embed-content">
                        <div class="embed-title" *ngIf="embed.title">
                          <a [href]="embed.url" target="_blank">{{ embed.title }}</a>
                        </div>
                        <div class="embed-description" *ngIf="embed.description">
                          {{ embed.description }}
                        </div>
                        <div class="embed-fields" *ngIf="embed.fields?.length">
                          <div 
                            *ngFor="let field of embed.fields"
                            class="embed-field"
                            [class.inline]="field.inline">
                            <div class="field-name">{{ field.name }}</div>
                            <div class="field-value">{{ field.value }}</div>
                          </div>
                        </div>
                        <div class="embed-footer" *ngIf="embed.footer">
                          {{ embed.footer }}
                        </div>
                      </div>
                      <div class="embed-thumbnail" *ngIf="embed.thumbnail">
                        <img [src]="embed.thumbnail" [alt]="embed.title">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Message Reactions -->
                <div 
                  *ngIf="message.reactions?.length" 
                  class="message-reactions">
                  <div 
                    *ngFor="let reaction of message.reactions"
                    class="reaction"
                    [class.reacted]="hasReacted(reaction, message.author.id)"
                    (click)="toggleReaction(message.id, reaction.emoji)">
                    <span class="reaction-emoji">{{ reaction.emoji }}</span>
                    <span class="reaction-count">{{ reaction.count }}</span>
                  </div>
                </div>
              </div>

              <!-- Message Actions -->
              <div class="message-actions">
                <button 
                  class="action-btn"
                  (click)="addReaction(message.id, '👍')">
                  <i class="icon-thumbs-up"></i>
                </button>
                <button 
                  class="action-btn"
                  (click)="replyToMessage(message)">
                  <i class="icon-reply"></i>
                </button>
                <button 
                  class="action-btn"
                  (click)="openMessageMenu($event, message)">
                  <i class="icon-more"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Typing Indicators -->
        <div 
          *ngIf="typingUsers?.length" 
          class="typing-indicators">
          <div class="typing-text">
            <span *ngFor="let user of typingUsers; let last = last">
              {{ user.name }}<span *ngIf="!last">, </span>
            </span>
            <span *ngIf="typingUsers.length === 1"> is typing</span>
            <span *ngIf="typingUsers.length > 1"> are typing</span>
            <span class="typing-dots">...</span>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <div class="message-input-wrapper">
          <button 
            class="attachment-btn"
            (click)="openAttachmentMenu()">
            <i class="icon-plus"></i>
          </button>

          <div class="message-input">
            <textarea
              #messageInput
              [(ngModel)]="messageText"
              (keydown)="onKeyDown($event)"
              (input)="onInput()"
              placeholder="Message #{{ channel.name }}"
              rows="1"
              maxlength="2000">
            </textarea>

            <div class="input-actions">
              <button 
                class="emoji-btn"
                (click)="openEmojiPicker()">
                <i class="icon-smile"></i>
              </button>
            </div>
          </div>

          <button 
            class="send-btn"
            [disabled]="!messageText.trim()"
            (click)="sendMessage()">
            <i class="icon-send"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatAreaComponent {
  @Input() channel!: Channel;
  @Input() messages: Message[] = [];
  @Input() typingUsers: User[] = [];
  @Input() isLoadingMessages = false;

  @Output() sendMessage = new EventEmitter<SendMessageRequest>();
  @Output() typing = new EventEmitter<boolean>();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  messageText = '';
  isTyping = false;
  typingTimeout: any;

  constructor(
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.scrollToBottom();
  }

  ngOnChanges(): void {
    this.scrollToBottom();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onInput(): void {
    if (!this.isTyping) {
      this.isTyping = true;
      this.typing.emit(true);
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.typing.emit(false);
    }, 1000);
  }

  sendMessage(): void {
    if (!this.messageText.trim()) return;

    const message: SendMessageRequest = {
      channelId: this.channel.id,
      content: this.messageText.trim(),
      replyTo: null
    };

    this.sendMessage.emit(message);
    this.messageText = '';
    this.isTyping = false;
    this.typing.emit(false);
  }

  formatMessage(content: string): string {
    // Format Discord-style markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
      .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  }

  isFirstInGroup(message: Message, messages: Message[]): boolean {
    const index = messages.indexOf(message);
    if (index === 0) return true;
    
    const prevMessage = messages[index - 1];
    return prevMessage.author.id !== message.author.id ||
           (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 300000; // 5 minutes
  }

  isLastInGroup(message: Message, messages: Message[]): boolean {
    const index = messages.indexOf(message);
    if (index === messages.length - 1) return true;
    
    const nextMessage = messages[index + 1];
    return nextMessage.author.id !== message.author.id ||
           (new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) > 300000; // 5 minutes
  }

  isOwnMessage(message: Message): boolean {
    return message.author.id === this.currentUser?.id;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }
}
```

## 👥 Member List

### Member List Component

```typescript
// src/app/features/discord/components/member-list/member-list.component.ts
@Component({
  selector: 'app-member-list',
  standalone: true,
  template: `
    <div class="member-list">
      <!-- Member List Header -->
      <div class="member-list-header">
        <h3>Members — {{ members.length }}</h3>
        <div class="member-actions">
          <button 
            class="action-btn"
            (click)="openInviteModal()">
            <i class="icon-user-plus"></i>
          </button>
        </div>
      </div>

      <!-- Member Groups -->
      <div class="member-groups">
        <div 
          *ngFor="let group of memberGroups; trackBy: trackByGroupName"
          class="member-group">
          
          <div 
            class="group-header"
            (click)="toggleGroup(group.name)">
            <i 
              class="icon-chevron-right"
              [class.rotated]="!group.collapsed">
            </i>
            <span class="group-name">{{ group.name }}</span>
            <span class="group-count">{{ group.members.length }}</span>
          </div>

          <div 
            class="group-members"
            [class.collapsed]="group.collapsed">
            
            <div 
              *ngFor="let member of group.members; trackBy: trackByMemberId"
              class="member-item"
              [class.online]="member.status === 'online'"
              [class.away]="member.status === 'away'"
              [class.busy]="member.status === 'busy'"
              [class.invisible]="member.status === 'invisible'"
              (click)="openMemberProfile(member)"
              (contextmenu)="openMemberMenu($event, member)">
              
              <div class="member-avatar">
                <img [src]="member.avatar" [alt]="member.name">
                <div class="status-indicator" [class]="member.status"></div>
              </div>

              <div class="member-info">
                <div class="member-name">
                  {{ member.name }}
                  <span 
                    *ngIf="member.isBot" 
                    class="bot-tag">
                    BOT
                  </span>
                </div>
                <div class="member-activity" *ngIf="member.activity">
                  {{ member.activity }}
                </div>
              </div>

              <div class="member-actions">
                <button 
                  class="action-btn"
                  (click)="startDirectMessage(member)">
                  <i class="icon-message-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MemberListComponent {
  @Input() server!: Server;
  @Input() members: ServerMember[] = [];
  @Input() onlineCount = 0;

  memberGroups: MemberGroup[] = [];

  constructor(
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.groupMembers();
  }

  ngOnChanges(): void {
    this.groupMembers();
  }

  groupMembers(): void {
    const groups: { [key: string]: ServerMember[] } = {
      'Online': [],
      'Idle': [],
      'Do Not Disturb': [],
      'Offline': []
    };

    this.members.forEach(member => {
      switch (member.status) {
        case 'online':
          groups['Online'].push(member);
          break;
        case 'away':
          groups['Idle'].push(member);
          break;
        case 'busy':
          groups['Do Not Disturb'].push(member);
          break;
        case 'invisible':
        default:
          groups['Offline'].push(member);
          break;
      }
    });

    this.memberGroups = Object.entries(groups)
      .filter(([_, members]) => members.length > 0)
      .map(([name, members]) => ({
        name,
        members: members.sort((a, b) => a.name.localeCompare(b.name)),
        collapsed: false
      }));
  }

  toggleGroup(groupName: string): void {
    this.memberGroups = this.memberGroups.map(group =>
      group.name === groupName 
        ? { ...group, collapsed: !group.collapsed }
        : group
    );
  }

  openMemberProfile(member: ServerMember): void {
    const dialogRef = this.dialog.open(MemberProfileModalComponent, {
      data: { member, server: this.server },
      width: '400px'
    });
  }

  openMemberMenu(event: MouseEvent, member: ServerMember): void {
    event.preventDefault();
    // Open member context menu
  }

  trackByGroupName(index: number, group: MemberGroup): string {
    return group.name;
  }

  trackByMemberId(index: number, member: ServerMember): string {
    return member.id;
  }
}
```

## 🎤 Voice Channel Overlay

### Voice Channel Component

```typescript
// src/app/features/discord/components/voice-overlay/voice-overlay.component.ts
@Component({
  selector: 'app-voice-overlay',
  standalone: true,
  template: `
    <div class="voice-overlay">
      <div class="voice-container">
        <!-- Voice Header -->
        <div class="voice-header">
          <div class="channel-info">
            <i class="icon-phone"></i>
            <h3>{{ channel.name }}</h3>
          </div>
          <button 
            class="close-btn"
            (click)="leaveVoice()">
            <i class="icon-x"></i>
          </button>
        </div>

        <!-- Participants Grid -->
        <div class="participants-grid">
          <div 
            *ngFor="let participant of participants; trackBy: trackByParticipantId"
            class="participant-card"
            [class.speaking]="participant.isSpeaking"
            [class.muted]="participant.isMuted">
            
            <div class="participant-avatar">
              <img [src]="participant.avatar" [alt]="participant.name">
              <div class="status-indicator" [class]="participant.status"></div>
            </div>

            <div class="participant-info">
              <div class="participant-name">{{ participant.name }}</div>
              <div class="participant-status">
                <span *ngIf="participant.isMuted" class="muted">Muted</span>
                <span *ngIf="participant.isDeafened" class="deafened">Deafened</span>
                <span *ngIf="participant.isSpeaking" class="speaking">Speaking</span>
              </div>
            </div>

            <div class="participant-actions">
              <button 
                *ngIf="canManageParticipant(participant)"
                class="action-btn"
                (click)="muteParticipant(participant)">
                <i class="icon-mic-off"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Voice Controls -->
        <div class="voice-controls">
          <div class="control-buttons">
            <button 
              class="control-btn mute"
              [class.active]="isMuted"
              (click)="toggleMute()">
              <i [class]="isMuted ? 'icon-mic-off' : 'icon-mic'"></i>
            </button>

            <button 
              class="control-btn deafen"
              [class.active]="isDeafened"
              (click)="toggleDeafen()">
              <i [class]="isDeafened ? 'icon-volume-x' : 'icon-volume-2'"></i>
            </button>

            <button 
              class="control-btn settings"
              (click)="openVoiceSettings()">
              <i class="icon-settings"></i>
            </button>

            <button 
              class="control-btn leave"
              (click)="leaveVoice()">
              <i class="icon-phone-off"></i>
            </button>
          </div>

          <!-- Voice Settings -->
          <div class="voice-settings" *ngIf="showSettings">
            <div class="setting-group">
              <label>Microphone</label>
              <select [(ngModel)]="selectedMicrophone">
                <option 
                  *ngFor="let mic of microphones" 
                  [value]="mic.deviceId">
                  {{ mic.label }}
                </option>
              </select>
            </div>

            <div class="setting-group">
              <label>Speaker</label>
              <select [(ngModel)]="selectedSpeaker">
                <option 
                  *ngFor="let speaker of speakers" 
                  [value]="speaker.deviceId">
                  {{ speaker.label }}
                </option>
              </select>
            </div>

            <div class="setting-group">
              <label>Input Volume</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                [(ngModel)]="inputVolume"
                (input)="updateInputVolume($event)">
            </div>

            <div class="setting-group">
              <label>Output Volume</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                [(ngModel)]="outputVolume"
                (input)="updateOutputVolume($event)">
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VoiceOverlayComponent {
  @Input() channel!: Channel;
  @Input() participants: VoiceParticipant[] = [];

  @Output() leaveVoice = new EventEmitter<void>();
  @Output() toggleMute = new EventEmitter<void>();
  @Output() toggleDeafen = new EventEmitter<void>();

  isMuted = false;
  isDeafened = false;
  showSettings = false;
  selectedMicrophone = '';
  selectedSpeaker = '';
  inputVolume = 100;
  outputVolume = 100;
  microphones: MediaDeviceInfo[] = [];
  speakers: MediaDeviceInfo[] = [];

  constructor(
    private voiceService: VoiceService,
    private store: Store<AppState>
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadAudioDevices();
  }

  async loadAudioDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.microphones = devices.filter(device => device.kind === 'audioinput');
      this.speakers = devices.filter(device => device.kind === 'audiooutput');
      
      if (this.microphones.length > 0) {
        this.selectedMicrophone = this.microphones[0].deviceId;
      }
      if (this.speakers.length > 0) {
        this.selectedSpeaker = this.speakers[0].deviceId;
      }
    } catch (error) {
      console.error('Failed to load audio devices:', error);
    }
  }

  onToggleMute(): void {
    this.isMuted = !this.isMuted;
    this.toggleMute.emit();
  }

  onToggleDeafen(): void {
    this.isDeafened = !this.isDeafened;
    this.toggleDeafen.emit();
  }

  onLeaveVoice(): void {
    this.leaveVoice.emit();
  }

  canManageParticipant(participant: VoiceParticipant): boolean {
    // Check if current user can manage this participant
    return false; // Implement permission logic
  }

  trackByParticipantId(index: number, participant: VoiceParticipant): string {
    return participant.id;
  }
}
```

## 🎨 Cyberpunk Aesthetic Overlay

### Cyberpunk Effects Component

```typescript
// src/app/features/discord/components/cyberpunk-effects/cyberpunk-effects.component.ts
@Component({
  selector: 'app-cyberpunk-effects',
  standalone: true,
  template: `
    <div class="cyberpunk-effects">
      <!-- Matrix Rain Background -->
      <div 
        class="matrix-rain"
        *ngIf="showMatrixRain">
        <div 
          *ngFor="let char of matrixChars"
          class="matrix-char"
          [style.left.px]="char.x"
          [style.animation-delay.s]="char.delay">
          {{ char.character }}
        </div>
      </div>

      <!-- Neon Glow Effects -->
      <div 
        class="neon-glow-overlay"
        *ngIf="showNeonGlow">
      </div>

      <!-- Scanline Effect -->
      <div 
        class="scanlines"
        *ngIf="showScanlines">
      </div>

      <!-- Glitch Effects -->
      <div 
        class="glitch-overlay"
        *ngIf="showGlitch"
        [class.active]="isGlitching">
      </div>
    </div>
  `
})
export class CyberpunkEffectsComponent {
  @Input() showMatrixRain = true;
  @Input() showNeonGlow = true;
  @Input() showScanlines = true;
  @Input() showGlitch = false;

  matrixChars: MatrixChar[] = [];
  isGlitching = false;

  constructor() {
    this.generateMatrixChars();
    this.startGlitchEffect();
  }

  generateMatrixChars(): void {
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    for (let i = 0; i < 50; i++) {
      this.matrixChars.push({
        character: characters[Math.floor(Math.random() * characters.length)],
        x: Math.random() * window.innerWidth,
        delay: Math.random() * 5
      });
    }
  }

  startGlitchEffect(): void {
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        this.isGlitching = true;
        setTimeout(() => {
          this.isGlitching = false;
        }, 200);
      }
    }, 2000);
  }
}

interface MatrixChar {
  character: string;
  x: number;
  delay: number;
}
```

This comprehensive Discord interface documentation provides the complete specifications for building an exact Discord clone with Angular 17+, including all major components, real-time features, and cyberpunk aesthetic overlays.
