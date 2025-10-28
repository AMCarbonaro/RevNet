export interface Donation {
  _id: string;
  revoltId: string;
  amount: number; // Amount in cents
  stripePaymentIntentId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous: boolean;
  processingFee: number; // Processing fee in cents
  netAmount: number; // Net amount after fees in cents
  stripeCustomerId?: string;
  metadata: {
    revoltName?: string;
    donorIp?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AnonymousDonationRequest {
  revoltId: string;
  amount: number; // Amount in cents
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous: boolean;
}

export interface DonationResponse {
  data: Donation;
  clientSecret: string;
}

export interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
}
