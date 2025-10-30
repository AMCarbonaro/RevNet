import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { User } from '../../store/models/revnet.models';

export interface TypingUser {
  id: string;
  username: string;
  avatar?: string;
  discriminator: string;
  startedTyping: number;
}

@Component({
  selector: 'app-typing-indicators',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="typing-indicators" *ngIf="typingUsers.length > 0">
      <div class="typing-content">
        <div class="typing-avatars">
          <div 
            *ngFor="let user of typingUsers.slice(0, 3)" 
            class="typing-avatar"
            [title]="user.username">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>
          <div 
            class="typing-avatar more"
            *ngIf="typingUsers.length > 3"
            [title]="'+' + (typingUsers.length - 3) + ' more'">
            +{{ typingUsers.length - 3 }}
          </div>
        </div>
        
        <div class="typing-text">
          <span *ngIf="typingUsers.length === 1">
            {{ typingUsers[0].username }} is typing
          </span>
          <span *ngIf="typingUsers.length === 2">
            {{ typingUsers[0].username }} and {{ typingUsers[1].username }} are typing
          </span>
          <span *ngIf="typingUsers.length > 2">
            {{ typingUsers[0].username }} and {{ typingUsers.length - 1 }} others are typing
          </span>
          
          <div class="typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './typing-indicators.component.scss'
})
export class TypingIndicatorsComponent implements OnInit, OnDestroy {
  @Input() typingUsers: TypingUser[] = [];
  @Input() maxDisplayUsers: number = 3;
  @Input() typingTimeout: number = 5000; // 5 seconds

  currentUser$: Observable<User | null>;
  private destroy$ = new Subject<void>();
  private typingTimeouts = new Map<string, number>();

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    // Clean up expired typing users
    setInterval(() => {
      this.cleanupExpiredUsers();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear all timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }

  addTypingUser(user: TypingUser): void {
    // Remove existing timeout for this user
    const existingTimeout = this.typingTimeouts.get(user.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Add or update user
    const existingUserIndex = this.typingUsers.findIndex(u => u.id === user.id);
    if (existingUserIndex >= 0) {
      this.typingUsers[existingUserIndex] = { ...user, startedTyping: Date.now() };
    } else {
      this.typingUsers.push({ ...user, startedTyping: Date.now() });
    }

    // Set timeout to remove user
    const timeout = window.setTimeout(() => {
      this.removeTypingUser(user.id);
    }, this.typingTimeout);

    this.typingTimeouts.set(user.id, timeout);
  }

  removeTypingUser(userId: string): void {
    const timeout = this.typingTimeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(userId);
    }

    this.typingUsers = this.typingUsers.filter(u => u.id !== userId);
  }

  updateTypingUser(userId: string): void {
    const user = this.typingUsers.find(u => u.id === userId);
    if (user) {
      // Reset the typing timer
      this.addTypingUser(user);
    }
  }

  private cleanupExpiredUsers(): void {
    const now = Date.now();
    this.typingUsers = this.typingUsers.filter(user => {
      const timeSinceTyping = now - user.startedTyping;
      if (timeSinceTyping > this.typingTimeout) {
        const timeout = this.typingTimeouts.get(user.id);
        if (timeout) {
          clearTimeout(timeout);
          this.typingTimeouts.delete(user.id);
        }
        return false;
      }
      return true;
    });
  }

  // Public method to simulate typing (for testing)
  simulateTyping(user: TypingUser): void {
    this.addTypingUser(user);
  }

  // Public method to stop typing (for testing)
  stopTyping(userId: string): void {
    this.removeTypingUser(userId);
  }
}