import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, UseGuards } from '@nestjs/common';
import { ChannelsService } from '../services/channels.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/revnet/servers/:serverId/channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  create(@Param('serverId') serverId: string, @Body() createChannelDto: CreateChannelDto, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.channelsService.create(serverId, createChannelDto, userId);
  }

  @Get()
  findAll(@Param('serverId') serverId: string, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.channelsService.findAll(serverId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.channelsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.channelsService.update(id, updateChannelDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.channelsService.remove(id, userId);
  }

  @Post('fix-active')
  fixActiveChannels() {
    return this.channelsService.fixActiveChannels();
  }
}
