import { PlatformService, PlatformStats } from './platform.service';
export declare class PlatformController {
    private readonly platformService;
    constructor(platformService: PlatformService);
    getPlatformStats(): Promise<{
        data: PlatformStats;
    }>;
    getCategoryStats(): Promise<{
        data: {
            category: string;
            count: number;
        }[];
    }>;
    getRecentActivity(limit?: string): Promise<{
        data: any[];
    }>;
}
