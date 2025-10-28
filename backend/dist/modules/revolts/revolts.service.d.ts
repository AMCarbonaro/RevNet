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
export declare class RevoltsService {
    private revoltModel;
    private channelModel;
    constructor(revoltModel: Model<RevoltDocument>, channelModel: Model<ChannelDocument>);
    getFeaturedRevolts(): Promise<Revolt[]>;
    getPublicRevolts(filters?: RevoltFilters): Promise<{
        revolts: Revolt[];
        total: number;
    }>;
    getRevoltById(id: string): Promise<Revolt | null>;
    getRevoltChannels(revoltId: string): Promise<Channel[]>;
    createRevolt(revoltData: Partial<Revolt>): Promise<Revolt>;
    updateRevolt(id: string, updateData: Partial<Revolt>): Promise<Revolt | null>;
    deleteRevolt(id: string): Promise<boolean>;
}
