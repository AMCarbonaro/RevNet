import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectSelectedServer, selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { User } from '../../store/models/revnet.models';

interface Member {
  id: string;
  username: string;
  discriminator: string;
  status: 'online' | 'away' | 'dnd' | 'offline';
  isOwner: boolean;
  isAdmin: boolean;
  avatar?: string;
  roles: string[];
}

@Component({
  selector: 'app-member-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="member-list" [class.mobile-open]="mobileOpen" *ngIf="isVisible || useInputs">
      <div class="member-list-header">
        <h3>Members ({{ displayMembers.length }})</h3>
        <div class="search-box">
          <input
            type="text"
            placeholder="Search members..."
            [(ngModel)]="searchTerm"
            class="search-input"
          />
        </div>
      </div>

      <div class="member-sections">
        <!-- Online Members -->
        <div class="member-section" *ngIf="onlineMembers.length > 0">
          <div class="section-header">
            <div class="status-indicator online"></div>
            <span class="section-title">Online ({{ onlineMembers.length }})</span>
          </div>
          <div class="member-items">
            <div 
              *ngFor="let member of onlineMembers" 
              class="member-item"
              [class.owner]="member.isOwner"
              [class.admin]="member.isAdmin"
              (click)="selectMember(member)">
              <div class="member-avatar">
                {{ member.username.charAt(0).toUpperCase() }}
                <div class="status-dot" [class]="member.status"></div>
              </div>
              <div class="member-info">
                <div class="member-name">
                  {{ member.username }}
                  <span class="member-badge" *ngIf="member.isOwner">Owner</span>
                  <span class="member-badge admin" *ngIf="member.isAdmin && !member.isOwner">Admin</span>
                </div>
                <div class="member-roles" *ngIf="member.roles.length > 0">
                  <span *ngFor="let role of member.roles" class="role-tag">{{ role }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Away Members -->
        <div class="member-section" *ngIf="awayMembers.length > 0">
          <div class="section-header">
            <div class="status-indicator away"></div>
            <span class="section-title">Away ({{ awayMembers.length }})</span>
          </div>
          <div class="member-items">
            <div 
              *ngFor="let member of awayMembers" 
              class="member-item"
              [class.owner]="member.isOwner"
              [class.admin]="member.isAdmin"
              (click)="selectMember(member)">
              <div class="member-avatar">
                {{ member.username.charAt(0).toUpperCase() }}
                <div class="status-dot" [class]="member.status"></div>
              </div>
              <div class="member-info">
                <div class="member-name">
                  {{ member.username }}
                  <span class="member-badge" *ngIf="member.isOwner">Owner</span>
                  <span class="member-badge admin" *ngIf="member.isAdmin && !member.isOwner">Admin</span>
                </div>
                <div class="member-roles" *ngIf="member.roles.length > 0">
                  <span *ngFor="let role of member.roles" class="role-tag">{{ role }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Do Not Disturb Members -->
        <div class="member-section" *ngIf="dndMembers.length > 0">
          <div class="section-header">
            <div class="status-indicator dnd"></div>
            <span class="section-title">Do Not Disturb ({{ dndMembers.length }})</span>
          </div>
          <div class="member-items">
            <div 
              *ngFor="let member of dndMembers" 
              class="member-item"
              [class.owner]="member.isOwner"
              [class.admin]="member.isAdmin"
              (click)="selectMember(member)">
              <div class="member-avatar">
                {{ member.username.charAt(0).toUpperCase() }}
                <div class="status-dot" [class]="member.status"></div>
              </div>
              <div class="member-info">
                <div class="member-name">
                  {{ member.username }}
                  <span class="member-badge" *ngIf="member.isOwner">Owner</span>
                  <span class="member-badge admin" *ngIf="member.isAdmin && !member.isOwner">Admin</span>
                </div>
                <div class="member-roles" *ngIf="member.roles.length > 0">
                  <span *ngFor="let role of member.roles" class="role-tag">{{ role }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Offline Members -->
        <div class="member-section" *ngIf="offlineMembers.length > 0">
          <div class="section-header">
            <div class="status-indicator offline"></div>
            <span class="section-title">Offline ({{ offlineMembers.length }})</span>
          </div>
          <div class="member-items">
            <div 
              *ngFor="let member of offlineMembers" 
              class="member-item"
              [class.owner]="member.isOwner"
              [class.admin]="member.isAdmin"
              (click)="selectMember(member)">
              <div class="member-avatar">
                {{ member.username.charAt(0).toUpperCase() }}
                <div class="status-dot" [class]="member.status"></div>
              </div>
              <div class="member-info">
                <div class="member-name">
                  {{ member.username }}
                  <span class="member-badge" *ngIf="member.isOwner">Owner</span>
                  <span class="member-badge admin" *ngIf="member.isAdmin && !member.isOwner">Admin</span>
                </div>
                <div class="member-roles" *ngIf="member.roles.length > 0">
                  <span *ngFor="let role of member.roles" class="role-tag">{{ role }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  // Optional inputs for dashboard-layout compatibility
  @Input() members: Member[] | null = null;
  @Input() mobileOpen: boolean = false;

  private _members: Member[] = [];
  searchTerm = '';
  currentUser$: Observable<User | null>;
  selectedServer$: Observable<any>;

  private destroy$ = new Subject<void>();

  // Use inputs if provided, otherwise use NgRx
  get useInputs(): boolean {
    return this.members !== null;
  }

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.selectedServer$ = this.store.select(selectSelectedServer);
  }

  ngOnInit(): void {
    if (!this.useInputs) {
      this.loadMembers();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMembers(): void {
    // Mock member data - in real app, this would come from API
    this._members = [
      {
        id: '1',
        username: 'CurrentUser',
        discriminator: '0001',
        status: 'online',
        isOwner: true,
        isAdmin: false,
        roles: ['Owner']
      },
      {
        id: '2',
        username: 'TestUser',
        discriminator: '0002',
        status: 'away',
        isOwner: false,
        isAdmin: true,
        roles: ['Admin']
      },
      {
        id: '3',
        username: 'Member1',
        discriminator: '0003',
        status: 'online',
        isOwner: false,
        isAdmin: false,
        roles: ['Member']
      },
      {
        id: '4',
        username: 'Member2',
        discriminator: '0004',
        status: 'dnd',
        isOwner: false,
        isAdmin: false,
        roles: ['Member']
      },
      {
        id: '5',
        username: 'Member3',
        discriminator: '0005',
        status: 'offline',
        isOwner: false,
        isAdmin: false,
        roles: ['Member']
      }
    ];
  }

  get displayMembers(): Member[] {
    return this.useInputs ? (this.members || []) : this._members;
  }

  get filteredMembers(): Member[] {
    if (!this.searchTerm) return this.displayMembers;
    return this.displayMembers.filter(member =>
      member.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get onlineMembers(): Member[] {
    return this.filteredMembers.filter(member => member.status === 'online');
  }

  get awayMembers(): Member[] {
    return this.filteredMembers.filter(member => member.status === 'away');
  }

  get dndMembers(): Member[] {
    return this.filteredMembers.filter(member => member.status === 'dnd');
  }

  get offlineMembers(): Member[] {
    return this.filteredMembers.filter(member => member.status === 'offline');
  }

  selectMember(member: Member): void {
    console.log('Selected member:', member);
    // In a real app, this might open a user profile modal or DM
  }
}
