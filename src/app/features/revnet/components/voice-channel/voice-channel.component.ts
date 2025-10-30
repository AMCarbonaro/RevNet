import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { VoiceChatService, VoiceChannelParticipant } from '../../services/voice-chat.service';
import { selectSelectedChannel } from '../../store/selectors/revnet.selectors';
import { Channel } from '../../store/models/revnet.models';

@Component({
  selector: 'app-voice-channel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="voice-channel" *ngIf="isVoiceChannel">
      <div class="voice-header">
        <div class="voice-info">
          <svg class="voice-icon" width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
          </svg>
          <span class="channel-name">{{ (selectedChannel$ | async)?.name }}</span>
        </div>
        <div class="participant-count">{{ participants.length }} connected</div>
      </div>

      <div class="voice-participants">
        <div 
          *ngFor="let participant of participants" 
          class="participant"
          [class.speaking]="participant.isSpeaking"
          [class.muted]="participant.isMuted">
          <div class="participant-avatar">
            {{ participant.username.charAt(0).toUpperCase() }}
            <div class="speaking-indicator" *ngIf="participant.isSpeaking"></div>
          </div>
          <div class="participant-info">
            <div class="participant-name">{{ participant.username }}</div>
            <div class="participant-status">
              <span *ngIf="participant.isMuted" class="status-muted">Muted</span>
              <span *ngIf="participant.isDeafened" class="status-deafened">Deafened</span>
              <span *ngIf="!participant.isMuted && !participant.isDeafened" class="status-normal">Connected</span>
            </div>
          </div>
        </div>
      </div>

      <div class="voice-controls">
        <button 
          class="voice-btn"
          [class.active]="isMuted"
          (click)="toggleMute()"
          [title]="isMuted ? 'Unmute' : 'Mute'">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path [attr.d]="isMuted ? 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07' : 'M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07'"/>
          </svg>
        </button>

        <button 
          class="voice-btn"
          [class.active]="isDeafened"
          (click)="toggleDeafen()"
          [title]="isDeafened ? 'Undeafen' : 'Deafen'">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path [attr.d]="isDeafened ? 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8' : 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8'"/>
          </svg>
        </button>

        <button 
          class="voice-btn settings"
          (click)="openSettings()"
          title="Voice Settings">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        <button 
          class="voice-btn leave"
          (click)="leaveVoiceChannel()"
          title="Leave Voice Channel">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M10 9v6l5-3-5-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styleUrl: './voice-channel.component.scss'
})
export class VoiceChannelComponent implements OnInit, OnDestroy {
  @Input() channelId: string | null = null;

  selectedChannel$: Observable<Channel | null>;
  participants: VoiceChannelParticipant[] = [];
  isConnected = false;
  isMuted = false;
  isDeafened = false;
  isVoiceChannel = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private voiceChatService: VoiceChatService
  ) {
    this.selectedChannel$ = this.store.select(selectSelectedChannel);
  }

  ngOnInit(): void {
    // Check if current channel is a voice channel
    this.selectedChannel$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(channel => {
      this.isVoiceChannel = channel?.type === 2; // Voice channel type
      
      if (this.isVoiceChannel && channel) {
        this.joinVoiceChannel(channel.id);
      } else if (!this.isVoiceChannel) {
        this.leaveVoiceChannel();
      }
    });

    // Subscribe to voice state
    this.voiceChatService.voiceState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.isConnected = state.isConnected;
      this.isMuted = state.isMuted;
      this.isDeafened = state.isDeafened;
      this.participants = state.participants;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.leaveVoiceChannel();
  }

  async joinVoiceChannel(channelId: string): Promise<void> {
    try {
      await this.voiceChatService.joinVoiceChannel(channelId);
      console.log('Joined voice channel:', channelId);
    } catch (error) {
      console.error('Error joining voice channel:', error);
    }
  }

  async leaveVoiceChannel(): Promise<void> {
    try {
      await this.voiceChatService.leaveVoiceChannel();
      console.log('Left voice channel');
    } catch (error) {
      console.error('Error leaving voice channel:', error);
    }
  }

  toggleMute(): void {
    this.voiceChatService.toggleMute();
  }

  toggleDeafen(): void {
    this.voiceChatService.toggleDeafen();
  }

  openSettings(): void {
    // TODO: Open voice settings modal
    console.log('Opening voice settings');
  }
}
