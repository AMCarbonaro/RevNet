import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, combineLatest } from 'rxjs';
import { selectSelectedChannel, selectCurrentChannelMessages, selectCurrentUser, selectSelectedDMChannel, selectHighlightedMessageId } from '../../store/selectors/revnet.selectors';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { Channel, Message, User, DMChannel } from '../../store/models/revnet.models';
import { RevNetWebSocketService } from '../../services/revnet-websocket.service';
import { MessageItemComponent } from '../message-item/message-item.component';
import { MessageThreadComponent } from '../message-thread/message-thread.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { MessageSearchComponent } from '../message-search/message-search.component';
import { TypingIndicatorsComponent } from '../typing-indicators/typing-indicators.component';
import { MobileLayoutService } from '../../services/mobile-layout.service';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    FormsModule, 
    MessageItemComponent,
    MessageThreadComponent,
    FileUploadComponent,
    MessageSearchComponent,
    TypingIndicatorsComponent
  ],
  template: `
    <div class="chat-area">
      <div class="chat-area__header">
        <!-- Server Channel Header (Input Mode) -->
        <div *ngIf="useInputs && channelName" class="channel-header">
          <button 
            *ngIf="isMobile"
            class="back-btn"
            (click)="toggleChannelSidebar.emit()"
            title="Back to channels">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1>{{ channelType === 0 ? '#' : '' }} {{ channelName }}</h1>
        </div>
        
        <!-- Server Channel Header (NgRx Mode) -->
        <div *ngIf="!useInputs && (selectedChannel$ | async) as channel" class="channel-header">
          <button 
            *ngIf="isMobile"
            class="back-btn"
            (click)="goBackToChannels()"
            title="Back to channels">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1># {{ channel.name }}</h1>
        </div>
        
        <!-- DM Channel Header -->
        <div *ngIf="(selectedDMChannel$ | async) as dmChannel" class="dm-header">
          <div class="dm-avatar">
            <div class="avatar-circle" [style.background-color]="getDMAvatarColor(dmChannel)">
              {{ getDMAvatarInitials(dmChannel) }}
            </div>
            <div class="online-indicator" *ngIf="isDMUserOnline(dmChannel)"></div>
          </div>
          <div class="dm-info">
            <h1>{{ getDMDisplayName(dmChannel) }}</h1>
            <div class="dm-status" *ngIf="!dmChannel.isGroup">
              {{ isDMUserOnline(dmChannel) ? 'Online' : 'Offline' }}
            </div>
            <div class="dm-members" *ngIf="dmChannel.isGroup">
              {{ dmChannel.recipientIds.length }} members
            </div>
          </div>
        </div>
        
        <!-- No Selection Header -->
        <div *ngIf="!(selectedChannel$ | async) && !(selectedDMChannel$ | async)">
          <h1>Select a Channel or DM</h1>
        </div>
        
        <div class="chat-actions">
          <button class="action-btn" (click)="simulateTyping()">Test Typing</button>
          <button class="action-btn" (click)="toggleSearch()">Search</button>
          <button class="action-btn">Pinned Messages</button>
          <button class="action-btn">Member List</button>
          <button class="action-btn">Notifications</button>
        </div>
      </div>
          <div class="chat-area__messages" #messagesContainer>
            <!-- Pull-to-refresh indicator -->
            <div 
              class="pull-to-refresh" 
              *ngIf="isMobile && (isPullToRefresh || isRefreshing)"
              [style.transform]="'translateY(' + (pullDistance - 50) + 'px)'">
              <div class="refresh-indicator">
                <div class="refresh-spinner" *ngIf="isRefreshing"></div>
                <div class="refresh-arrow" *ngIf="!isRefreshing" [class.rotated]="isPullToRefresh"></div>
                <span class="refresh-text">
                  {{ isRefreshing ? 'Loading...' : (isPullToRefresh ? 'Release to refresh' : 'Pull to refresh') }}
                </span>
              </div>
            </div>
            
            <div
              *ngFor="let message of (useInputs ? displayMessages : (messages$ | async))"
              [attr.data-message-id]="message.id"
              [class.highlighted]="!useInputs && (highlightedMessageId$ | async) === message.id">
              <app-message-item
                [message]="message"
                (messageDeleted)="onMessageDeleted($event)"
                (messageEdited)="onMessageEdited($event)">
              </app-message-item>
            </div>
          </div>
          
          <!-- Typing Indicators -->
          <app-typing-indicators [typingUsers]="typingUsers"></app-typing-indicators>
          
      <div class="chat-area__input">
        <div class="input-container">
          <button class="input-btn" (click)="toggleFileUpload()">Upload file</button>
          <button class="input-btn">Emoji</button>
          <button class="input-btn">Gift</button>
              <input
                type="text"
                [(ngModel)]="messageInput"
                (keydown.enter)="sendMessage()"
                (input)="onInputChange()"
                (focus)="onInputFocus()"
                (blur)="onInputBlur()"
                [placeholder]="useInputs ? ('Message #' + channelName) : ('Message #' + ((selectedChannel$ | async)?.name || 'channel'))"
                class="message-input"
                [class.mobile-input]="isMobile">
          <button 
            class="send-btn" 
            [disabled]="!messageInput.trim()"
            (click)="sendMessage()">
            Send
          </button>
        </div>
      </div>
      
      <!-- File Upload Modal -->
      <div class="file-upload-modal" *ngIf="showFileUpload">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Upload Files</h3>
            <button class="close-btn" (click)="toggleFileUpload()">×</button>
          </div>
          <app-file-upload></app-file-upload>
        </div>
      </div>
      
      <!-- Search Modal -->
      <div class="search-modal" *ngIf="showSearch">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Search Messages</h3>
            <button class="close-btn" (click)="toggleSearch()">×</button>
          </div>
          <app-message-search></app-message-search>
        </div>
      </div>
      
      <!-- Thread Sidebar -->
      <app-message-thread 
        *ngIf="showThread && selectedMessageForThread"
        [originalMessage]="selectedMessageForThread"
        [isOpen]="showThread"
        (threadClosed)="closeThread()">
      </app-message-thread>
    </div>
  `,
  styleUrl: './chat-area.component.scss'
})
export class ChatAreaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;

  // Optional inputs for dashboard-layout compatibility
  @Input() messages: Message[] | null = null;
  @Input() channelName: string = '';
  @Input() channelType: number = 0;
  @Output() toggleChannelSidebar = new EventEmitter<void>();
  @Output() toggleMemberList = new EventEmitter<void>();

  // NgRx observables (used when inputs not provided)
  selectedChannel$: Observable<Channel | null>;
  selectedDMChannel$: Observable<DMChannel | null>;
  messages$: Observable<Message[]>;
  currentUser$: Observable<User | null>;
  highlightedMessageId$: Observable<string | null>;

  messageInput = '';
  showFileUpload = false;
  showSearch = false;
  showThread = false;
  selectedMessageForThread: Message | null = null;
  typingUsers: any[] = [];

  // Use inputs if provided, otherwise use NgRx
  get useInputs(): boolean {
    return this.messages !== null;
  }

  get displayMessages(): Message[] {
    return this.useInputs ? (this.messages || []) : [];
  }
  
  // Pull-to-refresh properties
  isPullToRefresh = false;
  pullDistance = 0;
  isRefreshing = false;
  startY = 0;
  isMobile = false;
  
  private destroy$ = new Subject<void>();
  private typingTimeout: any;
  private isTyping = false;

  constructor(
    private store: Store,
    private webSocketService: RevNetWebSocketService,
    private mobileLayoutService: MobileLayoutService,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedChannel$ = this.store.select(selectSelectedChannel);
    this.selectedDMChannel$ = this.store.select(selectSelectedDMChannel);
    this.messages$ = this.store.select(selectCurrentChannelMessages);
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.highlightedMessageId$ = this.store.select(selectHighlightedMessageId);
  }

  ngOnInit(): void {
    // Initialize mobile flag so mobile-only UI (like back button) shows immediately
    this.isMobile = window.innerWidth <= 768;
    this.cdr.markForCheck();

    // Connect to WebSocket
    this.webSocketService.connect();

    // Combine all subscriptions to reduce overhead
    combineLatest([
      this.selectedChannel$,
      this.webSocketService.messages$,
      this.webSocketService.typingUsers$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([channel, message, typingUser]) => {
      // Load messages when a channel is selected
      if (channel) {
        this.store.dispatch(RevNetActions.loadMessages({ channelId: channel.id }));
      }

      // Handle real-time messages
      if (message) {
        console.log('Real-time message received:', message);
        this.cdr.markForCheck();
      }

      // Handle typing indicators
      if (typingUser) {
        console.log('User typing:', typingUser);
        this.cdr.markForCheck();
      }
    });

    // Subscribe to highlighted message changes
    this.highlightedMessageId$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(messageId => {
      if (messageId && this.messagesContainer) {
        this.scrollToMessage(messageId);
      }
    });
  }

  ngAfterViewInit(): void {
    // Auto-scroll to bottom when messages change
    this.messages$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.disconnect();
  }

  sendMessage(): void {
    if (!this.messageInput.trim()) return;
    
    // Get current channel value directly instead of subscribing
    this.selectedChannel$.pipe(takeUntil(this.destroy$)).subscribe(channel => {
      if (channel) {
        // Dispatch to store - this will call API via effects and broadcast via WebSocket
        this.store.dispatch(RevNetActions.sendMessage({
          channelId: channel.id,
          content: this.messageInput.trim()
        }));
        
        this.messageInput = '';
        this.stopTyping();
        this.cdr.markForCheck();
      }
    });
  }

  onInputChange(): void {
    this.selectedChannel$.pipe(takeUntil(this.destroy$)).subscribe(channel => {
      if (channel && this.messageInput.trim()) {
        this.startTyping(channel.id);
      } else if (channel) {
        this.stopTyping(channel.id);
      }
      this.cdr.markForCheck();
    });
  }

  private startTyping(channelId: string): void {
    if (!this.isTyping) {
      this.isTyping = true;
      this.webSocketService.startTyping(channelId);
    }

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set new timeout to stop typing
    this.typingTimeout = setTimeout(() => {
      this.stopTyping(channelId);
    }, 3000);
  }

  private stopTyping(channelId?: string): void {
    if (this.isTyping) {
      this.isTyping = false;
      if (channelId) {
        this.webSocketService.stopTyping(channelId);
      }
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  onMessageDeleted(messageId: string): void {
    console.log('Message deleted:', messageId);
    // The store action is already dispatched in the message component
  }

  onMessageEdited(event: { id: string; content: string }): void {
    console.log('Message edited:', event);
    // The store action is already dispatched in the message component
  }

  toggleFileUpload(): void {
    this.showFileUpload = !this.showFileUpload;
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
  }

  openThread(message: Message): void {
    this.selectedMessageForThread = message;
    this.showThread = true;
  }

  closeThread(): void {
    this.showThread = false;
    this.selectedMessageForThread = null;
  }

  goBackToChannels(): void {
    // Deselect current channel to show channel list on mobile
    this.store.dispatch(RevNetActions.selectChannel({ channelId: null }));
    this.cdr.markForCheck();
  }

  simulateTyping(): void {
    // Simulate typing for demo purposes
    const mockUser = {
      id: 'user2',
      username: 'TestUser',
      discriminator: '0002',
      startedTyping: Date.now()
    };
    this.typingUsers = [mockUser];
    
    // Remove after 3 seconds
    setTimeout(() => {
      this.typingUsers = [];
    }, 3000);
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString();
  }

  // DM-related methods
  getDMDisplayName(dmChannel: DMChannel): string {
    if (dmChannel.isGroup) {
      return dmChannel.name || `Group DM (${dmChannel.recipientIds.length})`;
    } else {
      // For 1:1 DMs, find the other user
      const otherUserId = dmChannel.recipientIds.find(id => id !== this.getCurrentUserId());
      return `User ${otherUserId?.substring(0, 8)}`;
    }
  }

  getDMAvatarInitials(dmChannel: DMChannel): string {
    if (dmChannel.isGroup) {
      return 'G';
    } else {
      const otherUserId = dmChannel.recipientIds.find(id => id !== this.getCurrentUserId());
      return otherUserId?.substring(0, 1).toUpperCase() || '?';
    }
  }

  getDMAvatarColor(dmChannel: DMChannel): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const hash = dmChannel.channelId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  isDMUserOnline(dmChannel: DMChannel): boolean {
    // In a real app, you'd check the user's online status
    return Math.random() > 0.5; // Mock online status
  }

  private getCurrentUserId(): string {
    // In a real app, you'd get this from the current user
    return 'user1';
  }

  private scrollToMessage(messageId: string): void {
    if (!this.messagesContainer) return;

    const messageElement = this.messagesContainer.nativeElement.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add highlight class
      messageElement.classList.add('highlighted');
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        messageElement.classList.remove('highlighted');
      }, 3000);
    }
  }

  private scrollToBottom(): void {
    if (!this.messagesContainer) return;

    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  // Pull-to-refresh methods
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (!this.isMobile) return;
    
    this.startY = event.touches[0].clientY;
    this.isPullToRefresh = false;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isMobile || this.isRefreshing) return;
    
    const currentY = event.touches[0].clientY;
    const scrollTop = this.messagesContainer?.nativeElement.scrollTop || 0;
    
    // Only trigger pull-to-refresh if at the top of the scroll
    if (scrollTop === 0 && currentY > this.startY) {
      event.preventDefault();
      this.pullDistance = Math.min(currentY - this.startY, 100);
      this.isPullToRefresh = this.pullDistance > 50;
      this.cdr.markForCheck();
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.isMobile || this.isRefreshing) return;
    
    if (this.isPullToRefresh && this.pullDistance > 50) {
      this.refreshMessages();
    } else {
      this.resetPullToRefresh();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
    this.handleVirtualKeyboard();
    this.cdr.markForCheck();
  }

  @HostListener('window:visualViewport', ['$event'])
  onVisualViewportChange(event: any): void {
    if (this.isMobile) {
      this.handleVirtualKeyboard();
    }
  }

  private refreshMessages(): void {
    this.isRefreshing = true;
    this.cdr.markForCheck();
    
    // Simulate loading older messages
    setTimeout(() => {
      // TODO: Load older messages from store
      console.log('Loading older messages...');
      this.resetPullToRefresh();
    }, 1000);
  }

  private resetPullToRefresh(): void {
    this.isPullToRefresh = false;
    this.pullDistance = 0;
    this.isRefreshing = false;
    this.cdr.markForCheck();
  }

  private handleVirtualKeyboard(): void {
    if (!this.isMobile || !this.messagesContainer) return;

    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const windowHeight = window.innerHeight;
    const keyboardHeight = windowHeight - viewportHeight;
    
    if (keyboardHeight > 0) {
      // Keyboard is open
      const messagesContainer = this.messagesContainer.nativeElement;
      const availableHeight = viewportHeight - 200; // Account for header and input
      
      messagesContainer.style.height = `${availableHeight}px`;
      messagesContainer.style.maxHeight = `${availableHeight}px`;
      
      // Scroll to bottom when keyboard opens
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    } else {
      // Keyboard is closed
      const messagesContainer = this.messagesContainer.nativeElement;
      messagesContainer.style.height = '';
      messagesContainer.style.maxHeight = '';
    }
  }

  onInputFocus(): void {
    if (this.isMobile) {
      // Prevent zoom on iOS
      document.querySelector('meta[name=viewport]')?.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
  }

  onInputBlur(): void {
    if (this.isMobile) {
      // Restore zoom capability
      document.querySelector('meta[name=viewport]')?.setAttribute('content', 'width=device-width, initial-scale=1');
    }
  }
}
