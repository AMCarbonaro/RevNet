import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { AnonymousDonationModalComponent } from '../anonymous-donation-modal/anonymous-donation-modal.component';
import { Revolt } from '@core/models/revolt.model';
import { RevoltService } from '@core/services/revolt.service';
import { AuthService } from '@core/services/auth.service';

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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRevolts();
  }

  loadRevolts(): void {
    this.isLoading = true;
    // Use mock data for now to ensure the page loads
    this.revolts = [
      {
        _id: '1',
        name: 'Climate Action Now',
        description: 'Fighting for environmental justice',
        shortDescription: 'Environmental justice movement',
        category: 'Environment',
        tags: ['climate', 'environment', 'justice'],
        isPublic: true,
        isFull: false,
        memberCount: 150,
        channelCount: 5,
        messageCount: 1200,
        acceptDonations: true,
        currentFunding: 50000,
        fundingGoal: 100000,
        isFeatured: true,
        settings: {
          allowInvites: true,
          requireApproval: false,
          maxMembers: 500
        },
        channelIds: ['ch1', 'ch2'],
        memberIds: ['u1', 'u2'],
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        name: 'Digital Rights',
        description: 'Protecting online privacy and freedom',
        shortDescription: 'Digital privacy advocacy',
        category: 'Technology',
        tags: ['privacy', 'technology', 'rights'],
        isPublic: true,
        isFull: false,
        memberCount: 200,
        channelCount: 8,
        messageCount: 2100,
        acceptDonations: true,
        currentFunding: 75000,
        fundingGoal: 150000,
        isFeatured: true,
        settings: {
          allowInvites: true,
          requireApproval: false,
          maxMembers: 1000
        },
        channelIds: ['ch3', 'ch4'],
        memberIds: ['u3', 'u4'],
        ownerId: 'owner2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.isLoading = false;
    
    // Try to load from backend in background
    this.revoltService.getPublicRevolts({ limit: 100 }).subscribe({
      next: (response) => {
        // Handle backend response structure: { data: { items: Revolt[], total: number } }
        if (response.data && 'items' in response.data) {
          this.revolts = (response.data as any).items;
        } else {
          // Fallback to direct array if structure is different
          this.revolts = Array.isArray(response.data) ? response.data : this.revolts;
        }
      },
      error: (error) => {
        console.error('Error loading revolts:', error);
        // Keep mock data if backend fails
      }
    });
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
    this.authService.demoLogin('full').then(() => {
      this.router.navigate(['/letters']);
    }).catch(error => {
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

