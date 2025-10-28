import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Revolt, RevoltDocument } from '../../schemas/revolt.schema';
import { Donation, DonationDocument } from '../../schemas/donation.schema';

export interface PlatformStats {
  totalRevolts: number;
  totalMembers: number;
  totalRaised: number;
  activeRevolts: number;
  totalDonations: number;
  averageDonation: number;
}

@Injectable()
export class PlatformService {
  constructor(
    @InjectModel(Revolt.name) private revoltModel: Model<RevoltDocument>,
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
  ) {}

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const [
        totalRevolts,
        totalMembers,
        totalRaised,
        activeRevolts,
        donationStats,
      ] = await Promise.all([
        this.revoltModel.countDocuments({ isPublic: true }),
        this.revoltModel.aggregate([
          { $match: { isPublic: true } },
          { $group: { _id: null, total: { $sum: '$memberCount' } } },
        ]),
        this.donationModel.aggregate([
          { $match: { status: 'succeeded' } },
          { $group: { _id: null, total: { $sum: '$netAmount' } } },
        ]),
        this.revoltModel.countDocuments({
          isPublic: true,
          memberCount: { $gt: 0 },
        }),
        this.donationModel.aggregate([
          { $match: { status: 'succeeded' } },
          {
            $group: {
              _id: null,
              totalDonations: { $sum: 1 },
              averageDonation: { $avg: '$netAmount' },
            },
          },
        ]),
      ]);

      return {
        totalRevolts,
        totalMembers: totalMembers[0]?.total || 0,
        totalRaised: totalRaised[0]?.total || 0,
        activeRevolts,
        totalDonations: donationStats[0]?.totalDonations || 0,
        averageDonation: donationStats[0]?.averageDonation || 0,
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {
        totalRevolts: 0,
        totalMembers: 0,
        totalRaised: 0,
        activeRevolts: 0,
        totalDonations: 0,
        averageDonation: 0,
      };
    }
  }

  async getCategoryStats(): Promise<{ category: string; count: number }[]> {
    try {
      const stats = await this.revoltModel.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { category: '$_id', count: 1, _id: 0 } },
      ]);

      return stats;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return [];
    }
  }

  async getRecentActivity(limit = 10): Promise<any[]> {
    try {
      const recentRevolts = await this.revoltModel
        .find({ isPublic: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name description category memberCount createdAt')
        .exec();

      return recentRevolts.map((revolt) => ({
        type: 'revolt_created',
        revoltId: revolt._id,
        revoltName: revolt.name,
        description: revolt.description,
        category: revolt.category,
        memberCount: revolt.memberCount,
        createdAt: (revolt as any).createdAt || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
}
