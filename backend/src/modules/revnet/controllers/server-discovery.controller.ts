import { Controller, Get, Query } from '@nestjs/common';
import { ServersService } from '../services/servers.service';
import { ServerDiscoveryQueryDto } from '../dto/server-discovery-query.dto';

@Controller('api/revnet/servers/discover')
export class ServerDiscoveryController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  discoverServers(@Query() query: ServerDiscoveryQueryDto) {
    return this.serversService.findPublicServers(query);
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
