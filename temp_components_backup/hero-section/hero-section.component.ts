import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <section class="hero-section">
      <!-- Cyberpunk Background Effects -->
      <div class="cyberpunk-bg">
        <div class="matrix-rain"></div>
        <div class="neon-grid"></div>
        <div class="scanlines"></div>
      </div>

      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="text-gradient">Revolution Network</span>
            <br>
            <span class="hero-subtitle">Discord for Activists</span>
          </h1>
          
          <p class="hero-description">
            Join revolutionary communities, organize movements, and fund causes that matter. 
            Experience the power of Discord-like collaboration for social change.
          </p>

          <div class="hero-actions">
            <button 
              class="btn-primary btn-large"
              (click)="getStarted.emit()">
              <i class="icon-rocket"></i>
              Get Started
            </button>
            
            <button 
              class="btn-secondary btn-large"
              (click)="browseRevolts.emit()">
              <i class="icon-compass"></i>
              Browse Revolts
            </button>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">{{ totalRevolts | number }}</span>
              <span class="stat-label">Active Revolts</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ totalMembers | number }}</span>
              <span class="stat-label">Revolutionaries</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${{ (totalRaised / 100) | number:'1.0-0' }}</span>
              <span class="stat-label">Raised</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <!-- Discord Interface Preview -->
          <div class="discord-preview">
            <div class="preview-header">
              <div class="preview-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="preview-title">Revolution Network</span>
            </div>
            
            <div class="preview-content">
              <div class="preview-sidebar">
                <div class="server-item active">
                  <div class="server-icon">W</div>
                </div>
                <div class="server-item">
                  <div class="server-icon">*</div>
                </div>
                <div class="server-item">
                  <div class="server-icon">F</div>
                </div>
              </div>
              
              <div class="preview-chat">
                <div class="chat-header">
                  <span class="channel-name">#general</span>
                </div>
                <div class="chat-messages">
                  <div class="message">
                    <div class="message-avatar">U</div>
                    <div class="message-content">
                      <span class="author">Revolutionary</span>
                      <span class="text">Welcome to the revolution!</span>
                    </div>
                  </div>
                  <div class="message">
                    <div class="message-avatar">U</div>
                    <div class="message-content">
                      <span class="author">Activist</span>
                      <span class="text">Let's make change happen!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  @Output() getStarted = new EventEmitter<void>();
  @Output() browseRevolts = new EventEmitter<void>();

  @Input() totalRevolts = 0;
  @Input() totalMembers = 0;
  @Input() totalRaised = 0;
}