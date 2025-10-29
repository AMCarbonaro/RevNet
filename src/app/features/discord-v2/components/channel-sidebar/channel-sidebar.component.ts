import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="channel-sidebar">
      <div class="channel-sidebar__header">
        <h2>Channels</h2>
      </div>
      <div class="channel-sidebar__content">
        <div class="channel-item"># general</div>
        <div class="channel-item"># announcements</div>
        <div class="channel-item"># random</div>
      </div>
      <div class="channel-sidebar__user-panel">
        <div class="user-info">
          <div class="user-avatar">U</div>
          <div class="user-details">
            <div class="username">CurrentUser</div>
            <div class="status">Online</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './channel-sidebar.component.scss'
})
export class ChannelSidebarComponent {}
