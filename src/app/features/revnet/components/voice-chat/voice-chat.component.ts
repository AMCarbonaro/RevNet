import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { VoiceChatService, VoiceChannelParticipant as ServiceParticipant } from '../../services/voice-chat.service';

export interface VoiceChannelParticipant {
  id: string;
  username: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
}

@Component({
  selector: 'app-voice-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-chat.component.html',
  styleUrls: ['./voice-chat.component.scss']
})
export class VoiceChatComponent implements OnInit, OnDestroy {
  @Input() participants: VoiceChannelParticipant[] = [];
  @Input() channelName: string = 'Voice Channel';
  @Input() channelId: string | null = null;
  @Input() useService: boolean = false; // Toggle between input mode and service mode

  displayParticipants: VoiceChannelParticipant[] = [];
  isConnected = false;
  isMuted = false;
  isDeafened = false;

  private destroy$ = new Subject<void>();

  constructor(private voiceChatService: VoiceChatService) {}

  ngOnInit(): void {
    if (this.useService && this.channelId) {
      // Use VoiceChatService for real WebRTC audio
      this.joinVoiceChannel(this.channelId);
      this.subscribeToVoiceState();
    } else {
      // Use input participants (demo/display mode)
      this.displayParticipants = this.participants;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.useService && this.channelId) {
      this.leaveVoiceChannel();
    }
  }

  private async joinVoiceChannel(channelId: string): Promise<void> {
    try {
      await this.voiceChatService.joinVoiceChannel(channelId);
      console.log('Joined voice channel with audio:', channelId);
    } catch (error) {
      console.error('Error joining voice channel:', error);
      // If user denies microphone, show error but don't crash
      alert('Microphone permission denied. Please enable microphone access to use voice chat.');
    }
  }

  private async leaveVoiceChannel(): Promise<void> {
    try {
      await this.voiceChatService.leaveVoiceChannel();
      console.log('Left voice channel');
    } catch (error) {
      console.error('Error leaving voice channel:', error);
    }
  }

  private subscribeToVoiceState(): void {
    // Subscribe to voice state changes
    this.voiceChatService.voiceState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isConnected = state.isConnected;
        this.isMuted = state.isMuted;
        this.isDeafened = state.isDeafened;
        
        // Convert service participants to display format
        this.displayParticipants = state.participants.map(p => ({
          id: p.userId,
          username: p.username,
          isMuted: p.isMuted,
          isDeafened: p.isDeafened,
          isSpeaking: p.isSpeaking,
          audioLevel: p.isSpeaking ? 0.7 : 0.2
        }));

        // Add local user to participants if connected
        if (state.isConnected && state.localStream) {
          const localUser: VoiceChannelParticipant = {
            id: 'local',
            username: 'You',
            isMuted: state.isMuted,
            isDeafened: state.isDeafened,
            isSpeaking: false,
            audioLevel: 0.5
          };
          
          // Only add if not already present
          if (!this.displayParticipants.find(p => p.id === 'local')) {
            this.displayParticipants.unshift(localUser);
          }
        }
      });
  }

  toggleMute(): void {
    if (this.useService) {
      this.voiceChatService.toggleMute();
    }
  }

  toggleDeafen(): void {
    if (this.useService) {
      this.voiceChatService.toggleDeafen();
    }
  }

  leaveChannel(): void {
    if (this.useService) {
      this.leaveVoiceChannel();
    }
  }

  getAudioLevel(participant: VoiceChannelParticipant): number {
    if (participant.isMuted || !participant.isSpeaking) {
      return 0.2;
    }
    return participant.audioLevel || 0.7;
  }

  getUserInitials(username: string): string {
    return username.charAt(0).toUpperCase();
  }
}
