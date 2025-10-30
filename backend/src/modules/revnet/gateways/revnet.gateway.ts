import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MessagesService } from '../services/messages.service';
import { ServersService } from '../services/servers.service';
import { ChannelsService } from '../services/channels.service';
import { FriendsService } from '../services/friends.service';
import { DMService } from '../services/dm.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'https://revnet.vercel.app'],
    credentials: true,
  },
  namespace: '/revnet',
})
export class RevNetGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('RevNetGateway');
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();
  private userServers: Map<string, Set<string>> = new Map(); // userId -> Set of serverIds

  constructor(
    private messagesService: MessagesService,
    private serversService: ServersService,
    private channelsService: ChannelsService,
    private friendsService: FriendsService,
    private dmService: DMService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('RevNet WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // For now, assign a mock user ID
    // In production, this would come from JWT token validation
    client.userId = 'user1';
    client.username = 'CurrentUser';
    
    this.connectedUsers.set(client.id, client);
    
    // Load user's servers and join them to appropriate rooms
    await this.joinUserServers(client);
    
    // Notify user of connection
    client.emit('connected', {
      message: 'Connected to RevNet',
      userId: client.userId,
      username: client.username,
    });
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    if (client.userId) {
      // Leave all server rooms
      const userServers = this.userServers.get(client.userId);
      if (userServers) {
        userServers.forEach(serverId => {
          client.leave(`server:${serverId}`);
        });
        this.userServers.delete(client.userId);
      }
    }
    
    this.connectedUsers.delete(client.id);
  }

  private async joinUserServers(client: AuthenticatedSocket) {
    if (!client.userId) return;

    try {
      const servers = await this.serversService.findAll(client.userId);
      const serverIds = servers.map(server => server.id);
      
      // Join user to server rooms
      serverIds.forEach(serverId => {
        client.join(`server:${serverId}`);
      });
      
      // Store user's servers
      this.userServers.set(client.userId, new Set(serverIds));
      
      this.logger.log(`User ${client.userId} joined ${serverIds.length} servers`);
    } catch (error) {
      this.logger.error(`Error joining user to servers: ${error.message}`);
    }
  }

  @SubscribeMessage('join_channel')
  async handleJoinChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; serverId: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      // Verify user has access to this channel
      const channel = await this.channelsService.findOne(data.channelId, client.userId);
      
      // Join channel room
      client.join(`channel:${data.channelId}`);
      
      // Load recent messages
      const messages = await this.messagesService.findAll(data.channelId, client.userId, 1, 50);
      
      client.emit('channel_joined', {
        channelId: data.channelId,
        messages: messages.messages,
        total: messages.total,
      });

      this.logger.log(`User ${client.userId} joined channel ${data.channelId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_channel')
  async handleLeaveChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    client.leave(`channel:${data.channelId}`);
    client.emit('channel_left', { channelId: data.channelId });
    
    this.logger.log(`User ${client.userId} left channel ${data.channelId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; content: string; type?: number },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      // Create message
      const message = await this.messagesService.create(data.channelId, {
        content: data.content,
        type: data.type || 0,
      }, client.userId);

      // Broadcast to all users in the channel
      this.server.to(`channel:${data.channelId}`).emit('message_received', {
        message,
        channelId: data.channelId,
      });

      this.logger.log(`Message sent in channel ${data.channelId} by user ${client.userId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const message = await this.messagesService.update(data.messageId, {
        content: data.content,
      }, client.userId);

      // Broadcast to all users in the channel
      this.server.to(`channel:${message.channelId}`).emit('message_updated', {
        message,
        channelId: message.channelId,
      });

      this.logger.log(`Message ${data.messageId} edited by user ${client.userId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const message = await this.messagesService.findOne(data.messageId, client.userId);
      await this.messagesService.remove(data.messageId, client.userId);

      // Broadcast to all users in the channel
      this.server.to(`channel:${message.channelId}`).emit('message_deleted', {
        messageId: data.messageId,
        channelId: message.channelId,
      });

      this.logger.log(`Message ${data.messageId} deleted by user ${client.userId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    if (!client.userId) return;

    // Broadcast typing indicator to other users in the channel
    client.to(`channel:${data.channelId}`).emit('user_typing', {
      userId: client.userId,
      username: client.username,
      channelId: data.channelId,
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    if (!client.userId) return;

    // Broadcast stop typing indicator
    client.to(`channel:${data.channelId}`).emit('user_stopped_typing', {
      userId: client.userId,
      username: client.username,
      channelId: data.channelId,
    });
  }

  @SubscribeMessage('join_voice_channel')
  async handleJoinVoiceChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; serverId: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      // Verify user has access to this voice channel
      const channel = await this.channelsService.findOne(data.channelId, client.userId);
      
      if (channel.type !== 2) { // Voice channel type
        client.emit('error', { message: 'Not a voice channel' });
        return;
      }

      // Join voice channel room
      client.join(`voice:${data.channelId}`);
      
      // Notify other users in the voice channel
      client.to(`voice:${data.channelId}`).emit('user_joined_voice', {
        userId: client.userId,
        username: client.username,
        channelId: data.channelId,
      });

      client.emit('voice_joined', {
        channelId: data.channelId,
        participants: await this.getVoiceChannelParticipants(data.channelId),
      });

      this.logger.log(`User ${client.userId} joined voice channel ${data.channelId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_voice_channel')
  async handleLeaveVoiceChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    client.leave(`voice:${data.channelId}`);
    
    // Notify other users in the voice channel
    client.to(`voice:${data.channelId}`).emit('user_left_voice', {
      userId: client.userId,
      username: client.username,
      channelId: data.channelId,
    });

    this.logger.log(`User ${client.userId} left voice channel ${data.channelId}`);
  }

  @SubscribeMessage('voice_offer')
  async handleVoiceOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; targetUserId: string; offer: any },
  ) {
    // Forward WebRTC offer to target user
    const targetClient = Array.from(this.connectedUsers.values())
      .find(user => user.userId === data.targetUserId);
    
    if (targetClient) {
      targetClient.emit('voice_offer', {
        fromUserId: client.userId,
        fromUsername: client.username,
        offer: data.offer,
        channelId: data.channelId,
      });
    }
  }

  @SubscribeMessage('voice_answer')
  async handleVoiceAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; targetUserId: string; answer: any },
  ) {
    // Forward WebRTC answer to target user
    const targetClient = Array.from(this.connectedUsers.values())
      .find(user => user.userId === data.targetUserId);
    
    if (targetClient) {
      targetClient.emit('voice_answer', {
        fromUserId: client.userId,
        fromUsername: client.username,
        answer: data.answer,
        channelId: data.channelId,
      });
    }
  }

  @SubscribeMessage('ice_candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; targetUserId: string; candidate: any },
  ) {
    // Forward ICE candidate to target user
    const targetClient = Array.from(this.connectedUsers.values())
      .find(user => user.userId === data.targetUserId);
    
    if (targetClient) {
      targetClient.emit('ice_candidate', {
        fromUserId: client.userId,
        fromUsername: client.username,
        candidate: data.candidate,
        channelId: data.channelId,
      });
    }
  }

  private async getVoiceChannelParticipants(channelId: string): Promise<any[]> {
    // Get all connected users in this voice channel
    const voiceRoom = this.server.sockets.adapter.rooms.get(`voice:${channelId}`);
    if (!voiceRoom) return [];

    const participants: any[] = [];
    for (const socketId of voiceRoom) {
      const socket = this.connectedUsers.get(socketId);
      if (socket && socket.userId && socket.username) {
        participants.push({
          userId: socket.userId,
          username: socket.username,
        });
      }
    }

    return participants;
  }

  // Utility method to broadcast to all users in a server
  broadcastToServer(serverId: string, event: string, data: any) {
    this.server.to(`server:${serverId}`).emit(event, data);
  }

  // Utility method to broadcast to all users in a channel
  broadcastToChannel(channelId: string, event: string, data: any) {
    this.server.to(`channel:${channelId}`).emit(event, data);
  }

  // Friend-related WebSocket events
  @SubscribeMessage('friend_request')
  async handleFriendRequest(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { friendUsername: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const friendRequest = await this.friendsService.sendFriendRequest(client.userId, {
        friendUsername: data.friendUsername,
      });

      // Find the friend's socket and notify them
      const friendSocket = Array.from(this.connectedUsers.values())
        .find(user => user.username === data.friendUsername);
      
      if (friendSocket) {
        friendSocket.emit('friend_request_received', {
          request: friendRequest,
          fromUserId: client.userId,
          fromUsername: client.username,
        });
      }

      client.emit('friend_request_sent', { request: friendRequest });
      this.logger.log(`Friend request sent from ${client.userId} to ${data.friendUsername}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('friend_accept')
  async handleFriendAccept(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { requestId: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const friendRequest = await this.friendsService.acceptFriendRequest(data.requestId, client.userId);

      // Notify the original sender
      const senderSocket = Array.from(this.connectedUsers.values())
        .find(user => user.userId === friendRequest.userId);
      
      if (senderSocket) {
        senderSocket.emit('friend_accepted', {
          request: friendRequest,
          byUserId: client.userId,
          byUsername: client.username,
        });
      }

      client.emit('friend_request_accepted', { request: friendRequest });
      this.logger.log(`Friend request ${data.requestId} accepted by ${client.userId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('friend_decline')
  async handleFriendDecline(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { requestId: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      await this.friendsService.declineFriendRequest(data.requestId, client.userId);
      client.emit('friend_request_declined', { requestId: data.requestId });
      this.logger.log(`Friend request ${data.requestId} declined by ${client.userId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // DM-related WebSocket events
  @SubscribeMessage('dm_open')
  async handleDMOpen(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { recipientId: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const dmChannel = await this.dmService.createDMChannel(client.userId, {
        recipientId: data.recipientId,
      });

      // Notify both users about the new DM channel
      const recipientSocket = Array.from(this.connectedUsers.values())
        .find(user => user.userId === data.recipientId);
      
      if (recipientSocket) {
        recipientSocket.emit('dm_opened', {
          channel: dmChannel,
          fromUserId: client.userId,
          fromUsername: client.username,
        });
      }

      client.emit('dm_opened', {
        channel: dmChannel,
        toUserId: data.recipientId,
      });

      this.logger.log(`DM channel opened between ${client.userId} and ${data.recipientId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('group_dm_open')
  async handleGroupDMOpen(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { recipientIds: string[]; name?: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const groupDM = await this.dmService.createGroupDM(client.userId, {
        recipientIds: data.recipientIds,
        name: data.name,
      });

      // Notify all recipients about the new group DM
      data.recipientIds.forEach(recipientId => {
        const recipientSocket = Array.from(this.connectedUsers.values())
          .find(user => user.userId === recipientId);
        
        if (recipientSocket) {
          recipientSocket.emit('group_dm_opened', {
            channel: groupDM,
            fromUserId: client.userId,
            fromUsername: client.username,
          });
        }
      });

      client.emit('group_dm_opened', {
        channel: groupDM,
        toUserIds: data.recipientIds,
      });

      this.logger.log(`Group DM opened by ${client.userId} with ${data.recipientIds.length} recipients`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
