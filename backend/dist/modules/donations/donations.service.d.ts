import { Model } from 'mongoose';
import { Donation, DonationDocument } from '../../schemas/donation.schema';
import { RevoltDocument } from '../../schemas/revolt.schema';
export interface AnonymousDonationRequest {
    revoltId: string;
    amount: number;
    donorName?: string;
    donorEmail?: string;
    message?: string;
    isAnonymous: boolean;
}
export declare class DonationsService {
    private donationModel;
    private revoltModel;
    private stripe;
    constructor(donationModel: Model<DonationDocument>, revoltModel: Model<RevoltDocument>);
    createAnonymousDonation(donationData: AnonymousDonationRequest): Promise<{
        donation: Donation;
        clientSecret: string;
    }>;
    confirmDonation(paymentIntentId: string): Promise<Donation | null>;
    getDonationsByRevolt(revoltId: string): Promise<Donation[]>;
    getDonationStats(revoltId: string): Promise<{
        totalDonations: number;
        totalAmount: number;
        averageDonation: number;
    }>;
}
