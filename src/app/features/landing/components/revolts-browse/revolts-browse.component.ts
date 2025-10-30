import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ServerDiscoveryService, ServerDiscoveryQuery, Server } from '../../../revnet/services/server-discovery.service';

@Component({
  selector: 'app-revolts-browse',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './revolts-browse.component.html',
  styleUrls: ['./revolts-browse.component.scss']
})
export class RevoltsBrowseComponent implements OnInit, OnChanges {
  @Input() revolts: Server[] = [];
  @Input() isLoading = false;
  @Output() revoltClick = new EventEmitter<Server>();
  @Output() joinRevolt = new EventEmitter<Server>();
  @Output() donateToRevolt = new EventEmitter<Server>();

  searchQuery = '';
  selectedCategory = '';
  sortBy: 'popular' | 'recent' | 'active' = 'popular';
  filteredRevolts: Server[] = [];
  hasMore = true;
  page = 1;
  totalResults = 0;
  categories: string[] = [];
  
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
      this.loadRevolts();
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadRevolts();
  }

  ngOnChanges(): void {
    // If revolts are passed as input, use them directly
    if (this.revolts && this.revolts.length > 0) {
      this.filteredRevolts = [...this.revolts];
      this.cdr.markForCheck();
    } else {
      this.loadRevolts();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    this.searchSubject.next();
  }

  onFilterChange(): void {
    this.page = 1;
    this.filteredRevolts = [];
    this.loadRevolts();
  }

  private loadRevolts(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const query: ServerDiscoveryQuery = {
      search: this.searchQuery || undefined,
      category: this.selectedCategory || undefined,
      sortBy: this.sortBy,
      page: this.page,
      limit: 12
    };

    this.serverDiscoveryService.discoverServers(query).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (this.page === 1) {
          this.filteredRevolts = response.servers;
        } else {
          this.filteredRevolts = [...this.filteredRevolts, ...response.servers];
        }
        
        this.totalResults = response.total;
        this.hasMore = response.page < response.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load revolts:', error);
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

  onRevoltClick(revolt: Server): void {
    this.revoltClick.emit(revolt);
  }

  onJoinRevolt(revolt: Server, event: Event): void {
    event.stopPropagation();
    this.joinRevolt.emit(revolt);
  }

  onDonate(revolt: Server, event: Event): void {
    event.stopPropagation();
    this.donateToRevolt.emit(revolt);
  }

  canJoinRevolt(revolt: Server): boolean {
    return revolt.isDiscoverable;
  }

  getRevoltInitials(name: string): string {
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

  loadMore(): void {
    this.page++;
    this.loadRevolts();
  }

  trackByRevoltId(index: number, revolt: Server): string {
    return revolt.id;
  }
}