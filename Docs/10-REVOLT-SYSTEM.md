# Revolt Management System Documentation

## Overview

Revolution Network features a comprehensive Revolt (Discord-style server) management system that enables users to create, manage, and participate in revolutionary communities. The system includes a 4-step creation wizard, channel management, role systems, member management, and real-time collaboration features.

## 🏛️ Revolt Creation System

### 4-Step Creation Wizard

#### Step 1: Revolt Basics
```typescript
interface RevoltBasics {
  name: string;
  description: string;
  shortDescription: string;
  category: RevoltCategory;
  tags: string[];
  isPublic: boolean;
  location?: {
    city: string;
    state: string;
    country: string;
  };
}

// Revolt categories
type RevoltCategory = 
  | 'activism'        // Political activism
  | 'environment'     // Environmental causes
  | 'social-justice'  // Social justice movements
  | 'education'       // Educational initiatives
  | 'community'       // Community organizing
  | 'media'           // Media and journalism
  | 'research'        // Research and analysis
  | 'legal'           // Legal challenges
  | 'art'             // Art and culture
  | 'other';          // Other revolutionary causes
```

#### Step 2: Funding & Goals
```typescript
interface RevoltFunding {
  fundingGoal?: number;        // Optional target amount in cents
  fundingPurpose: string;      // What the funding is for
  budgetBreakdown?: BudgetItem[];
  acceptDonations: boolean;    // Whether to accept donations
}

interface BudgetItem {
  category: string;
  amount: number;
  description: string;
}

// Funding display options
interface FundingDisplay {
  showAmount: boolean;         // Show current funding amount
  showDonors: boolean;         // Show donor list
  showProgress: boolean;       // Show progress bar
  anonymousDonations: boolean; // Allow anonymous donations
}
```

#### Step 3: Channels & Structure
```typescript
interface RevoltChannels {
  defaultChannels: DefaultChannel[];
  customChannels: CustomChannel[];
  channelCategories: ChannelCategory[];
}

interface DefaultChannel {
  name: string;
  type: 'text' | 'voice' | 'video';
  description: string;
  position: number;
}

interface CustomChannel {
  name: string;
  type: 'text' | 'voice' | 'video';
  description: string;
  position: number;
  permissions: ChannelPermissions;
}

interface ChannelCategory {
  name: string;
  channels: string[];
  collapsed: boolean;
}
```

#### Step 4: Roles & Permissions
```typescript
interface RevoltRoles {
  defaultRoles: DefaultRole[];
  customRoles: CustomRole[];
  permissionSystem: PermissionSystem;
}

interface DefaultRole {
  name: 'Admin' | 'Moderator' | 'Member';
  color: string;
  permissions: string[];
  isDefault: boolean;
}

interface CustomRole {
  name: string;
  color: string;
  permissions: string[];
  position: number;
  mentionable: boolean;
}

interface PermissionSystem {
  channelPermissions: ChannelPermission[];
  revoltPermissions: RevoltPermission[];
  roleHierarchy: string[];
}
```

### Creation Wizard Component

```typescript
// src/app/features/revolts/components/revolt-creation-wizard/revolt-creation-wizard.component.ts
@Component({
  selector: 'app-revolt-creation-wizard',
  standalone: true,
  template: `
    <div class="revolt-creation-wizard">
      <div class="wizard-header">
        <h1>Create Revolutionary Revolt</h1>
        <div class="step-indicator">
          <div 
            *ngFor="let step of steps; let i = index"
            class="step"
            [class.completed]="currentStep > step.id"
            [class.active]="currentStep === step.id">
            <span class="step-number">{{ step.id }}</span>
            <span class="step-title">{{ step.title }}</span>
          </div>
        </div>
      </div>

      <div class="wizard-content">
        <ng-container [ngSwitch]="currentStep">
          <app-revolt-basics-step
            *ngSwitchCase="1"
            [data]="revoltData"
            (complete)="onStepComplete($event)">
          </app-revolt-basics-step>
          
          <app-revolt-funding-step
            *ngSwitchCase="2"
            [data]="revoltData"
            (complete)="onStepComplete($event)">
          </app-revolt-funding-step>
          
          <app-revolt-channels-step
            *ngSwitchCase="3"
            [data]="revoltData"
            (complete)="onStepComplete($event)">
          </app-revolt-channels-step>
          
          <app-revolt-roles-step
            *ngSwitchCase="4"
            [data]="revoltData"
            (complete)="onStepComplete($event)"
            (submit)="onSubmit()">
          </app-revolt-roles-step>
        </ng-container>
      </div>
    </div>
  `
})
export class RevoltCreationWizardComponent {
  currentStep = 1;
  revoltData: Partial<Revolt> = {};
  isSubmitting = false;

  steps = [
    { id: 1, title: 'Revolt Basics', component: 'revolt-basics' },
    { id: 2, title: 'Funding & Goals', component: 'revolt-funding' },
    { id: 3, title: 'Channels & Structure', component: 'revolt-channels' },
    { id: 4, title: 'Roles & Permissions', component: 'revolt-roles' }
  ];

  constructor(
    private revoltService: RevoltService,
    private router: Router,
    private store: Store<AppState>
  ) {}

  onStepComplete(stepData: any): void {
    this.revoltData = { ...this.revoltData, ...stepData };
    this.currentStep++;
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting = true;
    
    try {
      const revolt = await this.revoltService.createRevolt(this.revoltData as CreateRevoltRequest);
      
      this.store.dispatch(RevoltActions.createRevoltSuccess({ revolt }));
      this.router.navigate(['/revolts', revolt.id]);
    } catch (error) {
      console.error('Failed to create Revolt:', error);
      this.store.dispatch(RevoltActions.createRevoltFailure({ error: error.message }));
    } finally {
      this.isSubmitting = false;
    }
  }
}
```

## 💰 Revolt Funding System

### Funding Progress Tracking

```typescript
interface RevoltFunding {
  revoltId: string;
  fundingGoal?: number;        // Optional target amount in cents
  currentFunding: number;      // Current amount raised
  donorCount: number;          // Number of donors
  averageDonation: number;     // Average donation amount
  fundingProgress: number;     // Percentage of goal reached
  fundingTrends: FundingTrend[];
  recentDonations: Donation[];
  topDonors: DonorSummary[];
}

interface FundingTrend {
  date: Date;
  amount: number;
  donations: number;
  cumulative: number;
}

interface DonorSummary {
  name: string;
  totalDonated: number;
  donationCount: number;
  lastDonation: Date;
  isAnonymous: boolean;
}

// Funding status calculation
export function calculateFundingStatus(revolt: Revolt): RevoltFunding {
  const fundingProgress = revolt.fundingGoal 
    ? (revolt.currentFunding / revolt.fundingGoal) * 100 
    : 0;
  
  const averageDonation = revolt.donorCount > 0 
    ? revolt.currentFunding / revolt.donorCount 
    : 0;

  return {
    revoltId: revolt.id,
    fundingGoal: revolt.fundingGoal,
    currentFunding: revolt.currentFunding,
    donorCount: revolt.donorCount,
    averageDonation,
    fundingProgress,
    fundingTrends: revolt.fundingTrends || [],
    recentDonations: revolt.recentDonations || [],
    topDonors: revolt.topDonors || []
  };
}
```

### Funding Display Component

```typescript
// src/app/features/revolts/components/revolt-funding/revolt-funding.component.ts
@Component({
  selector: 'app-revolt-funding',
  standalone: true,
  template: `
    <div class="revolt-funding">
      <div class="funding-header">
        <h3>Funding Progress</h3>
        <div class="funding-amount">
          ${{ funding.currentFunding / 100 | number:'1.2-2' }}
          <span *ngIf="funding.fundingGoal" class="funding-goal">
            of ${{ funding.fundingGoal / 100 | number:'1.2-2' }} goal
          </span>
        </div>
      </div>

      <div class="progress-bar" *ngIf="funding.fundingGoal">
        <div 
          class="progress-fill"
          [style.width.%]="funding.fundingProgress">
        </div>
        <span class="progress-text">
          {{ funding.fundingProgress | number:'1.0-0' }}% of goal
        </span>
      </div>

      <div class="funding-stats">
        <div class="stat">
          <span class="stat-value">{{ funding.donorCount }}</span>
          <span class="stat-label">Donors</span>
        </div>
        <div class="stat">
          <span class="stat-value">${{ funding.averageDonation / 100 | number:'1.2-2' }}</span>
          <span class="stat-label">Avg Donation</span>
        </div>
      </div>

      <div class="recent-donations" *ngIf="funding.recentDonations.length > 0">
        <h4>Recent Donations</h4>
        <div class="donation-list">
          <div 
            *ngFor="let donation of funding.recentDonations" 
            class="donation-item">
            <div class="donation-amount">
              ${{ donation.amount / 100 | number:'1.2-2' }}
            </div>
            <div class="donation-info">
              <span class="donor-name" *ngIf="!donation.isAnonymous">
                {{ donation.donor?.name }}
              </span>
              <span class="donor-name" *ngIf="donation.isAnonymous">
                Anonymous
              </span>
              <span class="donation-time">
                {{ donation.createdAt | date:'short' }}
              </span>
            </div>
            <div class="donation-message" *ngIf="donation.message">
              "{{ donation.message }}"
            </div>
          </div>
        </div>
      </div>

      <div class="funding-actions">
        <button 
          class="donate-btn"
          (click)="openDonationModal()">
          Donate to Revolt
        </button>
      </div>
    </div>
  `
})
export class RevoltFundingComponent {
  @Input() revoltId!: string;
  @Input() funding!: RevoltFunding;

  constructor(
    private dialog: MatDialog,
    private revoltService: RevoltService
  ) {}

  openDonationModal(): void {
    const dialogRef = this.dialog.open(DonationModalComponent, {
      data: { revoltId: this.revoltId },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.funding = { ...this.funding, ...result };
      }
    });
  }
}
```

## 👥 Member Management System

### Member List Component

```typescript
// src/app/features/revolts/components/member-list/member-list.component.ts
@Component({
  selector: 'app-member-list',
  standalone: true,
  template: `
    <div class="member-list">
      <div class="member-list-header">
        <h3>Members — {{ members.length }}</h3>
        <div class="member-actions" *ngIf="canManageMembers">
          <button (click)="openInviteModal()">
            <i class="icon-plus"></i>
            Invite
          </button>
        </div>
      </div>

      <div class="member-groups">
        <div class="member-group" *ngFor="let group of memberGroups">
          <div class="group-header">
            <span class="group-name">{{ group.name }}</span>
            <span class="group-count">{{ group.members.length }}</span>
          </div>
          
          <div class="members">
            <div 
              *ngFor="let member of group.members" 
              class="member-item"
              [class.online]="member.status === 'online'"
              [class.away]="member.status === 'away'"
              [class.busy]="member.status === 'busy'"
              [class.invisible]="member.status === 'invisible'">
              
              <div class="member-avatar">
                <img [src]="member.avatar" [alt]="member.name">
                <div class="status-indicator" [class]="member.status"></div>
              </div>
              
              <div class="member-info">
                <div class="member-name">
                  {{ member.name }}
                  <span class="member-role" [style.color]="member.roleColor">
                    {{ member.role }}
                  </span>
                </div>
                <div class="member-activity" *ngIf="member.activity">
                  {{ member.activity }}
                </div>
              </div>
              
              <div class="member-actions" *ngIf="canManageMembers">
                <button 
                  (click)="openMemberMenu(member)"
                  class="member-menu-btn">
                  <i class="icon-more"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MemberListComponent {
  @Input() revoltId!: string;
  @Input() members: RevoltMember[] = [];
  @Input() canManageMembers = false;

  memberGroups: MemberGroup[] = [];

  constructor(
    private revoltService: RevoltService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.groupMembers();
  }

  groupMembers(): void {
    const groups: { [key: string]: RevoltMember[] } = {};
    
    this.members.forEach(member => {
      const role = member.role || 'Member';
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(member);
    });

    this.memberGroups = Object.entries(groups).map(([name, members]) => ({
      name,
      members: members.sort((a, b) => a.name.localeCompare(b.name))
    }));
  }

  openInviteModal(): void {
    const dialogRef = this.dialog.open(InviteMemberModalComponent, {
      data: { revoltId: this.revoltId },
      width: '500px'
    });
  }

  openMemberMenu(member: RevoltMember): void {
    const dialogRef = this.dialog.open(MemberMenuComponent, {
      data: { member, revoltId: this.revoltId },
      width: '300px'
    });
  }
}
```

### Role Management System

```typescript
// src/app/features/revolts/components/role-management/role-management.component.ts
@Component({
  selector: 'app-role-management',
  standalone: true,
  template: `
    <div class="role-management">
      <div class="role-header">
        <h3>Roles & Permissions</h3>
        <button 
          *ngIf="canManageRoles"
          (click)="openCreateRoleModal()"
          class="create-role-btn">
          <i class="icon-plus"></i>
          Create Role
        </button>
      </div>

      <div class="roles-list">
        <div 
          *ngFor="let role of roles; trackBy: trackByRoleId"
          class="role-item"
          [class.default-role]="role.isDefault">
          
          <div class="role-info">
            <div class="role-color" [style.background-color]="role.color"></div>
            <div class="role-details">
              <h4>{{ role.name }}</h4>
              <p>{{ role.memberCount }} members</p>
            </div>
          </div>

          <div class="role-permissions">
            <div class="permission-tags">
              <span 
                *ngFor="let permission of role.permissions.slice(0, 3)"
                class="permission-tag">
                {{ permission }}
              </span>
              <span 
                *ngIf="role.permissions.length > 3"
                class="permission-more">
                +{{ role.permissions.length - 3 }} more
              </span>
            </div>
          </div>

          <div class="role-actions" *ngIf="canManageRoles && !role.isDefault">
            <button 
              (click)="editRole(role)"
              class="edit-btn">
              <i class="icon-edit"></i>
            </button>
            <button 
              (click)="deleteRole(role)"
              class="delete-btn">
              <i class="icon-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoleManagementComponent {
  @Input() revoltId!: string;
  @Input() roles: RevoltRole[] = [];
  @Input() canManageRoles = false;

  constructor(
    private revoltService: RevoltService,
    private dialog: MatDialog
  ) {}

  trackByRoleId(index: number, role: RevoltRole): string {
    return role.id;
  }

  openCreateRoleModal(): void {
    const dialogRef = this.dialog.open(CreateRoleModalComponent, {
      data: { revoltId: this.revoltId },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(newRole => {
      if (newRole) {
        this.roles = [...this.roles, newRole];
      }
    });
  }

  editRole(role: RevoltRole): void {
    const dialogRef = this.dialog.open(EditRoleModalComponent, {
      data: { role, revoltId: this.revoltId },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(updatedRole => {
      if (updatedRole) {
        this.roles = this.roles.map(r => r.id === role.id ? updatedRole : r);
      }
    });
  }

  async deleteRole(role: RevoltRole): Promise<void> {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      try {
        await this.revoltService.deleteRole(this.revoltId, role.id);
        this.roles = this.roles.filter(r => r.id !== role.id);
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  }
}
```

## 📊 Revolt Analytics

### Analytics Dashboard Component

```typescript
// src/app/features/revolts/components/revolt-analytics/revolt-analytics.component.ts
@Component({
  selector: 'app-revolt-analytics',
  standalone: true,
  template: `
    <div class="revolt-analytics">
      <div class="analytics-header">
        <h2>Revolt Analytics</h2>
        <div class="time-range-selector">
          <select 
            [(ngModel)]="timeRange"
            (change)="onTimeRangeChange()">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">👥</div>
          <div class="metric-content">
            <h3>{{ analytics.memberCount | number }}</h3>
            <p>Total Members</p>
            <span class="metric-change" [class.positive]="analytics.memberGrowth > 0">
              {{ analytics.memberGrowth > 0 ? '+' : '' }}{{ analytics.memberGrowth }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">💬</div>
          <div class="metric-content">
            <h3>{{ analytics.messageCount | number }}</h3>
            <p>Messages Sent</p>
            <span class="metric-change" [class.positive]="analytics.messageGrowth > 0">
              {{ analytics.messageGrowth > 0 ? '+' : '' }}{{ analytics.messageGrowth }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">🎤</div>
          <div class="metric-content">
            <h3>{{ analytics.voiceMinutes | number }}</h3>
            <p>Voice Minutes</p>
            <span class="metric-change" [class.positive]="analytics.voiceGrowth > 0">
              {{ analytics.voiceGrowth > 0 ? '+' : '' }}{{ analytics.voiceGrowth }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h3>${{ analytics.totalDonations / 100 | number:'1.2-2' }}</h3>
            <p>Total Donations</p>
            <span class="metric-change" [class.positive]="analytics.donationGrowth > 0">
              {{ analytics.donationGrowth > 0 ? '+' : '' }}{{ analytics.donationGrowth }}%
            </span>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-container">
          <h3>Member Growth</h3>
          <app-line-chart [data]="analytics.memberGrowthChart"></app-line-chart>
        </div>

        <div class="chart-container">
          <h3>Message Activity</h3>
          <app-bar-chart [data]="analytics.messageActivityChart"></app-bar-chart>
        </div>

        <div class="chart-container">
          <h3>Channel Activity</h3>
          <app-pie-chart [data]="analytics.channelActivityChart"></app-pie-chart>
        </div>
      </div>
    </div>
  `
})
export class RevoltAnalyticsComponent {
  @Input() revoltId!: string;
  
  analytics: RevoltAnalytics | null = null;
  timeRange: '7d' | '30d' | '90d' | 'all' = '30d';

  constructor(private revoltService: RevoltService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  async loadAnalytics(): Promise<void> {
    try {
      this.analytics = await this.revoltService.getAnalytics(this.revoltId, this.timeRange);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  onTimeRangeChange(): void {
    this.loadAnalytics();
  }
}
```

## 🔍 Revolt Discovery

### Discovery Component

```typescript
// src/app/features/revolts/components/revolt-discovery/revolt-discovery.component.ts
@Component({
  selector: 'app-revolt-discovery',
  standalone: true,
  template: `
    <div class="revolt-discovery">
      <div class="discovery-header">
        <h1>Discover Revolts</h1>
        <p>Find revolutionary communities to join and support</p>
      </div>

      <div class="search-section">
        <div class="search-bar">
          <input
            type="text"
            placeholder="Search revolts..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()">
          <button (click)="onSearch()">
            <i class="icon-search"></i>
          </button>
        </div>

        <div class="filters">
          <select [(ngModel)]="filters.category" (change)="onFilterChange()">
            <option value="">All Categories</option>
            <option value="activism">Activism</option>
            <option value="environment">Environment</option>
            <option value="social-justice">Social Justice</option>
            <option value="education">Education</option>
            <option value="community">Community</option>
            <option value="media">Media</option>
            <option value="research">Research</option>
            <option value="legal">Legal</option>
            <option value="art">Art</option>
            <option value="other">Other</option>
          </select>

          <select [(ngModel)]="filters.sortBy" (change)="onFilterChange()">
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="active">Most Active</option>
            <option value="funding">Most Funded</option>
          </select>

          <select [(ngModel)]="filters.memberCount" (change)="onFilterChange()">
            <option value="">Any Size</option>
            <option value="small">Small (1-50)</option>
            <option value="medium">Medium (51-500)</option>
            <option value="large">Large (500+)</option>
          </select>
        </div>
      </div>

      <div class="revolts-grid">
        <div 
          *ngFor="let revolt of revolts; trackBy: trackByRevoltId"
          class="revolt-card"
          (click)="viewRevolt(revolt.id)">
          
          <div class="revolt-header">
            <img [src]="revolt.icon" [alt]="revolt.name" class="revolt-icon">
            <div class="revolt-info">
              <h3>{{ revolt.name }}</h3>
              <p>{{ revolt.shortDescription }}</p>
            </div>
            <div class="revolt-category">
              {{ revolt.category }}
            </div>
          </div>

          <div class="revolt-stats">
            <div class="stat">
              <span class="stat-value">{{ revolt.memberCount | number }}</span>
              <span class="stat-label">Members</span>
            </div>
            <div class="stat" *ngIf="revolt.acceptDonations">
              <span class="stat-value">${{ revolt.currentFunding / 100 | number:'1.2-2' }}</span>
              <span class="stat-label">Raised</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ revolt.channelCount }}</span>
              <span class="stat-label">Channels</span>
            </div>
          </div>

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

          <div class="revolt-actions">
            <button 
              class="join-btn"
              (click)="joinRevolt(revolt.id, $event)">
              Join Revolt
            </button>
            <button 
              *ngIf="revolt.acceptDonations"
              class="donate-btn"
              (click)="donateToRevolt(revolt.id, $event)">
              Donate
            </button>
          </div>
        </div>
      </div>

      <div class="load-more" *ngIf="hasMore">
        <button 
          (click)="loadMore()"
          [disabled]="isLoading"
          class="load-more-btn">
          {{ isLoading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  `
})
export class RevoltDiscoveryComponent {
  revolts: Revolt[] = [];
  searchQuery = '';
  filters: RevoltFilters = {
    category: '',
    sortBy: 'newest',
    memberCount: ''
  };
  isLoading = false;
  hasMore = true;
  page = 1;

  constructor(
    private revoltService: RevoltService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRevolts();
  }

  async loadRevolts(): Promise<void> {
    this.isLoading = true;
    
    try {
      const response = await this.revoltService.discoverRevolts({
        ...this.filters,
        search: this.searchQuery,
        page: this.page
      });
      
      this.revolts = [...this.revolts, ...response.items];
      this.hasMore = response.hasMore;
    } catch (error) {
      console.error('Failed to load revolts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(): void {
    this.page = 1;
    this.revolts = [];
    this.loadRevolts();
  }

  onFilterChange(): void {
    this.page = 1;
    this.revolts = [];
    this.loadRevolts();
  }

  loadMore(): void {
    this.page++;
    this.loadRevolts();
  }

  viewRevolt(revoltId: string): void {
    this.router.navigate(['/revolts', revoltId]);
  }

  joinRevolt(revoltId: string, event: Event): void {
    event.stopPropagation();
    // Implement join logic
  }

  donateToRevolt(revoltId: string, event: Event): void {
    event.stopPropagation();
    // Implement donation logic
  }

  trackByRevoltId(index: number, revolt: Revolt): string {
    return revolt.id;
  }
}
```

## 🚀 Revolt Launch System

### Launch Checklist

```typescript
interface RevoltLaunchChecklist {
  revoltId: string;
  items: ChecklistItem[];
  completed: string[];
  isReady: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
}

// Launch checklist component
@Component({
  selector: 'app-revolt-launch-checklist',
  standalone: true,
  template: `
    <div class="revolt-launch-checklist">
      <h3>Launch Checklist</h3>
      
      <div class="checklist-items">
        <div 
          *ngFor="let item of checklist.items"
          class="checklist-item"
          [class.completed]="item.completed">
          
          <input
            type="checkbox"
            [checked]="item.completed"
            (change)="checkItem(item.id)"
            [disabled]="!item.required">
          
          <div class="item-content">
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
            <span *ngIf="item.required" class="required">Required</span>
          </div>
        </div>
      </div>

      <div class="launch-actions">
        <button
          (click)="launchRevolt()"
          [disabled]="!checklist.isReady"
          class="launch-button">
          Launch Revolt
        </button>
      </div>
    </div>
  `
})
export class RevoltLaunchChecklistComponent {
  @Input() revoltId!: string;
  checklist: RevoltLaunchChecklist | null = null;

  defaultChecklist: ChecklistItem[] = [
    {
      id: 'name-description',
      title: 'Revolt Name & Description',
      description: 'Clear, compelling name and detailed description',
      required: true,
      completed: false
    },
    {
      id: 'channels-setup',
      title: 'Channels Created',
      description: 'At least one text channel and voice channel',
      required: true,
      completed: false
    },
    {
      id: 'roles-configured',
      title: 'Roles & Permissions',
      description: 'Default roles configured with proper permissions',
      required: true,
      completed: false
    },
    {
      id: 'icon-uploaded',
      title: 'Revolt Icon',
      description: 'Upload a distinctive icon for your Revolt',
      required: true,
      completed: false
    },
    {
      id: 'funding-setup',
      title: 'Funding Configuration',
      description: 'Configure donation settings and funding goals',
      required: false,
      completed: false
    }
  ];

  constructor(private revoltService: RevoltService) {}

  ngOnInit(): void {
    this.loadChecklist();
  }

  async loadChecklist(): Promise<void> {
    try {
      this.checklist = await this.revoltService.getLaunchChecklist(this.revoltId);
    } catch (error) {
      // Create default checklist if none exists
      this.checklist = {
        revoltId: this.revoltId,
        items: this.defaultChecklist,
        completed: [],
        isReady: false
      };
    }
  }

  async checkItem(itemId: string): Promise<void> {
    if (!this.checklist) return;

    try {
      await this.revoltService.checkChecklistItem(this.revoltId, itemId);
      
      this.checklist.completed.push(itemId);
      this.checklist.items = this.checklist.items.map(item =>
        item.id === itemId ? { ...item, completed: true } : item
      );
      
      this.checklist.isReady = this.checklist.items
        .filter(item => item.required)
        .every(item => item.completed);
    } catch (error) {
      console.error('Failed to check item:', error);
    }
  }

  async launchRevolt(): Promise<void> {
    if (!this.checklist?.isReady) return;

    try {
      await this.revoltService.launchRevolt(this.revoltId);
      // Navigate to the launched Revolt
    } catch (error) {
      console.error('Failed to launch Revolt:', error);
    }
  }
}
```

This comprehensive Revolt management system provides the foundation for creating, managing, and participating in revolutionary Discord-like communities while maintaining collaboration, transparency, and real-time communication features.
