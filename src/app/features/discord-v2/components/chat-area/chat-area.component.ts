import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chat-area">
      <div class="chat-area__header">
        <h1># general</h1>
        <div class="chat-actions">
          <button class="action-btn">Threads</button>
          <button class="action-btn">Notifications</button>
          <button class="action-btn">Pinned Messages</button>
          <button class="action-btn">Member List</button>
          <button class="action-btn">Search</button>
        </div>
      </div>
      <div class="chat-area__messages">
        <div class="message">
          <div class="message-avatar">J</div>
          <div class="message-content">
            <div class="message-header">
              <span class="username">JohnDoe</span>
              <span class="timestamp">30m</span>
            </div>
            <div class="message-text">Hey everyone! How is everyone doing today?</div>
          </div>
        </div>
        <div class="message">
          <div class="message-avatar">J</div>
          <div class="message-content">
            <div class="message-header">
              <span class="username">JaneSmith</span>
              <span class="timestamp">15m</span>
            </div>
            <div class="message-text">Pretty good! Just working on some <strong>cool projects</strong>. How about you?</div>
          </div>
        </div>
        <div class="message">
          <div class="message-avatar">J</div>
          <div class="message-content">
            <div class="message-header">
              <span class="username">JohnDoe</span>
              <span class="timestamp">5m</span>
            </div>
            <div class="message-text">Same here! The new features look amazing <code>console.log("hello world")</code></div>
          </div>
        </div>
      </div>
      <div class="chat-area__input">
        <div class="input-container">
          <button class="input-btn">Upload file</button>
          <button class="input-btn">Emoji</button>
          <button class="input-btn">Gift</button>
          <input type="text" placeholder="Message #general" class="message-input">
          <button class="send-btn" disabled>Send</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './chat-area.component.scss'
})
export class ChatAreaComponent {}
