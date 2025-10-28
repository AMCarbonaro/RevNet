import { DonationsService } from './donations.service';
import type { AnonymousDonationRequest } from './donations.service';
import { Donation } from '../../schemas/donation.schema';
export declare class DonationsController {
    private readonly donationsService;
    constructor(donationsService: DonationsService);
    createAnonymousDonation(donationData: AnonymousDonationRequest): Promise<{
        data: Donation;
        clientSecret: string;
    }>;
    confirmDonation(paymentIntentId: string): Promise<{
        data: Donation;
    }>;
    getDonationsByRevolt(revoltId: string): Promise<{
        data: Donation[];
    }>;
    getDonationStats(revoltId: string): Promise<{
        data: {
            totalDonations: number;
            totalAmount: number;
            averageDonation: number;
        };
    }>;
}
