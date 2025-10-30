import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectCurrentUser, selectSelectedServer, selectSelectedChannel } from '../../store/selectors/revnet.selectors';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { User, Server, Channel } from '../../store/models/revnet.models';
import { MobileLayoutService } from '../../services/mobile-layout.service';

export type UserStatus = 'online' | 'away' | 'busy' | 'invisible';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div 
      class="mobile-menu-backdrop" 
      *ngIf="isOpen"
      (click)="close()"
      [class.visible]="isOpen">
    </div>

    <!-- Menu Panel -->
    <div 
      class="mobile-menu-panel" 
      [class.open]="isOpen"
      [class.closing]="isClosing">
      
      <!-- User Profile Section -->
      <div class="user-profile">
        <div class="user-avatar">
          <img 
            *ngIf="currentUser?.avatar" 
            [src]="currentUser?.avatar" 
            [alt]="currentUser?.username">
          <div 
            *ngIf="!currentUser?.avatar" 
            class="avatar-fallback">
            {{ getInitials(currentUser?.username) }}
          </div>
        </div>
        <div class="user-info">
          <h3 class="username">{{ currentUser?.username || 'User' }}</h3>
          <p class="user-id">#{{ currentUser?.discriminator || '0001' }}</p>
        </div>
        <button class="close-btn" (click)="close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- Status Section -->
      <div class="status-section">
        <h4>Status</h4>
        <div class="status-options">
          <button 
            *ngFor="let status of statusOptions" 
            class="status-option"
            [class.active]="currentStatus === status.value"
            (click)="setStatus(status.value)">
            <div class="status-indicator" [class]="'status-' + status.value"></div>
            <span>{{ status.label }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="quick-nav">
        <h4>Quick Navigation</h4>
        <div class="nav-options">
          <button 
            class="nav-option"
            (click)="navigateTo('servers')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Servers</span>
          </button>
          
          <button 
            class="nav-option"
            (click)="navigateTo('channels')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Channels</span>
          </button>
          
          <button 
            class="nav-option"
            (click)="navigateTo('members')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5 12.01 8.99A2.5 2.5 0 0 0 10 8H8.46c-.8 0-1.54.37-2.01.99L4 10.5V16h2.5v6H20z"/>
            </svg>
            <span>Members</span>
          </button>
        </div>
      </div>

      <!-- Current Server/Channel Info -->
      <div class="current-context" *ngIf="selectedServer || selectedChannel">
        <h4>Current Context</h4>
        <div class="context-info">
          <div *ngIf="selectedServer" class="context-item">
            <div class="context-icon server-icon">
              {{ selectedServer.name.charAt(0).toUpperCase() }}
            </div>
            <div class="context-details">
              <span class="context-name">{{ selectedServer.name }}</span>
              <span class="context-type">Server</span>
            </div>
          </div>
          
          <div *ngIf="selectedChannel" class="context-item">
            <div class="context-icon channel-icon">#</div>
            <div class="context-details">
              <span class="context-name">{{ selectedChannel.name }}</span>
              <span class="context-type">Channel</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings & Actions -->
      <div class="menu-actions">
        <button class="action-btn" (click)="openSettings()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
          <span>Settings</span>
        </button>
        
        <button class="action-btn" (click)="openNotifications()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span>Notifications</span>
        </button>
        
        <button class="action-btn logout" (click)="logout()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mobile-menu-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      &.visible {
        opacity: 1;
      }
    }

    .mobile-menu-panel {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: #2f3136;
      z-index: 1001;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      
      &.open {
        transform: translateX(0);
      }
      
      &.closing {
        transform: translateX(-100%);
      }
    }

    .user-profile {
      padding: 20px;
      border-bottom: 1px solid #40444b;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      
      .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-fallback {
          width: 100%;
          height: 100%;
          background: #5865f2;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
        }
      }
      
      .user-info {
        flex: 1;
        min-width: 0;
        
        .username {
          margin: 0 0 4px 0;
          color: #dcddde;
          font-size: 16px;
          font-weight: 600;
        }
        
        .user-id {
          margin: 0;
          color: #72767d;
          font-size: 12px;
        }
      }
      
      .close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        color: #72767d;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        
        &:hover {
          background: #40444b;
          color: #dcddde;
        }
      }
    }

    .status-section, .quick-nav, .current-context, .menu-actions {
      padding: 20px;
      border-bottom: 1px solid #40444b;
      
      h4 {
        margin: 0 0 12px 0;
        color: #72767d;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .status-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .status-option {
        display: flex;
        align-items: center;
        gap: 12px;
        background: none;
        border: none;
        color: #dcddde;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        
        &:hover {
          background: #40444b;
        }
        
        &.active {
          background: #5865f2;
        }
        
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          
          &.status-online {
            background: #3ba55c;
          }
          
          &.status-away {
            background: #faa61a;
          }
          
          &.status-busy {
            background: #ed4245;
          }
          
          &.status-invisible {
            background: #747f8d;
          }
        }
      }
    }

    .nav-options {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .nav-option {
        display: flex;
        align-items: center;
        gap: 12px;
        background: none;
        border: none;
        color: #dcddde;
        padding: 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        
        &:hover {
          background: #40444b;
        }
        
        svg {
          flex-shrink: 0;
        }
      }
    }

    .context-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .context-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: #40444b;
        border-radius: 6px;
        
        .context-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
          
          &.server-icon {
            background: #5865f2;
            color: white;
          }
          
          &.channel-icon {
            background: #747f8d;
            color: white;
          }
        }
        
        .context-details {
          flex: 1;
          min-width: 0;
          
          .context-name {
            display: block;
            color: #dcddde;
            font-weight: 500;
            font-size: 14px;
          }
          
          .context-type {
            display: block;
            color: #72767d;
            font-size: 12px;
          }
        }
      }
    }

    .menu-actions {
      margin-top: auto;
      border-bottom: none;
      
      .action-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        background: none;
        border: none;
        color: #dcddde;
        padding: 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        width: 100%;
        margin-bottom: 4px;
        
        &:hover {
          background: #40444b;
        }
        
        &.logout {
          color: #ed4245;
          
          &:hover {
            background: rgba(237, 66, 69, 0.1);
          }
        }
        
        svg {
          flex-shrink: 0;
        }
      }
    }

    @media (max-width: 768px) {
      .mobile-menu-panel {
        width: 100vw;
        max-width: 320px;
      }
    }
  `]
})
export class MobileMenuComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  currentUser$: Observable<User | null>;
  selectedServer$: Observable<Server | null>;
  selectedChannel$: Observable<Channel | null>;
  
  currentUser: User | null = null;
  selectedServer: Server | null = null;
  selectedChannel: Channel | null = null;
  currentStatus: UserStatus = 'online';
  isClosing = false;

  statusOptions = [
    { value: 'online', label: 'Online' },
    { value: 'away', label: 'Away' },
    { value: 'busy', label: 'Do Not Disturb' },
    { value: 'invisible', label: 'Invisible' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private mobileLayoutService: MobileLayoutService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.selectedServer$ = this.store.select(selectSelectedServer);
    this.selectedChannel$ = this.store.select(selectSelectedChannel);
  }

  ngOnInit(): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });

    this.selectedServer$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(server => {
      this.selectedServer = server;
      this.cdr.markForCheck();
    });

    this.selectedChannel$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(channel => {
      this.selectedChannel = channel;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isOpen = false;
      this.isClosing = false;
      this.closed.emit();
      this.cdr.markForCheck();
    }, 300);
  }

  setStatus(status: string): void {
    this.currentStatus = status as UserStatus;
    // TODO: Dispatch action to update user status
    this.cdr.markForCheck();
  }

  navigateTo(panel: 'servers' | 'channels' | 'members'): void {
    switch (panel) {
      case 'servers':
        this.mobileLayoutService.showServers();
        break;
      case 'channels':
        this.mobileLayoutService.showChannels();
        break;
      case 'members':
        this.mobileLayoutService.showMembers();
        break;
    }
    this.close();
  }

  openSettings(): void {
    // TODO: Open settings modal
    console.log('Open settings');
    this.close();
  }

  openNotifications(): void {
    // TODO: Open notifications panel
    console.log('Open notifications');
    this.close();
  }

  logout(): void {
    // TODO: Implement logout
    console.log('Logout');
    this.close();
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
