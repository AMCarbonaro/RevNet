import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RevoltsService, RevoltFilters } from './revolts.service';
import { Revolt } from '../../schemas/revolt.schema';

@Controller('api/revolts')
export class RevoltsController {
  constructor(private readonly revoltsService: RevoltsService) {}

  @Get('featured')
  async getFeaturedRevolts(): Promise<{ data: Revolt[] }> {
    try {
      const revolts = await this.revoltsService.getFeaturedRevolts();
      return { data: revolts };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch featured revolts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('public')
  async getPublicRevolts(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'popular' | 'recent' | 'active' | 'funding',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ data: Revolt[]; total: number; limit: number; offset: number }> {
    try {
      const filters: RevoltFilters = {
        category,
        search,
        sortBy,
        limit: limit ? parseInt(limit, 10) : 20,
        offset: offset ? parseInt(offset, 10) : 0,
      };

      const result = await this.revoltsService.getPublicRevolts(filters);
      return {
        data: result.revolts,
        total: result.total,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch public revolts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getRevoltById(@Param('id') id: string): Promise<{ data: Revolt }> {
    try {
      const revolt = await this.revoltsService.getRevoltById(id);
      if (!revolt) {
        throw new HttpException('Revolt not found', HttpStatus.NOT_FOUND);
      }
      return { data: revolt };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch revolt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/channels')
  async getRevoltChannels(@Param('id') id: string) {
    try {
      const channels = await this.revoltsService.getRevoltChannels(id);
      return { data: channels };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch revolt channels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createRevolt(@Body() revoltData: Partial<Revolt>): Promise<{ data: Revolt }> {
    try {
      const revolt = await this.revoltsService.createRevolt(revoltData);
      return { data: revolt };
    } catch (error) {
      throw new HttpException(
        'Failed to create revolt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateRevolt(
    @Param('id') id: string,
    @Body() updateData: Partial<Revolt>,
  ): Promise<{ data: Revolt }> {
    try {
      const revolt = await this.revoltsService.updateRevolt(id, updateData);
      if (!revolt) {
        throw new HttpException('Revolt not found', HttpStatus.NOT_FOUND);
      }
      return { data: revolt };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update revolt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteRevolt(@Param('id') id: string): Promise<{ success: boolean }> {
    try {
      const success = await this.revoltsService.deleteRevolt(id);
      if (!success) {
        throw new HttpException('Revolt not found', HttpStatus.NOT_FOUND);
      }
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete revolt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
