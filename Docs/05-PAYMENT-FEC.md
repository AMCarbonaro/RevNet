# Payment & FEC Compliance Documentation

## Overview

Revolution Network integrates Stripe for secure payment processing while maintaining FEC compliance through automatic monitoring and legal guidance. The system tracks donations, monitors thresholds, and provides resources for political committee formation.

## 💳 Stripe Integration

### Payment Processing Architecture

```typescript
// Payment Intent Creation
interface PaymentIntentRequest {
  amount: number;           // Amount in cents
  projectId: string;        // Project being funded
  donorName?: string;       // Donor name (optional)
  donorEmail?: string;      // Donor email (optional)
  message?: string;         // Donor message (optional)
}

interface PaymentIntentResponse {
  success: boolean;
  data?: {
    clientSecret: string;   // Stripe client secret
    paymentIntentId: string; // Payment intent ID
  };
  error?: string;
}
```

### API Endpoints

#### Create Payment Intent
```typescript
POST /api/stripe/create-payment-intent
Content-Type: application/json

{
  "amount": 5000,           // $50.00 in cents
  "projectId": "project123",
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "message": "Supporting the cause!"
}
```

#### Stripe Webhook Handler
```typescript
POST /api/stripe/webhook
Content-Type: application/json

// Handles Stripe webhook events:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - payment_intent.canceled
// - payment_intent.requires_action
```

### Payment Flow

1. **Donation Initiation**
   - User selects donation amount
   - System validates amount ($1.00 - $10,000.00)
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
   - Updates project funding totals
   - Triggers FEC compliance checks

4. **Confirmation**
   - User receives confirmation
   - Project funding updates
   - FEC monitoring alerts if needed

## 🔒 FEC Compliance System

### Threshold Monitoring

```typescript
interface FECComplianceStatus {
  projectId: string;
  userId: string;
  status: 'unknown' | 'monitoring' | 'warning' | 'alert';
  threshold: number;         // Current funding amount
  warning: boolean;         // $4,500 threshold reached
  alert: boolean;          // $5,000 threshold reached
  recommendations: string[]; // Legal guidance
}
```

### Automatic Monitoring

```typescript
// FEC Compliance Check
export async function checkFECCompliance(projectId: string): Promise<FECComplianceStatus> {
  const project = await getProjectById(projectId);
  if (!project) {
    return { threshold: 0, warning: false, alert: false };
  }

  const funding = project.currentFunding;
  const warning = funding >= 4500;  // $4,500 warning threshold
  const alert = funding >= 5000;    // $5,000 alert threshold

  return {
    threshold: funding,
    warning,
    alert,
    recommendations: getFECRecommendations(funding)
  };
}
```

### Compliance Thresholds

| Funding Amount | Status | Action Required |
|---------------|--------|----------------|
| $0 - $4,499 | Monitoring | Continue tracking |
| $4,500 - $4,999 | Warning | FEC guidance provided |
| $5,000+ | Alert | Legal consultation recommended |

### Legal Resources

```typescript
interface FECResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'reporting' | 'limits' | 'registration' | 'compliance';
}

// FEC Resources API
GET /api/fec-compliance/resources
```

#### Available Resources

1. **FEC Reporting Requirements**
   - Learn about FEC reporting requirements for political committees
   - URL: https://www.fec.gov/help-candidates-and-committees/

2. **Contribution Limits**
   - Understand individual and PAC contribution limits
   - URL: https://www.fec.gov/help-candidates-and-committees/candidate-taking-receipts/contribution-limits/

3. **Committee Registration**
   - How to register a political committee with the FEC
   - URL: https://www.fec.gov/help-candidates-and-committees/registering-committee/

## 💰 Donation Management

### Donation Data Structure

```typescript
interface Donation {
  id: string;
  amount: number;                    // Amount in cents
  donor: User;                      // Donor information
  project: Project;                 // Project being funded
  message?: string;                 // Donor message
  isAnonymous: boolean;             // Anonymous donation flag
  createdAt: Date;                  // Donation timestamp
  stripePaymentIntentId: string;   // Stripe payment intent ID
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}
```

### Donation Tracking

```typescript
// Create donation record
export async function createDonation(donation: Omit<Donation, 'id'>): Promise<Donation> {
  const newDonation = {
    ...donation,
    id: Date.now().toString()
  };

  // Update project funding
  await updateProject(donation.project.id, {
    currentFunding: donation.project.currentFunding + donation.amount,
    backers: donation.project.backers + 1
  });

  // Check FEC compliance
  await checkFECCompliance(donation.project.id);

  return newDonation;
}
```

### Donation Analytics

```typescript
// Get donation statistics
export async function getDonationStats(projectId: string) {
  const donations = await getDonations({ projectId });
  
  return {
    totalDonations: donations.length,
    totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
    averageDonation: donations.reduce((sum, d) => sum + d.amount, 0) / donations.length,
    anonymousCount: donations.filter(d => d.isAnonymous).length,
    topDonors: getTopDonors(donations)
  };
}
```

## 🏛️ Legal Compliance Features

### FEC Registration Assistance

```typescript
interface FECRegistrationGuide {
  steps: RegistrationStep[];
  requirements: string[];
  deadlines: Date[];
  resources: FECResource[];
}

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}
```

### Compliance Monitoring Dashboard

```typescript
interface ComplianceDashboard {
  projectId: string;
  currentFunding: number;
  thresholdStatus: 'safe' | 'warning' | 'alert';
  nextThreshold: number;
  recommendations: string[];
  legalResources: FECResource[];
  registrationStatus: 'not_required' | 'recommended' | 'required';
}
```

### Legal Guidance System

```typescript
// Get FEC recommendations based on funding level
export function getFECRecommendations(funding: number): string[] {
  const recommendations = [];
  
  if (funding >= 4500) {
    recommendations.push("Consider FEC registration for political committee");
    recommendations.push("Review contribution limits and reporting requirements");
  }
  
  if (funding >= 5000) {
    recommendations.push("FEC registration may be required");
    recommendations.push("Consult with legal counsel immediately");
    recommendations.push("Prepare for FEC reporting requirements");
  }
  
  return recommendations;
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
interface PrivacySettings {
  anonymousDonations: boolean;      // Allow anonymous donations
  publicDonorList: boolean;        // Show donor names publicly
  donationAmounts: 'hidden' | 'ranges' | 'exact'; // How to display amounts
  dataRetention: number;           // Days to retain donation data
}
```

## 📊 Analytics & Reporting

### Financial Analytics

```typescript
interface FinancialAnalytics {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  donationTrends: DonationTrend[];
  topProjects: Project[];
  donorDemographics: DonorDemographics;
}

interface DonationTrend {
  date: Date;
  amount: number;
  count: number;
}
```

### FEC Reporting Preparation

```typescript
interface FECReportData {
  projectId: string;
  totalContributions: number;
  contributorCount: number;
  contributionDetails: ContributionDetail[];
  reportingPeriod: DateRange;
  filingDeadline: Date;
}

interface ContributionDetail {
  donorName: string;
  amount: number;
  date: Date;
  address: string;
  occupation: string;
  employer: string;
}
```

## 🚨 Alert System

### Threshold Alerts

```typescript
interface FECAlert {
  id: string;
  type: 'warning' | 'alert' | 'deadline';
  title: string;
  message: string;
  projectId: string;
  threshold: number;
  recommendations: string[];
  createdAt: Date;
  acknowledged: boolean;
}
```

### Notification System

```typescript
// Send FEC compliance alerts
export async function sendFECAlert(projectId: string, threshold: number) {
  const alert: FECAlert = {
    id: Date.now().toString(),
    type: threshold >= 5000 ? 'alert' : 'warning',
    title: `FEC Compliance ${threshold >= 5000 ? 'Alert' : 'Warning'}`,
    message: `Project funding has reached $${threshold/100}. FEC compliance may be required.`,
    projectId,
    threshold,
    recommendations: getFECRecommendations(threshold),
    createdAt: new Date(),
    acknowledged: false
  };
  
  await createNotification(alert);
  await sendEmailAlert(alert);
}
```

## 🔧 Configuration

### Environment Variables

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# FEC Compliance
FEC_API_KEY=your_fec_api_key
FEC_WEBHOOK_URL=https://your-domain.com/api/fec/webhook

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
    projectId,
    donorName: donorName || 'Anonymous',
    donorEmail: donorEmail || '',
    message: message || '',
  },
  description: `Donation to project ${projectId}`,
  automatic_payment_methods: {
    enabled: true,
  },
});
```

## 🧪 Testing

### Payment Testing

```typescript
// Test payment scenarios
describe('Payment Processing', () => {
  test('should create payment intent successfully', async () => {
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 5000,
        projectId: 'test-project',
        donorName: 'Test Donor'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.clientSecret).toBeDefined();
  });
  
  test('should handle payment failures', async () => {
    // Test with invalid amount
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 50, // Below minimum
        projectId: 'test-project'
      })
    });
    
    expect(response.status).toBe(400);
  });
});
```

### FEC Compliance Testing

```typescript
// Test FEC compliance monitoring
describe('FEC Compliance', () => {
  test('should trigger warning at $4,500', async () => {
    const project = await createProject({
      currentFunding: 450000 // $4,500 in cents
    });
    
    const compliance = await checkFECCompliance(project.id);
    expect(compliance.warning).toBe(true);
    expect(compliance.alert).toBe(false);
  });
  
  test('should trigger alert at $5,000', async () => {
    const project = await createProject({
      currentFunding: 500000 // $5,000 in cents
    });
    
    const compliance = await checkFECCompliance(project.id);
    expect(compliance.warning).toBe(true);
    expect(compliance.alert).toBe(true);
  });
});
```

## 🚀 Deployment Considerations

### Production Setup

1. **Stripe Live Keys**
   - Switch to live Stripe keys
   - Update webhook endpoints
   - Test with real payment methods

2. **FEC Compliance**
   - Set up FEC API access
   - Configure compliance monitoring
   - Set up legal consultation contacts

3. **Security**
   - Enable HTTPS for all endpoints
   - Set up proper CORS policies
   - Configure rate limiting

4. **Monitoring**
   - Set up payment monitoring
   - Configure FEC threshold alerts
   - Monitor webhook delivery

This payment and FEC compliance system ensures Revolution Network can handle donations securely while maintaining legal compliance and providing users with the guidance they need to operate within the law.
