import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { NotificationsService } from '../services/notifications.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { SearchMessagesQueryDto } from '../dto/search-messages-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RevNetGateway } from '../gateways/revnet.gateway';

@Controller('api/revnet/channels/:channelId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly notificationsService: NotificationsService,
    private readonly revNetGateway: RevNetGateway
  ) {}

  @Post()
  async create(@Param('channelId') channelId: string, @Body() createMessageDto: CreateMessageDto, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    const message: any = await this.messagesService.create(channelId, createMessageDto, userId);
    
    // Transform message for WebSocket (use author data from service)
    const wsMessage = {
      id: message.id,
      content: message.content,
      author: message.author || {
        id: message.authorId,
        username: 'Unknown User',
        discriminator: '0000',
        avatar: null,
      },
      channelId: message.channelId,
      timestamp: message.createdAt.toISOString(),
      editedTimestamp: message.editedTimestamp?.toISOString() || null,
      type: message.type,
      tts: message.tts,
      mentionEveryone: message.mentionEveryone,
      pinned: message.pinned,
      flags: message.flags,
    };
    
    // Create notifications for mentions
    await this.createNotificationsForMessage(message, channelId);
    
    // Broadcast the message via WebSocket
    this.revNetGateway.broadcastToChannel(channelId, 'message_received', {
      message: wsMessage,
      channelId: channelId,
    });
    
    return message;
  }

  @Get()
  findAll(
    @Param('channelId') channelId: string,
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.findAll(channelId, userId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.update(id, updateMessageDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.remove(id, userId);
  }

  // Add missing message endpoints
  @Post(':id/reactions')
  addReaction(@Param('id') id: string, @Body('emoji') emoji: string, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.addReaction(id, emoji, userId);
  }

  @Delete(':id/reactions')
  removeReaction(@Param('id') id: string, @Body('emoji') emoji: string, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.removeReaction(id, emoji, userId);
  }

  @Patch(':id/pin')
  pinMessage(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.pinMessage(id, userId);
  }

  @Delete(':id/pin')
  unpinMessage(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.unpinMessage(id, userId);
  }

  @Get('search')
  searchMessages(@Query() searchQuery: SearchMessagesQueryDto, @Request() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request - authentication required');
    }
    return this.messagesService.searchMessages(userId, searchQuery);
  }

  private async createNotificationsForMessage(message: any, channelId: string): Promise<void> {
    try {
      // Get channel info to find serverId
      // For now, we'll use a mock serverId since we need to get it from the channel
      const serverId = 'mock-server-id'; // TODO: Get actual serverId from channel
      
      // Check for mentions in message content
      const mentionRegex = /@(\w+)/g;
      const mentions = message.content.match(mentionRegex);
      
      if (mentions && mentions.length > 0) {
        // For each mention, create a notification
        // In a real app, you'd look up the actual user IDs
        for (const mention of mentions) {
          const mentionedUsername = mention.replace('@', '');
          
          // Mock user ID lookup - in real app, query user database
          const mentionedUserId = this.getUserIdByUsername(mentionedUsername);
          
          if (mentionedUserId && mentionedUserId !== message.authorId) {
            await this.notificationsService.createMentionNotification(
              mentionedUserId,
              channelId,
              serverId,
              message.id,
              message.authorId,
              message.content
            );
          }
        }
      }
      
      // Create general message notification for channel members
      // In a real app, you'd get all channel members except the sender
      const channelMembers = await this.getChannelMembers(channelId);
      
      for (const memberId of channelMembers) {
        if (memberId !== message.authorId) {
          await this.notificationsService.createMessageNotification(
            memberId,
            channelId,
            serverId,
            message.id,
            message.authorId,
            message.content
          );
        }
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
      // Don't throw error to avoid breaking message creation
    }
  }

  private getUserIdByUsername(username: string): string | null {
    // Mock implementation - in real app, query user database
    const mockUsers: { [key: string]: string } = {
      'CurrentUser': 'user1',
      'TestUser': 'user2',
      'Member1': 'user3',
      'Member2': 'user4'
    };
    
    return mockUsers[username] || null;
  }

  private async getChannelMembers(channelId: string): Promise<string[]> {
    // Mock implementation - in real app, query channel members
    return ['user1', 'user2', 'user3', 'user4'];
  }
}
