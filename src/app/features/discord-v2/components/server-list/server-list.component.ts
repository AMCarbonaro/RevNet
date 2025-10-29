import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="server-list">
      <div class="server-list__header">
        <h2>Servers</h2>
      </div>
      <div class="server-list__content">
        <div class="server-item">H</div>
        <div class="server-item">GS</div>
        <div class="server-item">DEV</div>
        <div class="server-item">AC</div>
      </div>
    </div>
  `,
  styleUrl: './server-list.component.scss'
})
export class ServerListComponent {}
