import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-channel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="server-channel">
      <h2>Server Channel</h2>
      <p>Channel content will be displayed here</p>
    </div>
  `,
  styleUrl: './server-channel.component.scss'
})
export class ServerChannelComponent {}
