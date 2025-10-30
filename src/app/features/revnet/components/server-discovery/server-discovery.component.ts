import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ServerDiscoveryService, ServerDiscoveryQuery, PaginatedServers, Server } from '../../services/server-discovery.service';

@Component({
  selector: 'app-server-discovery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="server-discovery">
      <!-- Header -->
      <div class="discovery-header">
        <h2>Discover Servers</h2>
        <button class="close-btn" (click)="close()">×</button>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-bar">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            placeholder="Search servers..."
            class="search-input">
        </div>

        <div class="filters">
          <select [(ngModel)]="selectedCategory" (change)="onFilterChange()" class="filter-select">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">
              {{ category }}
            </option>
          </select>

          <select [(ngModel)]="sortBy" (change)="onFilterChange()" class="filter-select">
            <option value="popular">Popular</option>
            <option value="recent">Recent</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      <!-- Tags Filter -->
      <div class="tags-section" *ngIf="popularTags.length > 0">
        <div class="tags-label">Popular Tags:</div>
        <div class="tags-container">
          <span
            *ngFor="let tag of popularTags"
            class="tag-chip"
            [class.selected]="selectedTags.includes(tag)"
            (click)="toggleTag(tag)">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Results -->
      <div class="results-section">
        <div class="results-header" *ngIf="hasSearched">
          <span class="results-count">{{ totalResults }} servers found</span>
          <div class="loading" *ngIf="isLoading">Loading...</div>
        </div>

        <!-- Server Grid -->
        <div class="servers-grid" *ngIf="servers.length > 0">
          <div
            *ngFor="let server of servers; trackBy: trackByServerId"
            class="server-card"
            (click)="viewServer(server)">
            <div class="server-icon" [style.background-color]="getServerColor(server)">
              {{ getServerInitials(server.name) }}
            </div>
            <div class="server-info">
              <div class="server-name">
                {{ server.name }}
                <span class="verified-badge" *ngIf="server.verified">✓</span>
              </div>
              <div class="server-description">
                {{ server.shortDescription || server.description || 'No description' }}
              </div>
              <div class="server-stats">
                <span class="member-count">{{ server.memberCount }} members</span>
                <span class="online-count">{{ server.onlineCount }} online</span>
              </div>
              <div class="server-tags" *ngIf="server.tags && server.tags.length > 0">
                <span *ngFor="let tag of server.tags.slice(0, 3)" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
            <button class="join-btn" (click)="joinServer(server, $event)">
              Join
            </button>
          </div>
        </div>

        <!-- Load More -->
        <div class="load-more" *ngIf="hasMore && !isLoading">
          <button class="load-more-btn" (click)="loadMore()">
            Load More
          </button>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="hasSearched && servers.length === 0 && !isLoading">
          <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h3>No servers found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './server-discovery.component.scss'
})
export class ServerDiscoveryComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedCategory = '';
  sortBy: 'popular' | 'recent' | 'active' = 'popular';
  selectedTags: string[] = [];
  
  servers: Server[] = [];
  categories: string[] = [];
  popularTags: string[] = [];
  
  isLoading = false;
  hasSearched = false;
  hasMore = false;
  totalResults = 0;
  currentPage = 1;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<void>();

  constructor(
    private serverDiscoveryService: ServerDiscoveryService,
    private cdr: ChangeDetectorRef
  ) {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.performSearch();
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadPopularTags();
    this.performSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchSubject.next();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.servers = [];
    this.performSearch();
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.onFilterChange();
  }

  private performSearch(): void {
    this.isLoading = true;
    this.hasSearched = true;
    this.cdr.markForCheck();

    const query: ServerDiscoveryQuery = {
      search: this.searchQuery || undefined,
      category: this.selectedCategory || undefined,
      tags: this.selectedTags.length > 0 ? this.selectedTags : undefined,
      sortBy: this.sortBy,
      page: this.currentPage,
      limit: 20
    };

    this.serverDiscoveryService.discoverServers(query).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: PaginatedServers) => {
        if (this.currentPage === 1) {
          this.servers = response.servers;
        } else {
          this.servers = [...this.servers, ...response.servers];
        }
        
        this.totalResults = response.total;
        this.hasMore = response.page < response.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Search failed:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadCategories(): void {
    this.serverDiscoveryService.getCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe(categories => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
  }

  private loadPopularTags(): void {
    this.serverDiscoveryService.getPopularTags(20).pipe(
      takeUntil(this.destroy$)
    ).subscribe(tags => {
      this.popularTags = tags;
      this.cdr.markForCheck();
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.performSearch();
  }

  viewServer(server: Server): void {
    // In a real app, this would navigate to server details or join the server
    console.log('View server:', server);
  }

  joinServer(server: Server, event: Event): void {
    event.stopPropagation();
    
    this.serverDiscoveryService.joinServer(server.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (joinedServer) => {
        console.log('Joined server:', joinedServer);
        // In a real app, this would update the UI and navigate to the server
      },
      error: (error) => {
        console.error('Failed to join server:', error);
      }
    });
  }

  trackByServerId(index: number, server: Server): string {
    return server.id;
  }

  getServerInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getServerColor(server: Server): string {
    const colors = ['#7289da', '#43b581', '#faa61a', '#f04747', '#747f8d', '#5865f2', '#57f287', '#fbbbad'];
    const hash = server.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  close(): void {
    // Emit close event to parent component
    // This would be handled by the parent component
  }
}
