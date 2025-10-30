import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DMService } from '../services/dm.service';
import { CreateDMChannelDto, CreateGroupDMChannelDto } from '../dto/create-dm-channel.dto';

@Controller('api/revnet/dm')
export class DMController {
  constructor(private readonly dmService: DMService) {}

  @Post()
  async createDMChannel(@Request() req, @Body() createDMChannelDto: CreateDMChannelDto) {
    try {
      const userId = req.user?.id || 'user1'; // Fallback for dev
      console.log('Creating DM channel for user:', userId, 'with recipient:', createDMChannelDto.recipientId);
      const result = await this.dmService.createDMChannel(userId, createDMChannelDto);
      console.log('DM channel created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating DM channel:', error);
      throw error;
    }
  }

  @Get()
  async getDMChannels(@Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.dmService.getDMChannels(userId);
  }

  @Post('group')
  async createGroupDM(@Request() req, @Body() createGroupDMChannelDto: CreateGroupDMChannelDto) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.dmService.createGroupDM(userId, createGroupDMChannelDto);
  }

  @Post(':channelId/recipients')
  async addRecipientToGroupDM(
    @Request() req,
    @Param('channelId') channelId: string,
    @Body() body: { userId: string }
  ) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.dmService.addUserToGroupDM(channelId, userId, body.userId);
  }

  @Delete(':channelId/recipients/:recipientId')
  async removeRecipientFromGroupDM(
    @Request() req,
    @Param('channelId') channelId: string,
    @Param('recipientId') recipientId: string
  ) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.dmService.removeUserFromGroupDM(channelId, userId, recipientId);
  }

  @Delete(':channelId')
  async closeDMChannel(@Request() req, @Param('channelId') channelId: string) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.dmService.closeDMChannel(channelId, userId);
  }

  @Get(':channelId')
  async getDMChannelById(@Request() req, @Param('channelId') channelId: string) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.dmService.getDMChannelById(channelId, userId);
  }
}
