import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FriendsService } from '../services/friends.service';
import { CreateFriendRequestDto } from '../dto/create-friend-request.dto';
import { UpdateFriendRequestDto } from '../dto/update-friend-request.dto';

@Controller('api/revnet/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('requests')
  async sendFriendRequest(@Request() req, @Body() createFriendRequestDto: CreateFriendRequestDto) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.friendsService.sendFriendRequest(userId, createFriendRequestDto);
  }

  @Get()
  async getFriends(@Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.friendsService.getFriends(userId);
  }

  @Get('pending')
  async getPendingRequests(@Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.friendsService.getPendingRequests(userId);
  }

  @Put('requests/:id/accept')
  async acceptFriendRequest(@Request() req, @Param('id') requestId: string) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.friendsService.acceptFriendRequest(requestId, userId);
  }

  @Delete('requests/:id')
  async declineFriendRequest(@Request() req, @Param('id') requestId: string) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.friendsService.declineFriendRequest(requestId, userId);
  }

  @Post(':id/block')
  async blockUser(@Request() req, @Param('id') friendId: string) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.friendsService.blockUser(userId, friendId);
  }

  @Delete(':id')
  async removeFriend(@Request() req, @Param('id') friendId: string) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.friendsService.removeFriend(userId, friendId);
  }

  @Delete(':id/unblock')
  async unblockUser(@Request() req, @Param('id') blockedUserId: string) {
    const userId = req.user?.id || 'user1'; // Fallback for dev
    return await this.friendsService.unblockUser(userId, blockedUserId);
  }
}
