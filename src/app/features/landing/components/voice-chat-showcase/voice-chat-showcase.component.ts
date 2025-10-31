import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoDataService } from '../../../../core/services/demo-data.service';
import { VoiceChannelParticipant } from '../../../../features/revnet/services/voice-chat.service';

@Component({
  selector: 'app-voice-chat-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-chat-showcase.component.html',
  styleUrls: ['./voice-chat-showcase.component.scss']
})
export class VoiceChatShowcaseComponent implements OnInit, OnDestroy {
  participants: VoiceChannelParticipant[] = [];
  private participantInterval: any;
  private speakingInterval: any;

  constructor(private demoDataService: DemoDataService) {}

  ngOnInit(): void {
    this.participants = this.demoDataService.getDemoVoiceParticipants();
    this.startAnimations();
  }

  ngOnDestroy(): void {
    if (this.participantInterval) clearInterval(this.participantInterval);
    if (this.speakingInterval) clearInterval(this.speakingInterval);
  }

  private startAnimations(): void {
    // Animate speaking states
    this.speakingInterval = setInterval(() => {
      this.participants = this.participants.map(p => ({
        ...p,
        isSpeaking: Math.random() > 0.6 && !p.isMuted
      }));
    }, 2000);

    // Simulate participants joining/leaving
    let participantCount = this.participants.length;
    this.participantInterval = setInterval(() => {
      if (Math.random() > 0.7 && participantCount < 5) {
        // Add participant
        const newParticipant: VoiceChannelParticipant = {
          userId: `demo-user-${participantCount + 1}`,
          username: `User ${participantCount + 1}`,
          isMuted: false,
          isDeafened: false,
          isSpeaking: false
        };
        this.participants = [...this.participants, newParticipant];
        participantCount++;
      } else if (Math.random() > 0.8 && participantCount > 2) {
        // Remove participant
        this.participants = this.participants.slice(0, -1);
        participantCount--;
      }
    }, 5000);
  }

  getAudioLevel(participant: VoiceChannelParticipant): number {
    if (participant.isMuted || !participant.isSpeaking) {
      return 0.2;
    }
    return 0.7;
  }
}

