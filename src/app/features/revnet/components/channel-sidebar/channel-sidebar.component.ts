import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectSelectedServer, selectChannelsByServer, selectSelectedChannelId, selectSelectedChannel, selectWebsocketConnected } from '../../store/selectors/revnet.selectors';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { Server, Channel, User } from '../../store/models/revnet.models';
import { VoiceChatService } from '../../services/voice-chat.service';
import { VoiceChannelComponent } from '../voice-channel/voice-channel.component';
import { ServerSettingsModalComponent } from '../server-settings-modal/server-settings-modal.component';
import { UnreadBadgeComponent } from '../unread-badge/unread-badge.component';
import { StatusDropdownComponent } from '../status-dropdown/status-dropdown.component';
import { UserPanelComponent } from '../user-panel/user-panel.component';

@Component({
  selector: 'app-channel-sidebar',
  standalone: true,
  imports: [CommonModule, VoiceChannelComponent, ServerSettingsModalComponent, UnreadBadgeComponent, StatusDropdownComponent, UserPanelComponent],
  template: `
    <div class="channel-sidebar" [class.mobile-open]="mobileOpen">
      <div class="channel-sidebar__header">
        <h2>{{ useInputs ? serverName : ((selectedServer$ | async)?.name || 'Select a Revolt') }}</h2>
        <button class="settings-btn" (click)="openSettings()" *ngIf="!useInputs && (selectedServer$ | async)">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
      <div class="channel-sidebar__content">
        <div 
          *ngFor="let channel of (useInputs ? channels : (channels$ | async))" 
          class="channel-item"
          [class.active]="useInputs ? (selectedChannelId === channel.id) : ((selectedChannelId$ | async) === channel.id)"
          [class.voice-channel]="channel.type === 2"
          (click)="selectChannel(channel.id)"
          [title]="channel.name">
          <div class="channel-content">
            <svg *ngIf="channel.type === 2" class="channel-icon" width="16" height="16" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
            </svg>
            <span *ngIf="channel.type !== 2" class="channel-hash">#</span>
            <span class="channel-name">{{ channel.name }}</span>
          </div>
          <app-unread-badge 
            *ngIf="channel.type !== 2" 
            [channelId]="channel.id"
            [serverId]="(selectedServer$ | async)?.id"
            type="channel">
          </app-unread-badge>
        </div>
      </div>
      
      <!-- Voice Channel Component -->
      <app-voice-channel 
        [channelId]="(selectedChannelId$ | async)"
        *ngIf="(selectedChannel$ | async)?.type === 2">
      </app-voice-channel>
      
      <app-user-panel
        *ngIf="useInputs && currentUser"
        [user]="currentUser">
      </app-user-panel>
      
      <div class="channel-sidebar__user-panel" *ngIf="!useInputs">
        <div class="user-info">
          <div class="user-avatar">U</div>
          <div class="user-details">
            <div class="username">CurrentUser</div>
            <app-status-dropdown 
              (statusChanged)="onStatusChanged($event)"
              (customStatusChanged)="onCustomStatusChanged($event)"
              (activityChanged)="onActivityChanged($event)">
            </app-status-dropdown>
            <div class="connection-status" [class.connected]="websocketConnected$ | async">
              {{ (websocketConnected$ | async) ? 'Connected' : 'Connecting...' }}
            </div>
          </div>
          <div class="user-controls">
            <button class="control-btn" (click)="toggleMute()" [class.active]="isMuted">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path [attr.d]="isMuted ? 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07' : 'M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07'"/>
              </svg>
            </button>
            <button class="control-btn" (click)="toggleDeafen()" [class.active]="isDeafened">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path [attr.d]="isDeafened ? 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8' : 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8'"/>
              </svg>
            </button>
            <button class="control-btn" (click)="openSettings()">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Server Settings Modal -->
      <app-server-settings-modal
        *ngIf="showSettingsModal"
        [serverId]="(selectedServer$ | async)?.id || null"
        (modalClosed)="showSettingsModal = false">
      </app-server-settings-modal>
    </div>
  `,
  styleUrl: './channel-sidebar.component.scss'
})
export class ChannelSidebarComponent implements OnInit, OnDestroy {
  // Optional inputs for dashboard-layout compatibility
  @Input() channels: Channel[] | null = null;
  @Input() selectedChannelId: string | null = null;
  @Input() serverName: string = '';
  @Input() currentUser: User | null = null;
  @Input() mobileOpen: boolean = false;
  @Output() channelSelected = new EventEmitter<string>();

  // NgRx observables (used when inputs not provided)
  selectedServer$: Observable<Server | null>;
  channels$: Observable<Channel[]>;
  selectedChannelId$: Observable<string | null>;
  selectedChannel$: Observable<Channel | null>;
  websocketConnected$: Observable<boolean>;
  
  isMuted = false;
  isDeafened = false;
  showSettingsModal = false;
  private destroy$ = new Subject<void>();

  // Use inputs if provided, otherwise use NgRx
  get useInputs(): boolean {
    return this.channels !== null;
  }

  constructor(
    private store: Store,
    private voiceChatService: VoiceChatService
  ) {
    this.selectedServer$ = this.store.select(selectSelectedServer);
    this.channels$ = this.store.select(selectChannelsByServer);
    this.selectedChannelId$ = this.store.select(selectSelectedChannelId);
    this.selectedChannel$ = this.store.select(selectSelectedChannel);
    this.websocketConnected$ = this.store.select(selectWebsocketConnected);
  }

  ngOnInit(): void {
    // Channels are now loaded directly from server data in the reducer
    // No need to dispatch loadChannels action

    // Subscribe to voice state
    this.voiceChatService.voiceState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.isMuted = state.isMuted;
      this.isDeafened = state.isDeafened;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectChannel(channelId: string): void {
    if (this.useInputs) {
      this.channelSelected.emit(channelId);
    } else {
      this.store.dispatch(RevNetActions.selectChannel({ channelId }));
      this.store.dispatch(RevNetActions.loadMessages({ channelId }));
    }
  }

  toggleMute(): void {
    this.voiceChatService.toggleMute();
  }

  toggleDeafen(): void {
    this.voiceChatService.toggleDeafen();
  }

  openSettings(): void {
    this.showSettingsModal = true;
  }

  onStatusChanged(status: any): void {
    console.log('Status changed:', status);
    // Status is handled by the StatusService
  }

  onCustomStatusChanged(customStatus: any): void {
    console.log('Custom status changed:', customStatus);
    // Custom status is handled by the StatusService
  }

  onActivityChanged(activity: any): void {
    console.log('Activity changed:', activity);
    // Activity is handled by the StatusService
  }
}
