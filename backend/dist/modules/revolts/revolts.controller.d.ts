import { RevoltsService } from './revolts.service';
import { Revolt } from '../../schemas/revolt.schema';
export declare class RevoltsController {
    private readonly revoltsService;
    constructor(revoltsService: RevoltsService);
    getFeaturedRevolts(): Promise<{
        data: Revolt[];
    }>;
    getPublicRevolts(category?: string, search?: string, sortBy?: 'popular' | 'recent' | 'active' | 'funding', limit?: string, offset?: string): Promise<{
        data: Revolt[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getRevoltById(id: string): Promise<{
        data: Revolt;
    }>;
    getRevoltChannels(id: string): Promise<{
        data: import("../../schemas/channel.schema").Channel[];
    }>;
    createRevolt(revoltData: Partial<Revolt>): Promise<{
        data: Revolt;
    }>;
    updateRevolt(id: string, updateData: Partial<Revolt>): Promise<{
        data: Revolt;
    }>;
    deleteRevolt(id: string): Promise<{
        success: boolean;
    }>;
}
