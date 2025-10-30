import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { User } from '../../store/models/revnet.models';

@Component({
  selector: 'app-mention-autocomplete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mention-autocomplete" *ngIf="isVisible && filteredUsers.length > 0">
      <div class="mention-list">
        <div 
          *ngFor="let user of filteredUsers; let i = index"
          class="mention-item"
          [class.selected]="i === selectedIndex"
          (click)="selectUser(user)"
          (mouseenter)="selectedIndex = i">
          <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <div class="username">{{ user.username }}</div>
            <div class="discriminator">#{{ user.discriminator }}</div>
          </div>
          <div class="user-status" [class]="user.status || 'offline'">
            <div class="status-dot"></div>
          </div>
        </div>
      </div>
      <div class="mention-hint">
        Press <kbd>Enter</kbd> to select, <kbd>↑↓</kbd> to navigate, <kbd>Esc</kbd> to close
      </div>
    </div>
  `,
  styleUrl: './mention-autocomplete.component.scss'
})
export class MentionAutocompleteComponent implements OnInit, OnDestroy {
  @Input() query: string = '';
  @Input() isVisible: boolean = false;
  @Input() position: { top: number; left: number } = { top: 0, left: 0 };
  @Output() userSelected = new EventEmitter<User>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('mentionList') mentionList!: ElementRef;

  filteredUsers: User[] = [];
  selectedIndex = 0;
  currentUser$: Observable<User | null>;
  private destroy$ = new Subject<void>();

  // Mock users for autocomplete
  private allUsers: User[] = [
    {
      id: 'user1',
      username: 'CurrentUser',
      discriminator: '0001',
      avatar: null,
      status: 'online',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      bot: false,
      system: false,
      mfa_enabled: false,
      banner: null,
      accent_color: null,
      locale: 'en-US',
      verified: false,
      email: null,
      flags: 0,
      premium_type: 0,
      public_flags: 0
    },
    {
      id: 'user2',
      username: 'TestUser',
      discriminator: '0002',
      avatar: null,
      status: 'online',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      bot: false,
      system: false,
      mfa_enabled: false,
      banner: null,
      accent_color: null,
      locale: 'en-US',
      verified: false,
      email: null,
      flags: 0,
      premium_type: 0,
      public_flags: 0
    },
    {
      id: 'user3',
      username: 'JohnDoe',
      discriminator: '0003',
      avatar: null,
      status: 'away',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      bot: false,
      system: false,
      mfa_enabled: false,
      banner: null,
      accent_color: null,
      locale: 'en-US',
      verified: false,
      email: null,
      flags: 0,
      premium_type: 0,
      public_flags: 0
    },
    {
      id: 'user4',
      username: 'JaneSmith',
      discriminator: '0004',
      avatar: null,
      status: 'dnd',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      bot: false,
      system: false,
      mfa_enabled: false,
      banner: null,
      accent_color: null,
      locale: 'en-US',
      verified: false,
      email: null,
      flags: 0,
      premium_type: 0,
      public_flags: 0
    }
  ];

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.filterUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    if (this.query) {
      this.filterUsers();
    }
  }

  private filterUsers(): void {
    if (!this.query) {
      this.filteredUsers = this.allUsers.slice(0, 5);
      return;
    }

    const query = this.query.toLowerCase();
    this.filteredUsers = this.allUsers
      .filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.discriminator.includes(query)
      )
      .slice(0, 8); // Limit to 8 results

    this.selectedIndex = 0;
  }

  selectUser(user: User): void {
    this.userSelected.emit(user);
    this.isVisible = false;
  }

  selectNext(): void {
    if (this.selectedIndex < this.filteredUsers.length - 1) {
      this.selectedIndex++;
    }
  }

  selectPrevious(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  selectCurrent(): void {
    if (this.filteredUsers[this.selectedIndex]) {
      this.selectUser(this.filteredUsers[this.selectedIndex]);
    }
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectNext();
        return true;
      case 'ArrowUp':
        event.preventDefault();
        this.selectPrevious();
        return true;
      case 'Enter':
        event.preventDefault();
        this.selectCurrent();
        return true;
      case 'Escape':
        event.preventDefault();
        this.close();
        return true;
      default:
        return false;
    }
  }
}
