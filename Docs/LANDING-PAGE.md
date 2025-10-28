# Landing Page Documentation

## Overview

Revolution Network features a public landing page that showcases the platform's revolutionary Discord-like interface, allows anonymous browsing of Revolts, and enables anonymous donations without requiring user accounts. The page serves as the entry point for new users and provides a compelling call-to-action for account creation.

## 🏠 Landing Page Architecture

### Main Layout Structure

```typescript
// src/app/features/landing/components/landing-page/landing-page.component.ts
@Component({
  selector: 'app-landing-page',
  standalone: true,
  template: `
    <div class="landing-page">
      <!-- Navigation Header -->
      <app-landing-nav
        [isAuthenticated]="isAuthenticated$ | async"
        (login)="onLogin()"
        (signup)="onSignup()">
      </app-landing-nav>

      <!-- Hero Section -->
      <app-hero-section
        (getStarted)="onGetStarted()"
        (browseRevolts)="scrollToRevolts()">
      </app-hero-section>

      <!-- Features Section -->
      <app-features-section></app-features-section>

      <!-- Revolts Browse Section -->
      <app-revolts-browse
        [revolts]="featuredRevolts$ | async"
        [isLoading]="isLoadingRevolts$ | async"
        (revoltSelected)="onRevoltSelected($event)"
        (donateToRevolt)="onDonateToRevolt($event)">
      </app-revolts-browse>

      <!-- How It Works Section -->
      <app-how-it-works></app-how-it-works>

      <!-- Stats Section -->
      <app-stats-section
        [stats]="platformStats$ | async">
      </app-stats-section>

      <!-- CTA Section -->
      <app-cta-section
        (getStarted)="onGetStarted()"
        (browseRevolts)="scrollToRevolts()">
      </app-cta-section>

      <!-- Footer -->
      <app-landing-footer></app-landing-footer>

      <!-- Anonymous Donation Modal -->
      <app-anonymous-donation-modal
        *ngIf="showDonationModal"
        [revolt]="selectedRevolt"
        (close)="closeDonationModal()"
        (donationComplete)="onDonationComplete($event)">
      </app-anonymous-donation-modal>
    </div>
  `
})
export class LandingPageComponent {
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  featuredRevolts$ = this.store.select(selectFeaturedRevolts);
  isLoadingRevolts$ = this.store.select(selectIsLoadingRevolts);
  platformStats$ = this.store.select(selectPlatformStats);

  showDonationModal = false;
  selectedRevolt: Revolt | null = null;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private revoltService: RevoltService
  ) {
    this.loadFeaturedRevolts();
    this.loadPlatformStats();
  }

  onGetStarted(): void {
    this.router.navigate(['/auth/signup']);
  }

  onSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  onLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  scrollToRevolts(): void {
    document.getElementById('revolts-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  onRevoltSelected(revolt: Revolt): void {
    if (this.isAuthenticated$) {
      this.router.navigate(['/discord', revolt.id]);
    } else {
      this.router.navigate(['/auth/signup'], { 
        queryParams: { redirect: `/discord/${revolt.id}` }
      });
    }
  }

  onDonateToRevolt(revolt: Revolt): void {
    this.selectedRevolt = revolt;
    this.showDonationModal = true;
  }

  closeDonationModal(): void {
    this.showDonationModal = false;
    this.selectedRevolt = null;
  }

  onDonationComplete(donation: Donation): void {
    this.closeDonationModal();
    // Show success message
  }

  private loadFeaturedRevolts(): void {
    this.store.dispatch(RevoltActions.loadFeaturedRevolts());
  }

  private loadPlatformStats(): void {
    this.store.dispatch(PlatformActions.loadStats());
  }
}
```

## 🎯 Hero Section

### Hero Component

```typescript
// src/app/features/landing/components/hero-section/hero-section.component.ts
@Component({
  selector: 'app-hero-section',
  standalone: true,
  template: `
    <section class="hero-section">
      <!-- Cyberpunk Background Effects -->
      <div class="cyberpunk-bg">
        <div class="matrix-rain"></div>
        <div class="neon-grid"></div>
        <div class="scanlines"></div>
      </div>

      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="text-gradient">Revolution Network</span>
            <br>
            <span class="hero-subtitle">Discord for Activists</span>
          </h1>
          
          <p class="hero-description">
            Join revolutionary communities, organize movements, and fund causes that matter. 
            Experience the power of Discord-like collaboration for social change.
          </p>

          <div class="hero-actions">
            <button 
              class="btn-primary btn-large"
              (click)="getStarted.emit()">
              <i class="icon-rocket"></i>
              Get Started
            </button>
            
            <button 
              class="btn-secondary btn-large"
              (click)="browseRevolts.emit()">
              <i class="icon-compass"></i>
              Browse Revolts
            </button>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">{{ totalRevolts | number }}</span>
              <span class="stat-label">Active Revolts</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ totalMembers | number }}</span>
              <span class="stat-label">Revolutionaries</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${{ totalRaised / 100 | number:'1.0-0' }}</span>
              <span class="stat-label">Raised</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <!-- Discord Interface Preview -->
          <div class="discord-preview">
            <div class="preview-header">
              <div class="preview-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="preview-title">Revolution Network</span>
            </div>
            
            <div class="preview-content">
              <div class="preview-sidebar">
                <div class="server-item active">
                  <div class="server-icon">🌍</div>
                </div>
                <div class="server-item">
                  <div class="server-icon">⚡</div>
                </div>
                <div class="server-item">
                  <div class="server-icon">🔥</div>
                </div>
              </div>
              
              <div class="preview-chat">
                <div class="chat-header">
                  <span class="channel-name">#general</span>
                </div>
                <div class="chat-messages">
                  <div class="message">
                    <div class="message-avatar">👤</div>
                    <div class="message-content">
                      <span class="author">Revolutionary</span>
                      <span class="text">Welcome to the revolution! 🚀</span>
                    </div>
                  </div>
                  <div class="message">
                    <div class="message-avatar">👤</div>
                    <div class="message-content">
                      <span class="author">Activist</span>
                      <span class="text">Let's make change happen! 💪</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HeroSectionComponent {
  @Output() getStarted = new EventEmitter<void>();
  @Output() browseRevolts = new EventEmitter<void>();

  @Input() totalRevolts = 0;
  @Input() totalMembers = 0;
  @Input() totalRaised = 0;
}
```

## 🏛️ Revolts Browse Section

### Revolts Browse Component

```typescript
// src/app/features/landing/components/revolts-browse/revolts-browse.component.ts
@Component({
  selector: 'app-revolts-browse',
  standalone: true,
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
                <h3 class="revolt-name">{{ revolt.name }}</h3>
                <p class="revolt-description">{{ revolt.shortDescription }}</p>
                <div class="revolt-category">{{ revolt.category }}</div>
              </div>

              <div class="revolt-actions">
                <button 
                  class="action-btn"
                  (click)="onJoinRevolt(revolt, $event)"
                  [disabled]="!canJoinRevolt(revolt)">
                  <i class="icon-log-in"></i>
                  Join
                </button>
              </div>
            </div>

            <!-- Revolt Stats -->
            <div class="revolt-stats">
              <div class="stat">
                <i class="icon-users"></i>
                <span>{{ revolt.memberCount | number }} members</span>
              </div>
              <div class="stat" *ngIf="revolt.acceptDonations">
                <i class="icon-dollar-sign"></i>
                <span>${{ revolt.currentFunding / 100 | number:'1.0-0' }} raised</span>
              </div>
              <div class="stat">
                <i class="icon-hash"></i>
                <span>{{ revolt.channelCount }} channels</span>
              </div>
            </div>

            <!-- Revolt Tags -->
            <div class="revolt-tags">
              <span 
                *ngFor="let tag of revolt.tags.slice(0, 3)"
                class="tag">
                {{ tag }}
              </span>
              <span 
                *ngIf="revolt.tags.length > 3"
                class="tag-more">
                +{{ revolt.tags.length - 3 }} more
              </span>
            </div>

            <!-- Revolt Progress (if accepting donations) -->
            <div 
              *ngIf="revolt.acceptDonations && revolt.fundingGoal"
              class="revolt-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  [style.width.%]="getFundingProgress(revolt)">
                </div>
              </div>
              <div class="progress-text">
                {{ getFundingProgress(revolt) | number:'1.0-0' }}% of ${{ revolt.fundingGoal / 100 | number:'1.0-0' }} goal
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
  `
})
export class RevoltsBrowseComponent {
  @Input() revolts: Revolt[] = [];
  @Input() isLoading = false;

  @Output() revoltSelected = new EventEmitter<Revolt>();
  @Output() donateToRevolt = new EventEmitter<Revolt>();

  searchQuery = '';
  selectedCategory = '';
  sortBy = 'popular';
  filteredRevolts: Revolt[] = [];
  hasMore = true;
  page = 1;

  constructor(
    private revoltService: RevoltService,
    private authService: AuthService
  ) {}

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
        revolt.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        revolt.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase()))
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
    this.revoltSelected.emit(revolt);
  }

  onJoinRevolt(revolt: Revolt, event: Event): void {
    event.stopPropagation();
    this.revoltSelected.emit(revolt);
  }

  onDonateToRevolt(revolt: Revolt, event: Event): void {
    event.stopPropagation();
    this.donateToRevolt.emit(revolt);
  }

  canJoinRevolt(revolt: Revolt): boolean {
    return revolt.isPublic && !revolt.isFull;
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
    return revolt.id;
  }
}
```

## 💰 Anonymous Donation Modal

### Anonymous Donation Component

```typescript
// src/app/features/landing/components/anonymous-donation-modal/anonymous-donation-modal.component.ts
@Component({
  selector: 'app-anonymous-donation-modal',
  standalone: true,
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Donate to {{ revolt?.name }}</h3>
          <button 
            class="close-btn"
            (click)="close.emit()">
            <i class="icon-x"></i>
          </button>
        </div>

        <div class="modal-content">
          <!-- Revolt Info -->
          <div class="revolt-info">
            <div class="revolt-icon">
              <img 
                *ngIf="revolt?.icon" 
                [src]="revolt.icon" 
                [alt]="revolt.name">
              <div 
                *ngIf="!revolt?.icon" 
                class="revolt-initials">
                {{ getRevoltInitials(revolt?.name || '') }}
              </div>
            </div>
            <div class="revolt-details">
              <h4>{{ revolt?.name }}</h4>
              <p>{{ revolt?.shortDescription }}</p>
            </div>
          </div>

          <!-- Donation Form -->
          <form 
            [formGroup]="donationForm" 
            (ngSubmit)="onSubmit()"
            class="donation-form">
            
            <!-- Amount Selection -->
            <div class="amount-section">
              <label>Donation Amount</label>
              <div class="amount-options">
                <button 
                  *ngFor="let amount of presetAmounts"
                  type="button"
                  class="amount-btn"
                  [class.selected]="selectedAmount === amount"
                  (click)="selectAmount(amount)">
                  ${{ amount / 100 }}
                </button>
              </div>
              
              <div class="custom-amount">
                <input
                  type="number"
                  formControlName="amount"
                  placeholder="Custom amount"
                  min="1"
                  max="10000"
                  (input)="onCustomAmountChange()">
              </div>
            </div>

            <!-- Donor Info (Optional) -->
            <div class="donor-info">
              <h4>Your Information (Optional)</h4>
              <p class="info-text">
                You can donate anonymously or provide your information to receive updates.
              </p>
              
              <div class="form-group">
                <label>Name (Optional)</label>
                <input
                  type="text"
                  formControlName="donorName"
                  placeholder="Your name">
              </div>
              
              <div class="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  formControlName="donorEmail"
                  placeholder="your@email.com">
              </div>
            </div>

            <!-- Message -->
            <div class="form-group">
              <label>Message (Optional)</label>
              <textarea
                formControlName="message"
                placeholder="Leave a message of support..."
                rows="3">
              </textarea>
            </div>

            <!-- Anonymous Option -->
            <div class="anonymous-option">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  formControlName="isAnonymous"
                  (change)="onAnonymousChange()">
                <span class="checkmark"></span>
                Make this donation anonymous
              </label>
            </div>

            <!-- Donation Summary -->
            <div class="donation-summary">
              <div class="summary-row">
                <span>Donation Amount:</span>
                <span>${{ (donationForm.value.amount || 0) / 100 | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Processing Fee:</span>
                <span>${{ getProcessingFee() / 100 | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>${{ getTotalAmount() / 100 | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              class="btn-primary btn-large"
              [disabled]="!donationForm.valid || isProcessing">
              <i *ngIf="!isProcessing" class="icon-heart"></i>
              <i *ngIf="isProcessing" class="icon-loader animate-spin"></i>
              {{ isProcessing ? 'Processing...' : 'Donate Now' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AnonymousDonationModalComponent {
  @Input() revolt: Revolt | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() donationComplete = new EventEmitter<Donation>();

  donationForm: FormGroup;
  presetAmounts = [500, 1000, 2500, 5000, 10000]; // $5, $10, $25, $50, $100
  selectedAmount = 2500; // Default $25
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService
  ) {
    this.donationForm = this.fb.group({
      amount: [2500, [Validators.required, Validators.min(100), Validators.max(1000000)]],
      donorName: [''],
      donorEmail: ['', [Validators.email]],
      message: [''],
      isAnonymous: [false]
    });
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.donationForm.patchValue({ amount });
  }

  onCustomAmountChange(): void {
    const amount = this.donationForm.value.amount;
    if (amount && !this.presetAmounts.includes(amount)) {
      this.selectedAmount = amount;
    }
  }

  onAnonymousChange(): void {
    const isAnonymous = this.donationForm.value.isAnonymous;
    if (isAnonymous) {
      this.donationForm.patchValue({
        donorName: '',
        donorEmail: ''
      });
    }
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.donationForm.valid || !this.revolt) return;

    this.isProcessing = true;

    try {
      const donationData = this.donationForm.value;
      const donation = await this.donationService.processAnonymousDonation({
        revoltId: this.revolt.id,
        amount: donationData.amount,
        donorName: donationData.donorName || undefined,
        donorEmail: donationData.donorEmail || undefined,
        message: donationData.message || undefined,
        isAnonymous: donationData.isAnonymous
      });

      this.donationComplete.emit(donation);
    } catch (error) {
      console.error('Donation failed:', error);
      // Show error message
    } finally {
      this.isProcessing = false;
    }
  }

  getProcessingFee(): number {
    const amount = this.donationForm.value.amount || 0;
    return Math.round(amount * 0.029 + 30); // 2.9% + $0.30
  }

  getTotalAmount(): number {
    const amount = this.donationForm.value.amount || 0;
    return amount + this.getProcessingFee();
  }

  getRevoltInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
```

## 📊 Features Section

### Features Component

```typescript
// src/app/features/landing/components/features-section/features-section.component.ts
@Component({
  selector: 'app-features-section',
  standalone: true,
  template: `
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2>Why Revolution Network?</h2>
          <p>Built for activists, by activists</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-message-circle"></i>
            </div>
            <h3>Discord-like Chat</h3>
            <p>
              Real-time messaging, voice channels, and video calls. 
              Everything you need to coordinate and collaborate.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-users"></i>
            </div>
            <h3>Revolutionary Communities</h3>
            <p>
              Join or create Revolts (servers) focused on specific causes. 
              Build movements with like-minded activists.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-dollar-sign"></i>
            </div>
            <h3>Fund Your Cause</h3>
            <p>
              Raise money for your Revolt with built-in donation tools. 
              Anonymous donations supported.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-shield"></i>
            </div>
            <h3>Secure & Private</h3>
            <p>
              End-to-end encryption, secure voice/video, and privacy controls. 
              Your activism stays safe.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-book"></i>
            </div>
            <h3>Anthony Letters</h3>
            <p>
              Complete our educational program to unlock full platform access. 
              Learn before you lead.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="icon-mobile"></i>
            </div>
            <h3>Mobile Ready</h3>
            <p>
              Full Discord-like experience on mobile. 
              Stay connected to your cause anywhere.
            </p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class FeaturesSectionComponent {}
```

## 📈 SEO Optimization

### SEO Service

```typescript
// src/app/core/services/seo.service.ts
@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router
  ) {}

  setLandingPageMeta(): void {
    this.title.setTitle('Revolution Network - Discord for Activists | Join Revolutionary Communities');
    
    this.meta.updateTag({ name: 'description', content: 'Join Revolution Network - the Discord-like platform for activists. Create communities, fund causes, and organize movements with real-time chat, voice channels, and secure collaboration tools.' });
    
    this.meta.updateTag({ name: 'keywords', content: 'activism, discord, revolutionary, communities, social change, organizing, fundraising, secure chat' });
    
    this.meta.updateTag({ property: 'og:title', content: 'Revolution Network - Discord for Activists' });
    this.meta.updateTag({ property: 'og:description', content: 'Join revolutionary communities, organize movements, and fund causes that matter. Experience the power of Discord-like collaboration for social change.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://revnet.app' });
    this.meta.updateTag({ property: 'og:image', content: 'https://revnet.app/assets/og-image.jpg' });
    
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Revolution Network - Discord for Activists' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Join revolutionary communities, organize movements, and fund causes that matter.' });
    this.meta.updateTag({ name: 'twitter:image', content: 'https://revnet.app/assets/twitter-image.jpg' });
  }

  setRevoltMeta(revolt: Revolt): void {
    this.title.setTitle(`${revolt.name} - Revolution Network`);
    
    this.meta.updateTag({ name: 'description', content: revolt.shortDescription });
    this.meta.updateTag({ property: 'og:title', content: revolt.name });
    this.meta.updateTag({ property: 'og:description', content: revolt.shortDescription });
    this.meta.updateTag({ property: 'og:image', content: revolt.banner || revolt.icon });
  }
}
```

## 🎨 Landing Page Styling

### Landing Page Styles

```scss
// src/app/features/landing/landing-page.component.scss
.landing-page {
  min-height: 100vh;
  background: var(--discord-darkest);
  color: var(--text-primary);
}

.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;

  .cyberpunk-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    opacity: 0.1;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 1.5rem;

    .text-gradient {
      background: linear-gradient(45deg, var(--neon-green), var(--neon-cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .hero-subtitle {
    font-size: 2rem;
    color: var(--text-secondary);
    font-weight: 400;
  }

  .hero-description {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .hero-stats {
    display: flex;
    gap: 2rem;

    .stat-item {
      text-align: center;

      .stat-number {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: var(--neon-green);
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
  }

  .discord-preview {
    background: var(--discord-dark);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    .preview-header {
      background: var(--discord-darker);
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;

      .preview-dots {
        display: flex;
        gap: 0.5rem;

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;

          &.red { background: #ff5f56; }
          &.yellow { background: #ffbd2e; }
          &.green { background: #27ca3f; }
        }
      }
    }

    .preview-content {
      display: flex;
      height: 400px;

      .preview-sidebar {
        width: 60px;
        background: var(--discord-darker);
        padding: 1rem 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .server-item {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--discord-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-radius: 12px;
          }

          &.active {
            background: var(--discord-brand);
            border-radius: 12px;
          }
        }
      }

      .preview-chat {
        flex: 1;
        background: var(--discord-darkest);

        .chat-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-secondary);
          font-weight: 600;
        }

        .chat-messages {
          padding: 1rem;

          .message {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1rem;

            .message-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: var(--discord-light);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.875rem;
            }

            .message-content {
              flex: 1;

              .author {
                font-weight: 600;
                margin-right: 0.5rem;
              }

              .text {
                color: var(--text-secondary);
              }
            }
          }
        }
      }
    }
  }
}

.revolts-browse {
  padding: 6rem 0;
  background: var(--discord-dark);

  .section-header {
    text-align: center;
    margin-bottom: 4rem;

    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.25rem;
      color: var(--text-secondary);
    }
  }

  .search-filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
    align-items: center;

    .search-bar {
      position: relative;
      flex: 1;
      max-width: 400px;

      input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        background: var(--discord-darker);
        border: 1px solid var(--border-primary);
        border-radius: 6px;
        color: var(--text-primary);
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: var(--discord-brand);
        }
      }

      i {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
      }
    }

    .filters {
      display: flex;
      gap: 1rem;

      select {
        padding: 0.75rem 1rem;
        background: var(--discord-darker);
        border: 1px solid var(--border-primary);
        border-radius: 6px;
        color: var(--text-primary);
        font-size: 1rem;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--discord-brand);
        }
      }
    }
  }

  .revolts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .revolt-card {
    background: var(--discord-dark);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--discord-brand);
      box-shadow: 0 4px 20px rgba(88, 101, 242, 0.2);
      transform: translateY(-2px);
    }

    .revolt-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;

      .revolt-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .revolt-initials {
          width: 100%;
          height: 100%;
          background: var(--discord-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }
      }

      .revolt-info {
        flex: 1;
        min-width: 0;

        .revolt-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .revolt-description {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .revolt-category {
          font-size: 0.875rem;
          color: var(--discord-brand);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }
    }

    .revolt-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--text-muted);

        i {
          font-size: 1rem;
        }
      }
    }

    .revolt-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;

      .tag {
        background: var(--discord-darker);
        color: var(--text-secondary);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }

      .tag-more {
        color: var(--text-muted);
        font-size: 0.75rem;
      }
    }

    .revolt-progress {
      margin-bottom: 1rem;

      .progress-bar {
        height: 6px;
        background: var(--discord-darker);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 0.5rem;

        .progress-fill {
          height: 100%;
          background: var(--discord-brand);
          transition: width 0.3s ease;
        }
      }

      .progress-text {
        font-size: 0.875rem;
        color: var(--text-muted);
      }
    }

    .revolt-actions-bottom {
      display: flex;
      gap: 0.75rem;

      .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .hero-section {
    .hero-content {
      grid-template-columns: 1fr;
      gap: 2rem;
      text-align: center;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .hero-actions {
      justify-content: center;
    }

    .hero-stats {
      justify-content: center;
    }
  }

  .revolts-browse {
    .search-filters {
      flex-direction: column;
      align-items: stretch;

      .search-bar {
        max-width: none;
      }
    }

    .revolts-grid {
      grid-template-columns: 1fr;
    }
  }
}
```

This comprehensive landing page documentation provides the complete specifications for a public homepage that showcases Revolution Network's Discord-like features, allows anonymous Revolt browsing, and enables anonymous donations without requiring user accounts.
