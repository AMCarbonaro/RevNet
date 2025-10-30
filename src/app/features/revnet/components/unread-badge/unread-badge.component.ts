import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-unread-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unread-badge" *ngIf="unreadCount > 0" [class]="badgeClass">
      <span class="badge-count">{{ displayCount }}</span>
    </div>
  `,
  styles: [`
    .unread-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ed4245;
      color: #ffffff;
      border-radius: 10px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      z-index: 10;
      animation: badgePulse 0.3s ease-out;

      &.badge-server {
        background: #ed4245;
      }

      &.badge-channel {
        background: #ed4245;
      }

      &.badge-mention {
        background: #faa61a;
        animation: mentionPulse 1s ease-in-out infinite;
      }

      &.badge-small {
        min-width: 8px;
        height: 8px;
        border-radius: 50%;
        top: 0;
        right: 0;
      }

      .badge-count {
        padding: 0 4px;
        line-height: 1;
      }
    }

    @keyframes badgePulse {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes mentionPulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }
  `]
})
export class UnreadBadgeComponent implements OnInit, OnDestroy {
  @Input() channelId?: string;
  @Input() serverId?: string;
  @Input() count?: number;
  @Input() type: 'server' | 'channel' | 'mention' | 'dm' = 'channel';
  @Input() size: 'normal' | 'small' = 'normal';
  @Input() maxDisplay: number = 99;

  unreadCount = 0;
  badgeClass = '';

  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    if (this.count !== undefined) {
      this.unreadCount = this.count;
      this.updateBadgeClass();
    } else {
      this.notificationService.unreadCount$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(count => {
        this.unreadCount = count;
        this.updateBadgeClass();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayCount(): string {
    if (this.unreadCount === 0) return '';
    if (this.unreadCount > this.maxDisplay) return `${this.maxDisplay}+`;
    return this.unreadCount.toString();
  }

  private updateBadgeClass(): void {
    const classes = ['unread-badge'];
    
    if (this.type === 'server') {
      classes.push('badge-server');
    } else if (this.type === 'channel') {
      classes.push('badge-channel');
    } else if (this.type === 'mention') {
      classes.push('badge-mention');
    }

    if (this.size === 'small') {
      classes.push('badge-small');
    }

    this.badgeClass = classes.join(' ');
  }
}
