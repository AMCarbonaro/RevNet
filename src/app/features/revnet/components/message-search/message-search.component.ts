import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { selectCurrentUser, selectServers, selectChannels, selectSearchResults, selectSearchLoading, selectSearchError } from '../../store/selectors/revnet.selectors';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { User, Server, Channel, Message } from '../../store/models/revnet.models';
import { MessageSearchService, SearchFilters as ApiSearchFilters, SearchResult } from '../../services/message-search.service';

export interface SearchFilters {
  query: string;
  serverId: string | null;
  channelId: string | null;
  userId: string | null;
  hasAttachments: boolean | null;
  hasEmbeds: boolean | null;
  before: string | null;
  after: string | null;
  during: string | null;
}

@Component({
  selector: 'app-message-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="message-search">
      <!-- Search Header -->
      <div class="search-header">
        <div class="search-input-container">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            #searchInput
            type="text"
            [(ngModel)]="filters.query"
            (input)="onSearchInput()"
            placeholder="Search messages..."
            class="search-input">
          <button 
            class="clear-btn" 
            *ngIf="filters.query"
            (click)="clearSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <button 
          class="filters-btn"
          [class.active]="showFilters"
          (click)="toggleFilters()">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M3 17h18v-2H3v2zm0-5h18V7H3v5zm0-7v2h18V5H3z"/>
          </svg>
          Filters
        </button>
      </div>

      <!-- Search Filters -->
      <div class="search-filters" *ngIf="showFilters">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Server</label>
            <select [(ngModel)]="filters.serverId" (change)="onFilterChange()">
              <option value="">All Servers</option>
              <option *ngFor="let server of servers$ | async" [value]="server.id">
                {{ server.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Channel</label>
            <select [(ngModel)]="filters.channelId" (change)="onFilterChange()">
              <option value="">All Channels</option>
              <option *ngFor="let channel of filteredChannels" [value]="channel.id">
                # {{ channel.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>From User</label>
            <input 
              type="text" 
              [(ngModel)]="userSearchQuery"
              (input)="onUserSearch()"
              placeholder="Search users..."
              class="user-search-input">
          </div>

          <div class="filter-group">
            <label>Has Attachments</label>
            <select [(ngModel)]="filters.hasAttachments" (change)="onFilterChange()">
              <option [value]="null">Any</option>
              <option [value]="true">Yes</option>
              <option [value]="false">No</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Has Embeds</label>
            <select [(ngModel)]="filters.hasEmbeds" (change)="onFilterChange()">
              <option [value]="null">Any</option>
              <option [value]="true">Yes</option>
              <option [value]="false">No</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Date Range</label>
            <select [(ngModel)]="dateRange" (change)="onDateRangeChange()">
              <option value="">Any time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
              <option value="year">Past year</option>
            </select>
          </div>
        </div>

        <div class="filters-actions">
          <button class="reset-btn" (click)="resetFilters()">Reset Filters</button>
          <button class="search-btn" (click)="performSearch()">Search</button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading$ | async">
        <div class="loading-spinner"></div>
        <p>Searching messages...</p>
      </div>

      <!-- Search Results -->
      <div class="search-results" *ngIf="!(isLoading$ | async) && (searchResults$ | async)?.length! > 0">
        <div class="results-header">
          <h3>{{ (searchResults$ | async)?.length }} results found</h3>
          <div class="results-actions">
            <button class="export-btn" (click)="exportResults()">Export</button>
          </div>
        </div>

        <div class="results-list">
          <div 
            *ngFor="let result of searchResults$ | async" 
            class="search-result-item"
            (click)="jumpToMessage(result)">
            <div class="result-message">
              <div class="message-content">
                <div class="message-header">
                  <span class="author-name">User {{ result.authorId }}</span>
                  <span class="message-date">{{ formatDate(result.createdAt) }}</span>
                </div>
                <div class="message-text">{{ result.content }}</div>
              </div>
            </div>
            <div class="result-context">
              <span class="channel-name"># {{ result.channelName }}</span>
              <span class="server-name">{{ result.serverName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div class="no-results" *ngIf="!(isLoading$ | async) && hasSearched && (searchResults$ | async)?.length === 0">
        <svg class="no-results-icon" width="48" height="48" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <h3>No messages found</h3>
        <p>Try adjusting your search terms or filters</p>
      </div>
    </div>
  `,
  styleUrl: './message-search.component.scss'
})
export class MessageSearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  filters: SearchFilters = {
    query: '',
    serverId: null,
    channelId: null,
    userId: null,
    hasAttachments: null,
    hasEmbeds: null,
    before: null,
    after: null,
    during: null
  };

  showFilters = false;
  hasSearched = false;
  userSearchQuery = '';
  dateRange = '';
  filteredChannels: Channel[] = [];

  currentUser$: Observable<User | null>;
  servers$: Observable<Server[]>;
  channels$: Observable<Channel[]>;
  searchResults$: Observable<SearchResult[]>;
  isLoading$: Observable<boolean>;
  searchError$: Observable<string | null>;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<void>();

  constructor(
    private store: Store,
    private messageSearchService: MessageSearchService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.servers$ = this.store.select(selectServers);
    this.channels$ = this.store.select(selectChannels);
    this.searchResults$ = this.store.select(selectSearchResults);
    this.isLoading$ = this.store.select(selectSearchLoading);
    this.searchError$ = this.store.select(selectSearchError);

    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.performSearch();
    });
  }

  ngOnInit(): void {
    // Set up search input debouncing
    this.searchInput?.nativeElement?.addEventListener('input', () => {
      this.onSearchInput();
    });

    // Watch for server changes to update channels
    this.servers$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(servers => {
      this.updateFilteredChannels();
    });

    this.channels$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateFilteredChannels();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchSubject.next();
  }

  onFilterChange(): void {
    this.updateFilteredChannels();
  }

  onUserSearch(): void {
    // In a real app, this would search for users
    console.log('User search:', this.userSearchQuery);
  }

  onDateRangeChange(): void {
    const now = new Date();
    let startDate: Date;

    switch (this.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        this.filters.after = null;
        return;
    }

    this.filters.after = startDate.toISOString();
  }

  updateFilteredChannels(): void {
    this.channels$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(channels => {
      if (this.filters.serverId) {
        this.filteredChannels = channels.filter(c => c.serverId === this.filters.serverId);
      } else {
        this.filteredChannels = channels;
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearSearch(): void {
    this.filters.query = '';
    this.store.dispatch(RevNetActions.clearSearchResults());
    this.hasSearched = false;
  }

  resetFilters(): void {
    this.filters = {
      query: '',
      serverId: null,
      channelId: null,
      userId: null,
      hasAttachments: null,
      hasEmbeds: null,
      before: null,
      after: null,
      during: null
    };
    this.userSearchQuery = '';
    this.dateRange = '';
    this.updateFilteredChannels();
  }

  performSearch(): void {
    if (!this.filters.query.trim()) {
      this.store.dispatch(RevNetActions.clearSearchResults());
      this.hasSearched = false;
      this.cdr.markForCheck();
      return;
    }

    this.hasSearched = true;
    this.cdr.markForCheck();

    const apiFilters: ApiSearchFilters = {
      query: this.filters.query,
      serverId: this.filters.serverId || undefined,
      channelId: this.filters.channelId || undefined,
      userId: this.filters.userId || undefined,
      hasAttachments: this.filters.hasAttachments || undefined,
      hasEmbeds: this.filters.hasEmbeds || undefined,
      before: this.filters.before || undefined,
      after: this.filters.after || undefined,
      limit: 50
    };

    this.store.dispatch(RevNetActions.searchMessages({ filters: apiFilters }));
  }

  jumpToMessage(message: SearchResult): void {
    // Navigate to the message using the new action
    this.store.dispatch(RevNetActions.navigateToMessage({ 
      serverId: message.serverId, 
      channelId: message.channelId, 
      messageId: message.id 
    }));
  }

  getChannelName(channelId: string): string {
    // In a real app, this would get the channel name from the store
    return 'general';
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }

  exportResults(): void {
    this.searchResults$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.messageSearchService.exportResults(results);
    });
  }
}
