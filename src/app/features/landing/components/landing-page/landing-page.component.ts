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
    this.revoltService.getPublicRevolts({ limit: 100 }).subscribe({
      next: (response) => {
        this.revolts = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading revolts:', error);
        this.isLoading = false;
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
    return this.revolts.reduce((total, revolt) => total + revolt.memberCount, 0);
  }

  getTotalRaised(): number {
    return this.revolts.reduce((total, revolt) => total + revolt.currentFunding, 0);
  }
}

