import { Controller, Get, Query } from '@nestjs/common';
import { PlatformService, PlatformStats } from './platform.service';

@Controller('api/platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('stats')
  async getPlatformStats(): Promise<{ data: PlatformStats }> {
    const stats = await this.platformService.getPlatformStats();
    return { data: stats };
  }

  @Get('categories')
  async getCategoryStats() {
    const stats = await this.platformService.getCategoryStats();
    return { data: stats };
  }

  @Get('activity')
  async getRecentActivity(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const activity = await this.platformService.getRecentActivity(limitNum);
    return { data: activity };
  }
}
