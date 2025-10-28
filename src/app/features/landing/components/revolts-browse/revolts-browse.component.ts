import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Revolt } from '@core/models/revolt.model';

@Component({
  selector: 'app-revolts-browse',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './revolts-browse.component.html',
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

  onDonate(revolt: Revolt, event: Event): void {
    event.stopPropagation();
    this.donateToRevolt.emit(revolt);
  }

  canJoinRevolt(revolt: Revolt): boolean {
    return !revolt.isFull && revolt.isPublic;
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