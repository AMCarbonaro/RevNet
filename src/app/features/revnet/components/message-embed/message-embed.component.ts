import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Embed } from '../../store/models/revnet.models';

@Component({
  selector: 'app-message-embed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-embed" *ngIf="embed" [style.border-left-color]="getEmbedColor()">
      <!-- Embed Header -->
      <div class="embed-header" *ngIf="embed.title || embed.author">
        <div class="embed-title" *ngIf="embed.title">
          <a [href]="embed.url" target="_blank" rel="noopener noreferrer" *ngIf="embed.url">
            {{ embed.title }}
          </a>
          <span *ngIf="!embed.url">{{ embed.title }}</span>
        </div>
        <div class="embed-author" *ngIf="embed.author">
          <img 
            *ngIf="embed.author.icon_url" 
            [src]="embed.author.icon_url" 
            [alt]="embed.author.name"
            class="author-icon">
          <span>{{ embed.author.name }}</span>
          <a *ngIf="embed.author.url" [href]="embed.author.url" target="_blank" rel="noopener noreferrer">
            <svg width="12" height="12" viewBox="0 0 24 24">
              <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Embed Description -->
      <div class="embed-description" *ngIf="embed.description" [innerHTML]="formatDescription(embed.description)"></div>

      <!-- Embed Fields -->
      <div class="embed-fields" *ngIf="embed.fields && embed.fields.length > 0">
        <div 
          *ngFor="let field of embed.fields" 
          class="embed-field"
          [class.inline]="field.inline">
          <div class="field-name">{{ field.name }}</div>
          <div class="field-value" [innerHTML]="formatDescription(field.value)"></div>
        </div>
      </div>

      <!-- Embed Image -->
      <div class="embed-image" *ngIf="embed.image">
        <img 
          [src]="embed.image.url || embed.image.proxy_url" 
          [alt]="embed.image.url ? 'Embed image' : ''"
          (error)="onImageError($event)"
          class="embed-img">
      </div>

      <!-- Embed Thumbnail -->
      <div class="embed-thumbnail" *ngIf="embed.thumbnail">
        <img 
          [src]="embed.thumbnail.url || embed.thumbnail.proxy_url" 
          [alt]="embed.thumbnail.url ? 'Embed thumbnail' : ''"
          (error)="onImageError($event)"
          class="embed-thumb">
      </div>

      <!-- Embed Video -->
      <div class="embed-video" *ngIf="embed.video">
        <video 
          [src]="embed.video.url" 
          [width]="embed.video.width"
          [height]="embed.video.height"
          controls
          class="embed-vid">
          Your browser does not support the video tag.
        </video>
      </div>

      <!-- Embed Footer -->
      <div class="embed-footer" *ngIf="embed.footer || embed.timestamp">
        <div class="footer-content">
          <img 
            *ngIf="embed.footer?.icon_url" 
            [src]="embed.footer.icon_url" 
            [alt]="embed.footer?.text"
            class="footer-icon">
          <span class="footer-text" *ngIf="embed.footer?.text">{{ embed.footer.text }}</span>
          <span class="embed-timestamp" *ngIf="embed.timestamp">{{ formatTimestamp(embed.timestamp) }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './message-embed.component.scss'
})
export class MessageEmbedComponent implements OnInit {
  @Input() embed!: Embed;

  ngOnInit(): void {
    // Component initialization
  }

  getEmbedColor(): string {
    if (this.embed.color) {
      return `#${this.embed.color.toString(16).padStart(6, '0')}`;
    }
    return '#5865f2'; // Default Discord blurple
  }

  formatDescription(text: string): string {
    // Basic formatting for embed descriptions and field values
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
