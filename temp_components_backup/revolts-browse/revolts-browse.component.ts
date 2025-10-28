import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Revolt } from '@core/models/revolt.model';

@Component({
  selector: 'app-revolts-browse',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <section id="revolts-section" class="revolts-browse">
      <div class="container">
        <div class="section-header">
          <h2>Featured Revolts</h2>
          <p>Join revolutionary communities making real change</p>
        </div>

        <!-- Search and Filters -->
        <div class="search-filters">
          <div class="search-bar">
            <input
              type="text"
              placeholder="Search revolts..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()">
            <i class="icon-search"></i>
          </div>

          <div class="filters">
            <select [(ngModel)]="selectedCategory" (change)="onFilterChange()">
              <option value="">All Categories</option>
              <option value="activism">Activism</option>
              <option value="environment">Environment</option>
              <option value="social-justice">Social Justice</option>
              <option value="education">Education</option>
              <option value="community">Community</option>
            </select>

            <select [(ngModel)]="sortBy" (change)="onFilterChange()">
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Created</option>
              <option value="active">Most Active</option>
              <option value="funding">Most Funded</option>
            </select>
          </div>
        </div>

        <!-- Revolts Grid -->
        <div class="revolts-grid" *ngIf="!isLoading; else loadingTemplate">
          <div 
            *ngFor="let revolt of filteredRevolts; trackBy: trackByRevoltId"
            class="revolt-card"
            (click)="onRevoltClick(revolt)">
            
            <!-- Revolt Header -->
            <div class="revolt-header">
              <div class="revolt-icon">
                <img 
                  *ngIf="revolt.icon" 
                  [src]="revolt.icon" 
                  [alt]="revolt.name">
                <div 
                  *ngIf="!revolt.icon" 
                  class="revolt-initials">
                  {{ getRevoltInitials(revolt.name) }}
                </div>
              </div>
              <div class="revolt-info">
                <h3>{{ revolt.name }}</h3>
                <p>{{ revolt.shortDescription }}</p>
              </div>
              <div class="revolt-status">
                <span 
                  class="status-badge"
                  [class.active]="revolt.isActive"
                  [class.inactive]="!revolt.isActive">
                  {{ revolt.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <!-- Revolt Stats -->
            <div class="revolt-stats">
              <div class="stat">
                <span class="stat-value">{{ revolt.memberCount | number }}</span>
                <span class="stat-label">Members</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ revolt.messageCount | number }}</span>
                <span class="stat-label">Messages</span>
              </div>
              <div class="stat">
                <span class="stat-value">${{ (revolt.currentFunding / 100) | number:'1.0-0' }}</span>
                <span class="stat-label">Raised</span>
              </div>
            </div>

            <!-- Funding Progress -->
            <div class="funding-progress" *ngIf="revolt.acceptDonations">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  [style.width.%]="getFundingProgress(revolt)">
                </div>
              </div>
              <div class="progress-text">
                {{ getFundingProgress(revolt) | number:'1.0-0' }}% of ${{ (revolt.fundingGoal / 100) | number:'1.0-0' }} goal
              </div>
            </div>

            <!-- Revolt Actions -->
            <div class="revolt-actions-bottom">
              <button
                class="btn-primary btn-small"
                (click)="onJoinRevolt(revolt, $event)"
                [disabled]="!canJoinRevolt(revolt)">
                Join Revolt
              </button>
              <button
                *ngIf="revolt.acceptDonations"
                class="btn-secondary btn-small"
                (click)="onDonateToRevolt(revolt, $event)">
                <i class="icon-heart"></i>
                Donate
              </button>
            </div>
          </div>
        </div>

        <!-- Loading Template -->
        <ng-template #loadingTemplate>
          <div class="loading-grid">
            <div
              *ngFor="let i of [1,2,3,4,5,6]"
              class="revolt-card-skeleton">
              <div class="skeleton-header">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-text">
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line short"></div>
                </div>
              </div>
              <div class="skeleton-stats">
                <div class="skeleton-stat"></div>
                <div class="skeleton-stat"></div>
                <div class="skeleton-stat"></div>
              </div>
            </div>
          </div>
        </ng-template>

        <!-- Load More -->
        <div class="load-more" *ngIf="hasMore && !isLoading">
          <button 
            class="btn-outline"
            (click)="loadMore()">
            Load More Revolts
          </button>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./revolts-browse.component.scss']
})
export class RevoltsBrowseComponent implements OnInit, OnChanges {
  @Input() revolts: Revolt[] = [];
  @Input() isLoading = false;
  @Output() revoltClick = new EventEmitter<Revolt>();
  @Output() joinRevolt = new EventEmitter<Revolt>();
  @Output() donateToRevolt = new EventEmitter<Revolt>();

  searchQuery = '';
  selectedCategory = '';
  sortBy = 'popular';
  filteredRevolts: Revolt[] = [];
  hasMore = true;
  page = 1;

  ngOnInit(): void {
    this.filterRevolts();
  }

  ngOnChanges(): void {
    this.filterRevolts();
  }

  onSearch(): void {
    this.filterRevolts();
  }

  onFilterChange(): void {
    this.filterRevolts();
  }

  filterRevolts(): void {
    let filtered = [...this.revolts];

    // Search filter
    if (this.searchQuery) {
      filtered = filtered.filter(revolt =>
        revolt.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        revolt.shortDescription.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(revolt => revolt.category === this.selectedCategory);
    }

    // Sort
    switch (this.sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'active':
        filtered.sort((a, b) => b.messageCount - a.messageCount);
        break;
      case 'funding':
        filtered.sort((a, b) => b.currentFunding - a.currentFunding);
        break;
    }

    this.filteredRevolts = filtered;
  }

  onRevoltClick(revolt: Revolt): void {
    this.revoltClick.emit(revolt);
  }

  onJoinRevolt(revolt: Revolt, event: Event): void {
    event.stopPropagation();
    this.joinRevolt.emit(revolt);
  }

  onDonateToRevolt(revolt: Revolt, event: Event): void {
    event.stopPropagation();
    this.donateToRevolt.emit(revolt);
  }

  canJoinRevolt(revolt: Revolt): boolean {
    return revolt.isActive && revolt.isPublic;
  }

  getRevoltInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getFundingProgress(revolt: Revolt): number {
    if (!revolt.fundingGoal) return 0;
    return (revolt.currentFunding / revolt.fundingGoal) * 100;
  }

  loadMore(): void {
    this.page++;
    // Load more revolts
  }

  trackByRevoltId(index: number, revolt: Revolt): string {
    return revolt._id;
  }
}