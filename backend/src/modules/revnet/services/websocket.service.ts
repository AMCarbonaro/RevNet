import { Injectable, Logger } from '@nestjs/common';
import { RevNetGateway } from '../gateways/revnet.gateway';

@Injectable()
export class WebSocketService {
  private logger: Logger = new Logger('WebSocketService');

  constructor(private revNetGateway: RevNetGateway) {}

  // Broadcast message to all users in a channel
  broadcastMessage(channelId: string, message: any) {
    this.revNetGateway.broadcastToChannel(channelId, 'message_received', {
      message,
      channelId,
    });
    this.logger.log(`Message broadcasted to channel ${channelId}`);
  }

  // Broadcast message update to all users in a channel
  broadcastMessageUpdate(channelId: string, message: any) {
    this.revNetGateway.broadcastToChannel(channelId, 'message_updated', {
      message,
      channelId,
    });
    this.logger.log(`Message update broadcasted to channel ${channelId}`);
  }

  // Broadcast message deletion to all users in a channel
  broadcastMessageDeletion(channelId: string, messageId: string) {
    this.revNetGateway.broadcastToChannel(channelId, 'message_deleted', {
      messageId,
      channelId,
    });
    this.logger.log(`Message deletion broadcasted to channel ${channelId}`);
  }

  // Broadcast server update to all members
  broadcastServerUpdate(serverId: string, update: any) {
    this.revNetGateway.broadcastToServer(serverId, 'server_updated', {
      serverId,
      update,
    });
    this.logger.log(`Server update broadcasted to server ${serverId}`);
  }

  // Broadcast channel update to all users in the server
  broadcastChannelUpdate(serverId: string, channel: any) {
    this.revNetGateway.broadcastToServer(serverId, 'channel_updated', {
      channel,
      serverId,
    });
    this.logger.log(`Channel update broadcasted to server ${serverId}`);
  }

  // Broadcast channel creation to all users in the server
  broadcastChannelCreated(serverId: string, channel: any) {
    this.revNetGateway.broadcastToServer(serverId, 'channel_created', {
      channel,
      serverId,
    });
    this.logger.log(`Channel creation broadcasted to server ${serverId}`);
  }

  // Broadcast channel deletion to all users in the server
  broadcastChannelDeleted(serverId: string, channelId: string) {
    this.revNetGateway.broadcastToServer(serverId, 'channel_deleted', {
      channelId,
      serverId,
    });
    this.logger.log(`Channel deletion broadcasted to server ${serverId}`);
  }

  // Broadcast user joined server
  broadcastUserJoinedServer(serverId: string, user: any) {
    this.revNetGateway.broadcastToServer(serverId, 'user_joined_server', {
      user,
      serverId,
    });
    this.logger.log(`User joined server broadcasted to server ${serverId}`);
  }

  // Broadcast user left server
  broadcastUserLeftServer(serverId: string, user: any) {
    this.revNetGateway.broadcastToServer(serverId, 'user_left_server', {
      user,
      serverId,
    });
    this.logger.log(`User left server broadcasted to server ${serverId}`);
  }

  // Broadcast typing indicator
  broadcastTyping(channelId: string, userId: string, username: string) {
    this.revNetGateway.broadcastToChannel(channelId, 'user_typing', {
      userId,
      username,
      channelId,
    });
  }

  // Broadcast stop typing indicator
  broadcastStopTyping(channelId: string, userId: string, username: string) {
    this.revNetGateway.broadcastToChannel(channelId, 'user_stopped_typing', {
      userId,
      username,
      channelId,
    });
  }

  // Broadcast voice channel events
  broadcastVoiceChannelUpdate(channelId: string, event: string, data: any) {
    this.revNetGateway.broadcastToChannel(channelId, event, {
      ...data,
      channelId,
    });
  }

  // Get connected users count for a server
  getConnectedUsersCount(serverId: string): number {
    // This would need to be implemented based on how you track connected users
    // For now, return a mock value
    return 0;
  }

  // Get connected users for a voice channel
  getVoiceChannelUsers(channelId: string): any[] {
    // This would need to be implemented based on how you track voice channel users
    // For now, return an empty array
    return [];
  }
}
