import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Revolt, RevoltDocument } from '../../schemas/revolt.schema';
import { Channel, ChannelDocument } from '../../schemas/channel.schema';

export interface RevoltFilters {
  category?: string;
  search?: string;
  sortBy?: 'popular' | 'recent' | 'active' | 'funding';
  limit?: number;
  offset?: number;
}

@Injectable()
export class RevoltsService {
  constructor(
    @InjectModel(Revolt.name) private revoltModel: Model<RevoltDocument>,
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
  ) {}

  async getFeaturedRevolts(): Promise<Revolt[]> {
    return this.revoltModel
      .find({ isFeatured: true, isPublic: true })
      .sort({ memberCount: -1 })
      .limit(6)
      .exec();
  }

  async getPublicRevolts(filters: RevoltFilters = {}): Promise<{
    revolts: Revolt[];
    total: number;
  }> {
    const {
      category,
      search,
      sortBy = 'popular',
      limit = 20,
      offset = 0,
    } = filters;

    const query: any = { isPublic: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sort: any = {};
    switch (sortBy) {
      case 'popular':
        sort = { memberCount: -1 };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'active':
        sort = { messageCount: -1 };
        break;
      case 'funding':
        sort = { currentFunding: -1 };
        break;
    }

    const [revolts, total] = await Promise.all([
      this.revoltModel
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .exec(),
      this.revoltModel.countDocuments(query),
    ]);

    return { revolts, total };
  }

  async getRevoltById(id: string): Promise<Revolt | null> {
    return this.revoltModel.findById(id).exec();
  }

  async getRevoltChannels(revoltId: string): Promise<Channel[]> {
    return this.channelModel
      .find({ revoltId, isActive: true })
      .sort({ position: 1 })
      .exec();
  }

  async createRevolt(revoltData: Partial<Revolt>): Promise<Revolt> {
    const revolt = new this.revoltModel(revoltData);
    return revolt.save();
  }

  async updateRevolt(id: string, updateData: Partial<Revolt>): Promise<Revolt | null> {
    return this.revoltModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteRevolt(id: string): Promise<boolean> {
    const result = await this.revoltModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
