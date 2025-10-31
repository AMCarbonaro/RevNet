import { Controller, Get, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
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

  // New public endpoint for viewing a server by ID
  @Get('public/:id')
  async getPublicServerById(@Param('id') id: string) {
    try {
      return await this.serversService.getPublicServerById(id);
    } catch (error) {
      console.error('[ServerDiscoveryController] Error in getPublicServerById:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Server not found',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // New public endpoint for viewing a server by invite code
  @Get('invite/:code')
  async getServerByInviteCode(@Param('code') code: string) {
    try {
      return await this.serversService.getServerByInviteCode(code);
    } catch (error) {
      console.error('[ServerDiscoveryController] Error in getServerByInviteCode:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Invalid invite code',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
