import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend, FriendStatus } from '../entities/friend.entity';
import { User } from '../../auth/entities/user.entity';
import { CreateFriendRequestDto } from '../dto/create-friend-request.dto';
import { UpdateFriendRequestDto } from '../dto/update-friend-request.dto';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendFriendRequest(userId: string, createFriendRequestDto: CreateFriendRequestDto): Promise<Friend> {
    const { friendUsername } = createFriendRequestDto;

    // Find the friend by username
    const friend = await this.userRepository.findOne({
      where: { username: friendUsername }
    });

    if (!friend) {
      throw new NotFoundException('User not found');
    }

    if (friend.id === userId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if friendship already exists
    const existingFriendship = await this.friendRepository.findOne({
      where: [
        { userId, friendId: friend.id },
        { userId: friend.id, friendId: userId }
      ]
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendStatus.ACCEPTED) {
        throw new ConflictException('Users are already friends');
      } else if (existingFriendship.status === FriendStatus.PENDING) {
        throw new ConflictException('Friend request already pending');
      } else if (existingFriendship.status === FriendStatus.BLOCKED) {
        throw new ConflictException('Cannot send friend request to blocked user');
      }
    }

    // Create friend request
    const friendRequest = this.friendRepository.create({
      userId,
      friendId: friend.id,
      status: FriendStatus.PENDING
    });

    return await this.friendRepository.save(friendRequest);
  }

  async acceptFriendRequest(requestId: string, userId: string): Promise<Friend> {
    const friendRequest = await this.friendRepository.findOne({
      where: { id: requestId, friendId: userId, status: FriendStatus.PENDING },
      relations: ['user', 'friend']
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    friendRequest.status = FriendStatus.ACCEPTED;
    return await this.friendRepository.save(friendRequest);
  }

  async declineFriendRequest(requestId: string, userId: string): Promise<void> {
    const friendRequest = await this.friendRepository.findOne({
      where: { id: requestId, friendId: userId, status: FriendStatus.PENDING }
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    await this.friendRepository.remove(friendRequest);
  }

  async blockUser(userId: string, blockedUserId: string): Promise<Friend> {
    // Check if already blocked
    const existingBlock = await this.friendRepository.findOne({
      where: { userId, friendId: blockedUserId, status: FriendStatus.BLOCKED }
    });

    if (existingBlock) {
      return existingBlock;
    }

    // Remove any existing friendship
    await this.friendRepository.delete([
      { userId, friendId: blockedUserId },
      { userId: blockedUserId, friendId: userId }
    ]);

    // Create block relationship
    const block = this.friendRepository.create({
      userId,
      friendId: blockedUserId,
      status: FriendStatus.BLOCKED
    });

    return await this.friendRepository.save(block);
  }

  async getFriends(userId: string): Promise<Friend[]> {
    try {
      return await this.friendRepository.find({
        where: [
          { userId, status: FriendStatus.ACCEPTED },
          { friendId: userId, status: FriendStatus.ACCEPTED }
        ],
        relations: ['user', 'friend']
      });
    } catch (error) {
      console.log('No friends found, returning empty array:', error.message);
      return [];
    }
  }

  async getPendingRequests(userId: string): Promise<Friend[]> {
    try {
      return await this.friendRepository.find({
        where: { friendId: userId, status: FriendStatus.PENDING },
        relations: ['user']
      });
    } catch (error) {
      console.log('No pending friend requests found, returning empty array:', error.message);
      return [];
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const friendship = await this.friendRepository.findOne({
      where: [
        { userId, friendId, status: FriendStatus.ACCEPTED },
        { userId: friendId, friendId: userId, status: FriendStatus.ACCEPTED }
      ]
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendRepository.remove(friendship);
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    const block = await this.friendRepository.findOne({
      where: { userId, friendId: blockedUserId, status: FriendStatus.BLOCKED }
    });

    if (!block) {
      throw new NotFoundException('User is not blocked');
    }

    await this.friendRepository.remove(block);
  }
}
