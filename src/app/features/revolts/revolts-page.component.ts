import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RevoltService } from '../../core/services/revolt.service';

interface Revolt {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  fundingGoal: number;
  currentFunding: number;
  category: string;
  status: 'active' | 'funding' | 'completed';
  image: string;
  tags: string[];
}

@Component({
  selector: 'app-revolts-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revolts-page.component.html',
  styleUrls: ['./revolts-page.component.scss']
})
export class RevoltsPageComponent implements OnInit {
  revolts: Revolt[] = [];
  isLoading = true;
  selectedCategory = 'all';

  categories = [
    { id: 'all', name: 'All Revolts', icon: '🌍' },
    { id: 'climate', name: 'Climate Action', icon: '🌱' },
    { id: 'social', name: 'Social Justice', icon: '⚖️' },
    { id: 'community', name: 'Community', icon: '🏘️' },
    { id: 'political', name: 'Political', icon: '🗳️' },
    { id: 'tech', name: 'Technology', icon: '💻' }
  ];

  constructor(
    private router: Router,
    private revoltService: RevoltService
  ) {}

  ngOnInit() {
    this.loadRevolts();
  }

  loadRevolts() {
    this.isLoading = true;
    // Use the same service - data will now be consistent
    this.revoltService.getPublicRevolts({ limit: 100 }).subscribe({
      next: (response) => {
        this.revolts = this.mapBackendRevolts(response.data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading revolts:', error);
        this.isLoading = false;
      }
    });
  }

  // Map backend Revolt model to component's interface
  private mapBackendRevolts(backendRevolts: any[]): Revolt[] {
    return backendRevolts.map(r => ({
      id: r._id,
      name: r.name,
      description: r.description,
      memberCount: r.memberCount,
      fundingGoal: r.fundingGoal,
      currentFunding: r.currentFunding,
      category: r.category,
      status: this.determineStatus(r),
      image: r.icon || '/assets/revolts/default.jpg',
      tags: r.tags
    }));
  }

  private determineStatus(revolt: any): 'active' | 'funding' | 'completed' {
    if (revolt.currentFunding >= revolt.fundingGoal) return 'completed';
    if (revolt.acceptDonations) return 'funding';
    return 'active';
  }

  get filteredRevolts() {
    if (this.selectedCategory === 'all') {
      return this.revolts;
    }
    return this.revolts.filter(revolt => revolt.category === this.selectedCategory);
  }

  getFundingProgress(revolt: Revolt): number {
    return (revolt.currentFunding / revolt.fundingGoal) * 100;
  }

  onRevoltClick(revolt: Revolt) {
    console.log('Revolt clicked:', revolt);
    // Navigate to revolt details page
  }

  onJoinRevolt(revolt: Revolt) {
    console.log('Join revolt:', revolt);
    // Handle join revolt logic
  }

  onDonateToRevolt(revolt: Revolt) {
    console.log('Donate to revolt:', revolt);
    // Handle donation logic
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
