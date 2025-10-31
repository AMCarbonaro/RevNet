import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../store/models/revnet.models';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss']
})
export class UserPanelComponent {
  @Input() user!: User;
  
  isMuted = false;
  isDeafened = false;

  toggleMute(): void {
    this.isMuted = !this.isMuted;
  }

  toggleDeafen(): void {
    this.isDeafened = !this.isDeafened;
    if (this.isDeafened) {
      this.isMuted = true; // Deafening also mutes
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'online': return '#23a55a';
      case 'away': return '#f0b232';
      case 'busy': return '#f23f42';
      default: return '#80848e';
    }
  }

  getUserInitials(username: string): string {
    return username.charAt(0).toUpperCase();
  }
}
