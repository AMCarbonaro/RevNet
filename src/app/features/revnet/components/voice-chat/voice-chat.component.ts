import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  private speakingInterval: any;

  ngOnInit(): void {
    this.startAnimations();
  }

  ngOnDestroy(): void {
    if (this.speakingInterval) {
      clearInterval(this.speakingInterval);
    }
  }

  private startAnimations(): void {
    // Animate speaking states
    this.speakingInterval = setInterval(() => {
      this.participants = this.participants.map(p => ({
        ...p,
        isSpeaking: Math.random() > 0.6 && !p.isMuted
      }));
    }, 2000);
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
