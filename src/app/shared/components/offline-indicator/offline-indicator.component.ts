import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="offline-indicator" *ngIf="isOffline$ | async">
      <div class="offline-content">
        <svg class="offline-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span class="offline-text">You're offline. Attempting to reconnect...</span>
      </div>
    </div>
  `,
  styles: [`
    .offline-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f04747;
      color: white;
      padding: 8px 16px;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      animation: slideDown 0.3s ease-out;
    }

    .offline-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .offline-icon {
      flex-shrink: 0;
    }

    .offline-text {
      white-space: nowrap;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .offline-indicator {
        padding: 12px 16px;
        font-size: 13px;
      }
      
      .offline-text {
        font-size: 13px;
      }
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  private destroy$ = new BehaviorSubject<void>(undefined);
  isOffline$ = new BehaviorSubject<boolean>(false);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Listen to online/offline events
    merge(
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(
      map(() => !navigator.onLine),
      takeUntil(this.destroy$)
    ).subscribe(isOffline => {
      this.isOffline$.next(isOffline);
      this.cdr.markForCheck();
    });

    // Initial check
    this.isOffline$.next(!navigator.onLine);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
