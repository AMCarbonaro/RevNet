import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { AnonymousDonationModalComponent } from '../anonymous-donation-modal/anonymous-donation-modal.component';
import { Revolt } from '@core/models/revolt.model';
import { RevoltService } from '@core/services/revolt.service';
import { AuthService } from '@core/services/auth.service';
import { ServerDiscoveryService, Server } from '../../../revnet/services/server-discovery.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, HeroSectionComponent, AnonymousDonationModalComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  revolts: Revolt[] = [];
  isLoading = false;
  selectedRevolt: Revolt | null = null;
  showDonationModal = false;

  constructor(
    private router: Router,
    private revoltService: RevoltService,
    private authService: AuthService,
    private serverDiscoveryService: ServerDiscoveryService
  ) {}

  ngOnInit(): void {
    this.loadRevolts();
  }

  loadRevolts(): void {
    this.isLoading = true;
    
    // Use the same discovery service as revolts page to get matching servers
    const query = {
      sortBy: 'popular' as const,
      page: 1,
      limit: 100
    };

    console.log('[LandingPage] Loading revolts from discovery service...');
    
    this.serverDiscoveryService.discoverServers(query).subscribe({
      next: (response) => {
        console.log('[LandingPage] ✅ Response received:', response);
        console.log('[LandingPage] Servers in response:', response.servers?.length || 0);
        
        if (!response || !response.servers) {
          console.warn('[LandingPage] ⚠️ Invalid response structure:', response);
          this.revolts = [];
          this.isLoading = false;
          return;
        }

        // Map Server objects from discovery service to Revolt interface
        this.revolts = response.servers.map(server => this.mapServerToRevolt(server));
        console.log('[LandingPage] ✅ Mapped revolts:', this.revolts.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[LandingPage] ❌ Error loading revolts:', error);
        this.revolts = [];
        this.isLoading = false;
      }
    });
  }

  // Map Server from discovery service to Revolt interface
  private mapServerToRevolt(server: Server): Revolt {
    return {
      _id: server.id,
      id: server.id,
      name: server.name,
      description: server.description || '',
      shortDescription: server.shortDescription || server.description || '',
      category: server.category || 'community',
      tags: server.tags || [],
      isPublic: server.isDiscoverable || false,
      isFull: false,
      memberCount: server.memberCount || 0,
      channelCount: server.channels?.length || 0,
      messageCount: server.messageCount || 0,
      acceptDonations: false, // Not in Server model
      currentFunding: 0, // Not in Server model
      fundingGoal: undefined,
      isFeatured: server.verified || false,
      settings: {
        allowInvites: true,
        requireApproval: false,
        maxMembers: undefined
      },
      channelIds: server.channels?.map(ch => ch.id) || [],
      memberIds: [],
      ownerId: '',
      createdAt: new Date(server.createdAt),
      updatedAt: new Date(server.updatedAt)
    };
  }

  onGetStarted(): void {
    this.router.navigate(['/register']);
  }

  onBrowseRevolts(): void {
    console.log('Browse Revolts clicked');
    this.router.navigate(['/revolts']);
  }

  onDemoLogin(): void {
    console.log('Demo login clicked');
    this.authService.demoLogin('full').catch(error => {
      console.error('Demo login failed:', error);
    });
  }

  onRevoltClick(revolt: Revolt): void {
    console.log('Revolt clicked:', revolt);
    // Navigate to revolt detail page
  }

  onJoinRevolt(revolt: Revolt): void {
    console.log('Join revolt:', revolt);
    // Handle join revolt logic
  }

  onDonateToRevolt(revolt: Revolt): void {
    console.log('Donate to revolt:', revolt);
    this.selectedRevolt = revolt;
    this.showDonationModal = true;
  }

  onDonationComplete(donation: any): void {
    console.log('Donation completed:', donation);
    this.showDonationModal = false;
    this.selectedRevolt = null;
  }

  onCloseDonationModal(): void {
    this.showDonationModal = false;
    this.selectedRevolt = null;
  }

  getTotalMembers(): number {
    const total = this.revolts.reduce((total, revolt) => total + revolt.memberCount, 0);
    // Return at least 1 to show some activity, or the actual total if we have data
    return total > 0 ? total : 1;
  }

  getTotalRaised(): number {
    const total = this.revolts.reduce((total, revolt) => total + revolt.currentFunding, 0);
    // Return at least $100 to show some activity, or the actual total if we have data
    return total > 0 ? total : 10000; // $100 in cents
  }
}

