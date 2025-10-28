# Donation System Documentation

## Overview

Revolution Network integrates Stripe for secure donation processing to Revolts (Discord-style servers). The system supports both authenticated user donations and anonymous donations from the homepage, with per-Revolt fundraising tracking and transparent donation management.

## 💳 Stripe Integration

### Payment Processing Architecture

```typescript
// Donation Request
interface DonationRequest {
  amount: number;           // Amount in cents
  revoltId: string;         // Revolt being funded
  donorName?: string;       // Donor name (optional for anonymous)
  donorEmail?: string;      // Donor email (optional for anonymous)
  message?: string;         // Donor message (optional)
  isAnonymous: boolean;     // Anonymous donation flag
}

interface DonationResponse {
  success: boolean;
  data?: {
    clientSecret: string;   // Stripe client secret
    paymentIntentId: string; // Payment intent ID
  };
  error?: string;
}
```

### API Endpoints

#### Create Donation Intent
```typescript
POST /api/donations/create-intent
Content-Type: application/json

{
  "amount": 5000,           // $50.00 in cents
  "revoltId": "revolt123",
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "message": "Supporting the cause!",
  "isAnonymous": false
}
```

#### Anonymous Donation (Homepage)
```typescript
POST /api/donations/anonymous
Content-Type: application/json

{
  "amount": 2500,           // $25.00 in cents
  "revoltId": "revolt123",
  "message": "Keep up the great work!",
  "isAnonymous": true
}
```

#### Stripe Webhook Handler
```typescript
POST /api/donations/webhook
Content-Type: application/json

// Handles Stripe webhook events:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - payment_intent.canceled
// - payment_intent.requires_action
```

### Payment Flow

1. **Donation Initiation**
   - User selects donation amount ($1.00 - $1,000.00)
   - System validates amount and Revolt
   - Creates Stripe payment intent
   - Returns client secret for frontend

2. **Payment Processing**
   - Stripe Elements handles card input
   - Secure tokenization of payment data
   - PCI-compliant processing
   - Real-time payment validation

3. **Webhook Processing**
   - Stripe sends webhook on payment completion
   - System updates donation status
   - Updates Revolt funding totals
   - Sends confirmation notifications

4. **Confirmation**
   - User receives confirmation
   - Revolt funding updates in real-time
   - Donation appears in Revolt's funding display

## 🏛️ Revolt Donation System

### Per-Revolt Fundraising

```typescript
interface RevoltFunding {
  revoltId: string;
  totalDonations: number;    // Total amount raised (cents)
  donorCount: number;        // Number of donors
  goalAmount?: number;       // Optional funding goal
  progressPercentage: number; // Progress toward goal
  recentDonations: Donation[]; // Recent donations
  topDonors: DonorSummary[];  // Top donors (if not anonymous)
}

interface DonorSummary {
  name: string;
  totalDonated: number;
  donationCount: number;
  lastDonation: Date;
}
```

### Anonymous Donations

```typescript
interface AnonymousDonation {
  id: string;
  amount: number;
  revoltId: string;
  message?: string;
  createdAt: Date;
  stripePaymentIntentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  // No personal information stored
}
```

### Donation Data Structure

```typescript
interface Donation {
  id: string;
  amount: number;                    // Amount in cents
  revoltId: string;                  // Revolt being funded
  donor?: {                         // Donor info (if not anonymous)
    userId?: string;                // User ID (if authenticated)
    name: string;
    email: string;
  };
  message?: string;                 // Donor message
  isAnonymous: boolean;             // Anonymous donation flag
  createdAt: Date;                  // Donation timestamp
  stripePaymentIntentId: string;   // Stripe payment intent ID
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}
```

## 🎯 Angular Implementation

### Donation Service

```typescript
// src/app/core/services/donation.service.ts
@Injectable({
  providedIn: 'root'
})
export class DonationService {
  constructor(
    private http: HttpClient,
    private store: Store<AppState>
  ) {}

  async createDonationIntent(request: DonationRequest): Promise<DonationResponse> {
    try {
      const response = await this.http.post<DonationResponse>(
        '/api/donations/create-intent', 
        request
      ).toPromise();
      
      if (response.success) {
        this.store.dispatch(DonationActions.createIntentSuccess({ 
          paymentIntentId: response.data!.paymentIntentId 
        }));
      }
      
      return response;
    } catch (error) {
      this.store.dispatch(DonationActions.createIntentFailure({ 
        error: error.message 
      }));
      throw error;
    }
  }

  async processAnonymousDonation(request: AnonymousDonationRequest): Promise<DonationResponse> {
    return this.http.post<DonationResponse>('/api/donations/anonymous', request).toPromise();
  }

  async getRevoltDonations(revoltId: string): Promise<Donation[]> {
    return this.http.get<Donation[]>(`/api/donations/revolt/${revoltId}`).toPromise();
  }

  async getRevoltFunding(revoltId: string): Promise<RevoltFunding> {
    return this.http.get<RevoltFunding>(`/api/donations/revolt/${revoltId}/funding`).toPromise();
  }
}
```

### Donation Components

```typescript
// src/app/features/donations/components/donation-form/donation-form.component.ts
@Component({
  selector: 'app-donation-form',
  standalone: true,
  template: `
    <div class="donation-form">
      <h3>Support {{ revoltName }}</h3>
      
      <form [formGroup]="donationForm" (ngSubmit)="onSubmit()">
        <div class="amount-selection">
          <h4>Select Amount</h4>
          <div class="amount-buttons">
            <button 
              *ngFor="let amount of presetAmounts" 
              type="button"
              [class.selected]="selectedAmount === amount"
              (click)="selectAmount(amount)">
              ${{ amount / 100 }}
            </button>
          </div>
          <div class="custom-amount">
            <label for="customAmount">Custom Amount</label>
            <input 
              id="customAmount"
              type="number" 
              formControlName="amount"
              placeholder="Enter amount"
              min="1"
              max="1000">
          </div>
        </div>

        <div class="donor-info" *ngIf="!isAnonymous">
          <h4>Your Information</h4>
          <input 
            formControlName="donorName"
            placeholder="Your name"
            required>
          <input 
            formControlName="donorEmail"
            type="email"
            placeholder="Your email"
            required>
        </div>

        <div class="message-section">
          <label for="message">Message (Optional)</label>
          <textarea 
            id="message"
            formControlName="message"
            placeholder="Leave a message of support..."
            rows="3">
          </textarea>
        </div>

        <div class="anonymous-option">
          <label>
            <input 
              type="checkbox" 
              formControlName="isAnonymous">
            Make this donation anonymous
          </label>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            [disabled]="!donationForm.valid || isProcessing"
            class="donate-btn">
            {{ isProcessing ? 'Processing...' : 'Donate $' + (selectedAmount / 100) }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class DonationFormComponent {
  @Input() revoltId!: string;
  @Input() revoltName!: string;
  @Input() isAnonymous: boolean = false;
  @Output() donationCompleted = new EventEmitter<Donation>();

  presetAmounts = [500, 1000, 2500, 5000, 10000]; // $5, $10, $25, $50, $100
  selectedAmount = 2500; // Default $25
  isProcessing = false;

  donationForm = this.fb.group({
    amount: [2500, [Validators.required, Validators.min(100), Validators.max(100000)]],
    donorName: ['', this.isAnonymous ? [] : [Validators.required]],
    donorEmail: ['', this.isAnonymous ? [] : [Validators.required, Validators.email]],
    message: [''],
    isAnonymous: [this.isAnonymous]
  });

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private store: Store<AppState>
  ) {}

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.donationForm.patchValue({ amount });
  }

  async onSubmit(): Promise<void> {
    if (this.donationForm.valid) {
      this.isProcessing = true;
      
      try {
        const formValue = this.donationForm.value;
        const request: DonationRequest = {
          amount: formValue.amount!,
          revoltId: this.revoltId,
          donorName: formValue.donorName,
          donorEmail: formValue.donorEmail,
          message: formValue.message,
          isAnonymous: formValue.isAnonymous!
        };

        const response = await this.donationService.createDonationIntent(request);
        
        if (response.success) {
          // Process payment with Stripe
          await this.processPayment(response.data!.clientSecret);
        }
      } catch (error) {
        console.error('Donation failed:', error);
      } finally {
        this.isProcessing = false;
      }
    }
  }

  private async processPayment(clientSecret: string): Promise<void> {
    // Integrate with Stripe Elements for payment processing
    // This would use Stripe's Angular integration
  }
}
```

### Revolt Funding Display

```typescript
// src/app/features/donations/components/revolt-funding/revolt-funding.component.ts
@Component({
  selector: 'app-revolt-funding',
  standalone: true,
  template: `
    <div class="revolt-funding">
      <div class="funding-header">
        <h3>Funding Progress</h3>
        <div class="total-amount">
          ${{ funding.totalDonations / 100 | number:'1.2-2' }}
        </div>
      </div>

      <div class="progress-bar" *ngIf="funding.goalAmount">
        <div 
          class="progress-fill"
          [style.width.%]="funding.progressPercentage">
        </div>
        <span class="progress-text">
          {{ funding.progressPercentage | number:'1.0-0' }}% of ${{ funding.goalAmount / 100 }} goal
        </span>
      </div>

      <div class="funding-stats">
        <div class="stat">
          <span class="stat-value">{{ funding.donorCount }}</span>
          <span class="stat-label">Donors</span>
        </div>
        <div class="stat">
          <span class="stat-value">${{ funding.totalDonations / 100 | number:'1.2-2' }}</span>
          <span class="stat-label">Raised</span>
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
    </div>
  `
})
export class RevoltFundingComponent {
  @Input() revoltId!: string;
  @Input() funding!: RevoltFunding;
}
```

## 🔐 Security & Privacy

### Payment Security

1. **PCI Compliance**
   - Stripe handles all card data
   - No card information stored locally
   - Secure tokenization process
   - PCI DSS Level 1 compliance

2. **Data Protection**
   - Encrypted payment processing
   - Secure webhook handling
   - Audit trail for all transactions
   - GDPR compliance for EU users

3. **Fraud Prevention**
   - Stripe's built-in fraud detection
   - Rate limiting on payment endpoints
   - Suspicious activity monitoring
   - Chargeback protection

### Privacy Features

```typescript
interface DonationPrivacySettings {
  allowAnonymousDonations: boolean;    // Allow anonymous donations
  showDonorNames: boolean;             // Show donor names publicly
  showDonationAmounts: boolean;        // Show donation amounts
  showRecentDonations: boolean;        // Show recent donations list
  dataRetention: number;               // Days to retain donation data
}
```

## 📊 Analytics & Reporting

### Donation Analytics

```typescript
interface DonationAnalytics {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  donationTrends: DonationTrend[];
  topRevolts: RevoltFunding[];
  donorDemographics: DonorDemographics;
}

interface DonationTrend {
  date: Date;
  amount: number;
  count: number;
}
```

### Revolt Funding Reports

```typescript
interface RevoltFundingReport {
  revoltId: string;
  revoltName: string;
  totalRaised: number;
  donorCount: number;
  averageDonation: number;
  topDonors: DonorSummary[];
  donationHistory: DonationTrend[];
  goalProgress?: number;
}
```

## 🚨 Notification System

### Donation Notifications

```typescript
interface DonationNotification {
  id: string;
  type: 'donation_received' | 'goal_reached' | 'milestone_achieved';
  revoltId: string;
  revoltName: string;
  amount?: number;
  donorName?: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}
```

### Real-time Updates

```typescript
// Socket.IO integration for real-time donation updates
@Injectable()
export class DonationSocketService {
  private socket = io(environment.socketUrl);

  onDonationReceived(): Observable<Donation> {
    return new Observable(observer => {
      this.socket.on('donation-received', (donation) => {
        observer.next(donation);
      });
    });
  }

  onFundingUpdated(): Observable<RevoltFunding> {
    return new Observable(observer => {
      this.socket.on('funding-updated', (funding) => {
        observer.next(funding);
      });
    });
  }
}
```

## 🔧 Configuration

### Environment Variables

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Donation Settings
MIN_DONATION_AMOUNT=100        # $1.00 in cents
MAX_DONATION_AMOUNT=100000     # $1,000.00 in cents
DEFAULT_DONATION_AMOUNT=2500   # $25.00 in cents

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Stripe Configuration

```typescript
// Stripe initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Payment intent creation
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount, // Amount in cents
  currency: 'usd',
  metadata: {
    revoltId,
    donorName: donorName || 'Anonymous',
    donorEmail: donorEmail || '',
    message: message || '',
    isAnonymous: isAnonymous.toString(),
  },
  description: `Donation to Revolt ${revoltId}`,
  automatic_payment_methods: {
    enabled: true,
  },
});
```

## 🧪 Testing

### Donation Testing

```typescript
// Test donation scenarios
describe('Donation Processing', () => {
  test('should create donation intent successfully', async () => {
    const response = await fetch('/api/donations/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2500,
        revoltId: 'test-revolt',
        donorName: 'Test Donor',
        isAnonymous: false
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.clientSecret).toBeDefined();
  });
  
  test('should handle anonymous donations', async () => {
    const response = await fetch('/api/donations/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1000,
        revoltId: 'test-revolt',
        message: 'Anonymous support!',
        isAnonymous: true
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### Revolt Funding Testing

```typescript
// Test Revolt funding calculations
describe('Revolt Funding', () => {
  test('should calculate funding progress correctly', async () => {
    const revolt = await createRevolt({
      totalDonations: 5000, // $50.00
      goalAmount: 10000      // $100.00 goal
    });
    
    const funding = await getRevoltFunding(revolt.id);
    expect(funding.progressPercentage).toBe(50);
    expect(funding.totalDonations).toBe(5000);
  });
});
```

## 🚀 Deployment Considerations

### Production Setup

1. **Stripe Live Keys**
   - Switch to live Stripe keys
   - Update webhook endpoints
   - Test with real payment methods

2. **Security**
   - Enable HTTPS for all endpoints
   - Set up proper CORS policies
   - Configure rate limiting

3. **Monitoring**
   - Set up payment monitoring
   - Configure donation alerts
   - Monitor webhook delivery

4. **Analytics**
   - Set up donation tracking
   - Configure funding reports
   - Monitor Revolt performance

This donation system provides a secure, flexible way for users to support Revolts through both authenticated and anonymous donations, with real-time updates and comprehensive analytics for Revolt creators.
