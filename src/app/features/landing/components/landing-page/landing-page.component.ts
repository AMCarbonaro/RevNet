import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { RevoltsBrowseComponent } from '../revolts-browse/revolts-browse.component';
import { AnonymousDonationModalComponent } from '../anonymous-donation-modal/anonymous-donation-modal.component';
import { Revolt } from '@core/models/revolt.model';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, HeroSectionComponent, RevoltsBrowseComponent, AnonymousDonationModalComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  revolts: Revolt[] = [];
  isLoading = false;
  selectedRevolt: Revolt | null = null;
  showDonationModal = false;

  ngOnInit(): void {
    this.loadRevolts();
  }

  loadRevolts(): void {
    this.isLoading = true;
    // Mock data for now - replace with actual service call
    setTimeout(() => {
      this.revolts = [
        {
          _id: '1',
          name: 'Climate Action Now',
          description: 'Join the fight against climate change with direct action and community organizing.',
          shortDescription: 'Fighting climate change through direct action',
          category: 'environment',
          tags: ['climate', 'environment', 'activism'],
          isPublic: true,
          isFull: false,
          memberCount: 1250,
          channelCount: 8,
          messageCount: 15420,
          acceptDonations: true,
          currentFunding: 2500000, // $25,000 in cents
          fundingGoal: 10000000, // $100,000 in cents
          isFeatured: true,
          settings: {
            allowInvites: true,
            requireApproval: false,
            maxMembers: 5000
          },
          channelIds: [],
          memberIds: [],
          ownerId: 'owner1',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-10-28')
        },
        {
          _id: '2',
          name: 'Social Justice Warriors',
          description: 'Organizing for equality, justice, and human rights in our communities.',
          shortDescription: 'Fighting for equality and justice',
          category: 'social-justice',
          tags: ['justice', 'equality', 'rights'],
          isPublic: true,
          isFull: false,
          memberCount: 890,
          channelCount: 6,
          messageCount: 12300,
          acceptDonations: true,
          currentFunding: 1800000, // $18,000 in cents
          fundingGoal: 5000000, // $50,000 in cents
          isFeatured: true,
          settings: {
            allowInvites: true,
            requireApproval: true,
            maxMembers: 2000
          },
          channelIds: [],
          memberIds: [],
          ownerId: 'owner2',
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date('2024-10-28')
        },
        {
          _id: '3',
          name: 'Community Education Hub',
          description: 'Free educational resources and workshops for underserved communities.',
          shortDescription: 'Free education for all',
          category: 'education',
          tags: ['education', 'community', 'learning'],
          isPublic: true,
          isFull: false,
          memberCount: 2100,
          channelCount: 12,
          messageCount: 28900,
          acceptDonations: true,
          currentFunding: 3200000, // $32,000 in cents
          fundingGoal: 7500000, // $75,000 in cents
          isFeatured: true,
          settings: {
            allowInvites: true,
            requireApproval: false,
            maxMembers: 3000
          },
          channelIds: [],
          memberIds: [],
          ownerId: 'owner3',
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date('2024-10-28')
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  onGetStarted(): void {
    console.log('Get Started clicked');
    // Navigate to registration or scroll to revolts
    document.getElementById('revolts-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  onBrowseRevolts(): void {
    console.log('Browse Revolts clicked');
    document.getElementById('revolts-section')?.scrollIntoView({ behavior: 'smooth' });
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
    return this.revolts.reduce((total, revolt) => total + revolt.memberCount, 0);
  }

  getTotalRaised(): number {
    return this.revolts.reduce((total, revolt) => total + revolt.currentFunding, 0);
  }
}

