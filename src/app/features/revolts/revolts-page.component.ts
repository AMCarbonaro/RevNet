import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServerDiscoveryService } from '../revnet/services/server-discovery.service';

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
    private serverDiscoveryService: ServerDiscoveryService
  ) {}

  ngOnInit() {
    console.log('[RevoltsPage] Component initialized');
    this.loadRevolts();
  }

  loadRevolts() {
    this.isLoading = true;
    
    // Use the same discovery service as RevNet dashboard to get matching servers
    const query = {
      category: this.selectedCategory !== 'all' ? this.selectedCategory : undefined,
      sortBy: 'popular' as const,
      page: 1,
      limit: 100
    };

    console.log('[RevoltsPage] Loading revolts...');
    console.log('[RevoltsPage] Query:', query);
    console.log('[RevoltsPage] Selected category:', this.selectedCategory);

    this.serverDiscoveryService.discoverServers(query).subscribe({
      next: (response) => {
        console.log('[RevoltsPage] ✅ Response received:', response);
        console.log('[RevoltsPage] Servers in response:', response.servers?.length || 0);
        console.log('[RevoltsPage] Server names:', response.servers?.map(s => s.name) || []);
        
        if (!response || !response.servers) {
          console.warn('[RevoltsPage] ⚠️ Invalid response structure:', response);
          this.revolts = [];
          this.isLoading = false;
          return;
        }

        // Map Server objects from discovery service to Revolt interface
        this.revolts = response.servers
          .map(server => this.mapServerToRevolt(server))
          .filter((revolt): revolt is Revolt => revolt !== null);
        console.log('[RevoltsPage] ✅ Mapped revolts:', this.revolts.length);
        console.log('[RevoltsPage] Revolt names:', this.revolts.map(r => r.name));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[RevoltsPage] ❌ Error loading revolts:', error);
        console.error('[RevoltsPage] Error status:', error?.status);
        console.error('[RevoltsPage] Error message:', error?.message);
        console.error('[RevoltsPage] Error details:', JSON.stringify(error, null, 2));
        this.revolts = [];
        this.isLoading = false;
      }
    });
  }

  // Map Server from discovery service to Revolt interface
  private mapServerToRevolt(server: any): Revolt {
    if (!server) {
      console.warn('[RevoltsPage] ⚠️ Attempted to map null/undefined server');
      return null as any;
    }

    const mapped = {
      id: server.id,
      name: server.name,
      description: server.shortDescription || server.description || '',
      memberCount: server.memberCount || 0,
      fundingGoal: 100000, // Default funding goal (not in Server model)
      currentFunding: 0, // Default funding (not in Server model)
      category: server.category || 'community',
      status: 'active' as const,
      image: server.icon || '/assets/revolts/default.jpg',
      tags: server.tags || []
    };

    console.log('[RevoltsPage] Mapped server:', server.name, '→', mapped.name);
    return mapped;
  }

  onCategoryChange() {
    this.loadRevolts();
  }

  get filteredRevolts() {
    // Since we're filtering on the backend, just return all revolts
    return this.revolts;
  }

  getFundingProgress(revolt: Revolt): number {
    return (revolt.currentFunding / revolt.fundingGoal) * 100;
  }

  onRevoltClick(revolt: Revolt) {
    console.log('Revolt clicked:', revolt);
    // Navigate to public landing page
    this.router.navigate(['/revolts', revolt.id]);
  }

  onJoinRevolt(revolt: Revolt) {
    console.log('Join revolt:', revolt);
    // Navigate to RevNet dashboard to join the server
    this.router.navigate(['/revnet']);
  }

  onDonateToRevolt(revolt: Revolt) {
    console.log('Donate to revolt:', revolt);
    // Handle donation logic
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
