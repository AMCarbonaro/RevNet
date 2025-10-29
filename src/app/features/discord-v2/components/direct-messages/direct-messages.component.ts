import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-direct-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="direct-messages">
      <h2>Direct Messages</h2>
      <p>Select a conversation to start messaging</p>
    </div>
  `,
  styleUrl: './direct-messages.component.scss'
})
export class DirectMessagesComponent {}
