import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { StatusService, UserStatus, Activity, CustomStatus } from '../../services/status.service';

@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="status-dropdown" [class.open]="isOpen">
      <button 
        class="status-trigger" 
        (click)="toggleDropdown()"
        (mousedown)="$event.preventDefault()"
        [class]="'status-' + currentStatus"
        type="button">
        <div class="status-indicator" [class]="'status-' + currentStatus"></div>
        <span class="status-text">{{ getStatusText(currentStatus) }}</span>
        <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </button>

      <div class="status-menu" *ngIf="isOpen">
        <div class="status-options">
          <button 
            *ngFor="let status of statusOptions" 
            class="status-option"
            [class.active]="currentStatus === status.value"
            (click)="setStatus(status.value)">
            <div class="status-indicator" [class]="'status-' + status.value"></div>
            <span class="status-text">{{ status.label }}</span>
          </button>
        </div>

        <div class="custom-status-section" *ngIf="currentStatus !== UserStatus.INVISIBLE">
          <div class="section-header">
            <span>Custom Status</span>
            <button 
              class="clear-status-btn" 
              (click)="clearCustomStatus()"
              *ngIf="customStatus">
              Clear
            </button>
          </div>
          
          <div class="custom-status-input">
            <input
              type="text"
              [(ngModel)]="customStatusText"
              placeholder="What's on your mind?"
              class="status-input"
              (keyup.enter)="setCustomStatus()"
              (blur)="setCustomStatus()"
            />
            <div class="emoji-picker">
              <button class="emoji-btn" (click)="toggleEmojiPicker()">😀</button>
              <div class="emoji-panel" *ngIf="showEmojiPicker">
                <div class="emoji-grid">
                  <button 
                    *ngFor="let emoji of commonEmojis" 
                    class="emoji-option"
                    (click)="addEmoji(emoji)">
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="activity-section" *ngIf="currentStatus !== UserStatus.INVISIBLE">
          <div class="section-header">
            <span>Activity</span>
            <button 
              class="clear-activity-btn" 
              (click)="clearActivity()"
              *ngIf="currentActivity">
              Clear
            </button>
          </div>
          
          <div class="activity-options">
            <button 
              *ngFor="let activity of activityOptions" 
              class="activity-option"
              [class.active]="currentActivity?.type === activity.type"
              (click)="setActivity(activity.type)">
              <div class="activity-icon">{{ activity.icon }}</div>
              <span class="activity-text">{{ activity.label }}</span>
            </button>
          </div>

          <div class="activity-details" *ngIf="currentActivity">
            <input
              type="text"
              [(ngModel)]="activityName"
              placeholder="Activity name"
              class="activity-input"
            />
            <input
              type="text"
              [(ngModel)]="activityDetails"
              placeholder="Details (optional)"
              class="activity-input"
            />
            <button class="save-activity-btn" (click)="saveActivity()">Save</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './status-dropdown.component.scss'
})
export class StatusDropdownComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() statusChanged = new EventEmitter<UserStatus>();
  @Output() customStatusChanged = new EventEmitter<CustomStatus | null>();
  @Output() activityChanged = new EventEmitter<Activity | null>();

  UserStatus = UserStatus;
  currentStatus: UserStatus = UserStatus.ONLINE;
  customStatus: CustomStatus | null = null;
  currentActivity: Activity | null = null;
  customStatusText = '';
  activityName = '';
  activityDetails = '';
  showEmojiPicker = false;
  isToggling = false;

  private destroy$ = new Subject<void>();

  statusOptions = [
    { value: UserStatus.ONLINE, label: 'Online' },
    { value: UserStatus.AWAY, label: 'Away' },
    { value: UserStatus.DND, label: 'Do Not Disturb' },
    { value: UserStatus.INVISIBLE, label: 'Invisible' }
  ];

  activityOptions: { type: Activity['type'], label: string, icon: string }[] = [
    { type: 'playing', label: 'Playing a game', icon: '🎮' },
    { type: 'listening', label: 'Listening to', icon: '🎵' },
    { type: 'watching', label: 'Watching', icon: '📺' },
    { type: 'streaming', label: 'Streaming', icon: '📡' }
  ];

  commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

  private clickOutsideHandler = this.handleClickOutside.bind(this);

  constructor(private statusService: StatusService) {}

  ngOnInit(): void {
    this.statusService.getCurrentPresence().pipe(
      takeUntil(this.destroy$)
    ).subscribe(presence => {
      this.currentStatus = presence.status;
      this.customStatus = presence.customStatus || null;
      this.currentActivity = presence.activities[0] || null;
      
      if (this.customStatus) {
        this.customStatusText = this.customStatus.text;
      }
      
      if (this.currentActivity) {
        this.activityName = this.currentActivity.name;
        this.activityDetails = this.currentActivity.details || '';
      }
    });

    // Add click outside to close
    document.addEventListener('click', this.clickOutsideHandler);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.clickOutsideHandler);
  }

  private handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.status-dropdown');
    if (!dropdown && this.isOpen) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    // Prevent rapid clicking
    if (this.isToggling) return;
    
    this.isToggling = true;
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      // Focus management for better accessibility
      setTimeout(() => {
        const firstInput = document.querySelector('.status-menu input') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
    
    // Reset toggle lock after animation
    setTimeout(() => {
      this.isToggling = false;
    }, 200);
  }

  setStatus(status: UserStatus): void {
    this.currentStatus = status;
    this.statusService.setStatus(status);
    this.statusChanged.emit(status);
    this.isOpen = false;
  }

  setCustomStatus(): void {
    if (this.customStatusText.trim()) {
      const customStatus: CustomStatus = {
        text: this.customStatusText.trim()
      };
      this.customStatus = customStatus;
      this.statusService.setCustomStatus(customStatus);
      this.customStatusChanged.emit(customStatus);
    } else {
      this.clearCustomStatus();
    }
  }

  clearCustomStatus(): void {
    this.customStatus = null;
    this.customStatusText = '';
    this.statusService.clearCustomStatus();
    this.customStatusChanged.emit(null);
  }

  setActivity(activityType: Activity['type']): void {
    this.currentActivity = {
      type: activityType,
      name: this.activityName || this.activityOptions.find(a => a.type === activityType)?.label || '',
      details: this.activityDetails
    };
  }

  saveActivity(): void {
    if (this.currentActivity && this.activityName.trim()) {
      this.statusService.setActivity(this.currentActivity);
      this.activityChanged.emit(this.currentActivity);
    }
  }

  clearActivity(): void {
    this.currentActivity = null;
    this.activityName = '';
    this.activityDetails = '';
    this.statusService.clearActivity();
    this.activityChanged.emit(null);
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string): void {
    this.customStatusText += emoji;
    this.showEmojiPicker = false;
  }

  getStatusText(status: UserStatus): string {
    const option = this.statusOptions.find(s => s.value === status);
    return option ? option.label : 'Online';
  }
}
