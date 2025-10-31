import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ServersService } from '../services/servers.service';
import { ServerDiscoveryQueryDto } from '../dto/server-discovery-query.dto';

@Controller('api/revnet/servers/discover')
export class ServerDiscoveryController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  async discoverServers(@Query() query: ServerDiscoveryQueryDto) {
    try {
      return await this.serversService.findPublicServers(query);
    } catch (error) {
      console.error('[ServerDiscoveryController] Error in discoverServers:', error);
      console.error('[ServerDiscoveryController] Query:', query);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to discover servers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('categories')
  getCategories() {
    return this.serversService.getCategories();
  }

  @Get('tags')
  getPopularTags(@Query('limit') limit?: number) {
    return this.serversService.getPopularTags(limit);
  }
}
