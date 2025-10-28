import { Model } from 'mongoose';
import { RevoltDocument } from '../../schemas/revolt.schema';
import { DonationDocument } from '../../schemas/donation.schema';
export interface PlatformStats {
    totalRevolts: number;
    totalMembers: number;
    totalRaised: number;
    activeRevolts: number;
    totalDonations: number;
    averageDonation: number;
}
export declare class PlatformService {
    private revoltModel;
    private donationModel;
    constructor(revoltModel: Model<RevoltDocument>, donationModel: Model<DonationDocument>);
    getPlatformStats(): Promise<PlatformStats>;
    getCategoryStats(): Promise<{
        category: string;
        count: number;
    }[]>;
    getRecentActivity(limit?: number): Promise<any[]>;
}
