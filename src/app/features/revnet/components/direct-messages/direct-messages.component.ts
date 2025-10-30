import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { 
  selectDMChannelsSorted, 
  selectSelectedDMChannelId, 
  selectCurrentUser 
} from '../../store/selectors/revnet.selectors';
import { DMChannel, User } from '../../store/models/revnet.models';
import { CreateDMModalComponent } from '../create-dm-modal/create-dm-modal.component';
import { CreateGroupDMModalComponent } from '../create-group-dm-modal/create-group-dm-modal.component';

@Component({
  selector: 'app-direct-messages',
  standalone: true,
  imports: [CommonModule, CreateDMModalComponent, CreateGroupDMModalComponent],
  template: `
    <div class="direct-messages">
      <div class="dm-header">
        <h2>Direct Messages</h2>
        <div class="dm-actions">
          <button class="new-dm-btn" (click)="openCreateDMModal()" title="New DM">
            <i class="icon-plus"></i>
          </button>
          <button class="new-group-dm-btn" (click)="openCreateGroupDMModal()" title="New Group DM">
            <i class="icon-group"></i>
          </button>
        </div>
      </div>
      
      <div class="dm-list">
        <div 
          *ngFor="let dmChannel of dmChannels$ | async" 
          class="dm-item"
          [class.active]="dmChannel.channelId === (selectedDMChannelId$ | async)"
          (click)="selectDMChannel(dmChannel.channelId)"
        >
          <div class="dm-avatar">
            <div class="avatar-circle" [style.background-color]="getAvatarColor(dmChannel)">
              {{ getAvatarInitials(dmChannel) }}
            </div>
            <div class="online-indicator" *ngIf="isOnline(dmChannel)"></div>
          </div>
          
          <div class="dm-info">
            <div class="dm-name">
              {{ getDMDisplayName(dmChannel) }}
            </div>
            <div class="dm-preview" *ngIf="getLastMessage(dmChannel)">
              {{ getLastMessage(dmChannel)?.content }}
            </div>
          </div>
          
          <div class="dm-meta">
            <div class="dm-time" *ngIf="getLastMessage(dmChannel)">
              {{ formatTime(getLastMessage(dmChannel)?.timestamp) }}
            </div>
            <div class="unread-badge" *ngIf="hasUnreadMessages(dmChannel)">
              {{ getUnreadCount(dmChannel) }}
            </div>
          </div>
        </div>
        
        <div *ngIf="(dmChannels$ | async)?.length === 0" class="no-dms">
          <p>No direct messages yet</p>
          <button class="start-dm-btn" (click)="openCreateDMModal()">
            Start a conversation
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <app-create-dm-modal 
      *ngIf="showCreateDMModal"
      (close)="closeCreateDMModal()"
      (create)="onCreateDM($event)">
    </app-create-dm-modal>
    
    <app-create-group-dm-modal 
      *ngIf="showCreateGroupDMModal"
      (close)="closeCreateGroupDMModal()"
      (create)="onCreateGroupDM($event)">
    </app-create-group-dm-modal>
  `,
  styleUrl: './direct-messages.component.scss'
})
export class DirectMessagesComponent implements OnInit {
  dmChannels$: Observable<DMChannel[]>;
  selectedDMChannelId$: Observable<string | null>;
  currentUser$: Observable<User | null>;
  
  showCreateDMModal = false;
  showCreateGroupDMModal = false;

  constructor(private store: Store) {
    this.dmChannels$ = this.store.select(selectDMChannelsSorted);
    this.selectedDMChannelId$ = this.store.select(selectSelectedDMChannelId);
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.store.dispatch(RevNetActions.loadDMChannels());
  }

  selectDMChannel(channelId: string): void {
    this.store.dispatch(RevNetActions.selectDMChannel({ channelId }));
  }

  openCreateDMModal(): void {
    this.showCreateDMModal = true;
  }

  openCreateGroupDMModal(): void {
    this.showCreateGroupDMModal = true;
  }

  closeCreateDMModal(): void {
    this.showCreateDMModal = false;
  }

  closeCreateGroupDMModal(): void {
    this.showCreateGroupDMModal = false;
  }

  onCreateDM(username: string): void {
    console.log('Creating DM with user:', username);
    
    // For now, we'll use a mock recipient ID since we don't have user lookup yet
    // In a real app, you'd look up the user by username first
    const recipientId = `user_${username.toLowerCase().replace(/\s+/g, '_')}`;
    
    this.store.dispatch(RevNetActions.createDMChannel({ recipientId }));
    this.closeCreateDMModal();
  }

  onCreateGroupDM(data: {name?: string, usernames: string[]}): void {
    console.log('Creating group DM:', data);
    
    // Convert usernames to user IDs (mock for now)
    const recipientIds = data.usernames.map(username => 
      `user_${username.toLowerCase().replace(/\s+/g, '_')}`
    );
    
    this.store.dispatch(RevNetActions.createGroupDM({ 
      recipientIds, 
      name: data.name 
    }));
    this.closeCreateGroupDMModal();
  }

  getDMDisplayName(dmChannel: DMChannel): string {
    if (dmChannel.isGroup) {
      return dmChannel.name || `Group DM (${dmChannel.recipientIds.length})`;
    } else {
      // For 1:1 DMs, find the other user
      const otherUserId = dmChannel.recipientIds.find(id => id !== this.getCurrentUserId());
      // In a real app, you'd have user data here
      return `User ${otherUserId?.substring(0, 8)}`;
    }
  }

  getAvatarInitials(dmChannel: DMChannel): string {
    if (dmChannel.isGroup) {
      return 'G';
    } else {
      const otherUserId = dmChannel.recipientIds.find(id => id !== this.getCurrentUserId());
      return otherUserId?.substring(0, 1).toUpperCase() || '?';
    }
  }

  getAvatarColor(dmChannel: DMChannel): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const hash = dmChannel.channelId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  isOnline(dmChannel: DMChannel): boolean {
    // In a real app, you'd check the user's online status
    return Math.random() > 0.5; // Mock online status
  }

  getLastMessage(dmChannel: DMChannel): any {
    // In a real app, you'd get the last message from the channel
    return null; // Mock - no last message for now
  }

  hasUnreadMessages(dmChannel: DMChannel): boolean {
    // In a real app, you'd check unread count
    return Math.random() > 0.7; // Mock unread status
  }

  getUnreadCount(dmChannel: DMChannel): number {
    // In a real app, you'd get actual unread count
    return Math.floor(Math.random() * 10) + 1; // Mock unread count
  }

  formatTime(timestamp: string | undefined): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  }

  private getCurrentUserId(): string {
    // In a real app, you'd get this from the current user
    return 'user1';
  }
}
