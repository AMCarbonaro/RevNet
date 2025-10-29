import { Controller, Get, Param, Query } from '@nestjs/common';
import { RevoltsService } from './revolts.service';

@Controller('revolts')
export class RevoltsController {
  constructor(private readonly revoltsService: RevoltsService) {}

  @Get('featured')
  async getFeaturedRevolts() {
    return this.revoltsService.getFeaturedRevolts();
  }

  @Get('public')
  async getPublicRevolts(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.revoltsService.getPublicRevolts({
      category,
      search,
      sortBy,
      limit,
      offset
    });
  }

  @Get(':id')
  async getRevoltById(@Param('id') id: string) {
    return this.revoltsService.getRevoltById(id);
  }

  @Get(':id/channels')
  async getRevoltChannels(@Param('id') id: string) {
    return this.revoltsService.getRevoltChannels(id);
  }
}

