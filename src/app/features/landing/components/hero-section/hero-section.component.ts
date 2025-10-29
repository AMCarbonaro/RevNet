import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  @Output() getStarted = new EventEmitter<void>();
  @Output() browseRevolts = new EventEmitter<void>();
  @Output() demoLogin = new EventEmitter<void>();

  @Input() totalRevolts = 0;
  @Input() totalMembers = 0;
  @Input() totalRaised = 0;
  @Input() revolts: any[] = [];

  getOnlineMembers(): number {
    // Calculate online members (typically 10-20% of total members are online)
    const onlinePercentage = 0.15; // 15% online
    const calculated = Math.floor(this.totalMembers * onlinePercentage);
    // Return at least 1 to show some activity
    return Math.max(1, calculated);
  }

  getChannelMembers(channelIndex: number): number {
    // Get member count for specific channel based on revolt data
    if (this.revolts && this.revolts.length > channelIndex) {
      return this.revolts[channelIndex]?.memberCount || 0;
    }
    
    // Fallback values for demo purposes
    const fallbackCounts = [1200, 856, 2100];
    return fallbackCounts[channelIndex] || 0;
  }
}