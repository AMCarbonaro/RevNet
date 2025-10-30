import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, ChannelType } from '../entities/channel.entity';
import { DMChannel } from '../entities/dm-channel.entity';
import { User } from '../../auth/entities/user.entity';
import { CreateDMChannelDto, CreateGroupDMChannelDto } from '../dto/create-dm-channel.dto';

@Injectable()
export class DMService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(DMChannel)
    private dmChannelRepository: Repository<DMChannel>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      // Create a mock user for development
      const mockUser = this.userRepository.create({
        id: userId,
        username: `user_${userId}`,
        email: `user_${userId}@example.com`,
        password: 'mock_password',
        status: 'online',
        verified: false,
        mfaEnabled: false,
        locale: 'en-US',
        flags: 0,
        premiumType: 0,
        publicFlags: 0,
        isActive: true
      });
      await this.userRepository.save(mockUser);
    }
  }

  async createDMChannel(userId: string, createDMChannelDto: CreateDMChannelDto): Promise<DMChannel> {
    const { recipientId } = createDMChannelDto;

    // For development, create mock users if they don't exist
    await this.ensureUserExists(userId);
    await this.ensureUserExists(recipientId);

    // Check if DM channel already exists between these users
    const existingDM = await this.dmChannelRepository
      .createQueryBuilder('dm')
      .leftJoin('dm.channel', 'channel')
      .where('dm.isGroup = false')
      .andWhere('JSON_CONTAINS(dm.recipientIds, :userId)', { userId })
      .andWhere('JSON_CONTAINS(dm.recipientIds, :recipientId)', { recipientId })
      .getOne();

    if (existingDM) {
      return existingDM;
    }

    // Create the channel
    const channel = this.channelRepository.create({
      name: 'dm',
      type: ChannelType.DM,
      serverId: null, // DM channels don't belong to servers
      isActive: true
    });

    const savedChannel = await this.channelRepository.save(channel);

    // Create the DM channel record
    const dmChannel = this.dmChannelRepository.create({
      channelId: savedChannel.id,
      recipientIds: [userId, recipientId],
      isGroup: false
    });

    return await this.dmChannelRepository.save(dmChannel);
  }

  async createGroupDM(userId: string, createGroupDMChannelDto: CreateGroupDMChannelDto): Promise<DMChannel> {
    const { recipientIds, name } = createGroupDMChannelDto;

    // Add the creator to the recipient list
    const allRecipients = [...new Set([userId, ...recipientIds])];

    if (allRecipients.length < 2) {
      throw new ConflictException('Group DM must have at least 2 recipients');
    }

    // Generate group name if not provided
    const groupName = name || `Group DM (${allRecipients.length})`;

    // Create the channel
    const channel = this.channelRepository.create({
      name: groupName,
      type: ChannelType.GROUP_DM,
      serverId: null,
      isActive: true
    });

    const savedChannel = await this.channelRepository.save(channel);

    // Create the DM channel record
    const dmChannel = this.dmChannelRepository.create({
      channelId: savedChannel.id,
      recipientIds: allRecipients,
      name: groupName,
      isGroup: true
    });

    return await this.dmChannelRepository.save(dmChannel);
  }

  async getDMChannels(userId: string): Promise<DMChannel[]> {
    try {
      return await this.dmChannelRepository
        .createQueryBuilder('dm')
        .leftJoinAndSelect('dm.channel', 'channel')
        .where('JSON_CONTAINS(dm.recipientIds, :userId)', { userId })
        .andWhere('dm.isClosed = false')
        .orderBy('channel.updatedAt', 'DESC')
        .getMany();
    } catch (error) {
      console.log('No DM channels found, returning empty array:', error.message);
      return [];
    }
  }

  async addUserToGroupDM(channelId: string, userId: string, newUserId: string): Promise<DMChannel> {
    const dmChannel = await this.dmChannelRepository.findOne({
      where: { channelId, isGroup: true },
      relations: ['channel']
    });

    if (!dmChannel) {
      throw new NotFoundException('Group DM not found');
    }

    // Check if user is already in the group
    if (dmChannel.recipientIds.includes(newUserId)) {
      throw new ConflictException('User is already in the group');
    }

    // Add user to recipients
    dmChannel.recipientIds.push(newUserId);
    return await this.dmChannelRepository.save(dmChannel);
  }

  async removeUserFromGroupDM(channelId: string, userId: string, removeUserId: string): Promise<DMChannel> {
    const dmChannel = await this.dmChannelRepository.findOne({
      where: { channelId, isGroup: true },
      relations: ['channel']
    });

    if (!dmChannel) {
      throw new NotFoundException('Group DM not found');
    }

    // Remove user from recipients
    dmChannel.recipientIds = dmChannel.recipientIds.filter(id => id !== removeUserId);

    // If only one person left, convert to regular DM or close
    if (dmChannel.recipientIds.length < 2) {
      dmChannel.isClosed = true;
    }

    return await this.dmChannelRepository.save(dmChannel);
  }

  async closeDMChannel(channelId: string, userId: string): Promise<void> {
    const dmChannel = await this.dmChannelRepository.findOne({
      where: { channelId },
      relations: ['channel']
    });

    if (!dmChannel) {
      throw new NotFoundException('DM channel not found');
    }

    // Check if user is a recipient
    if (!dmChannel.recipientIds.includes(userId)) {
      throw new NotFoundException('You are not a member of this DM channel');
    }

    // For group DMs, remove user from recipients
    if (dmChannel.isGroup) {
      dmChannel.recipientIds = dmChannel.recipientIds.filter(id => id !== userId);
      
      // If only one person left, close the channel
      if (dmChannel.recipientIds.length < 2) {
        dmChannel.isClosed = true;
      }
    } else {
      // For 1:1 DMs, just mark as closed for this user
      dmChannel.isClosed = true;
    }

    await this.dmChannelRepository.save(dmChannel);
  }

  async getDMChannelById(channelId: string, userId: string): Promise<DMChannel> {
    const dmChannel = await this.dmChannelRepository.findOne({
      where: { channelId },
      relations: ['channel']
    });

    if (!dmChannel) {
      throw new NotFoundException('DM channel not found');
    }

    // Check if user is a recipient
    if (!dmChannel.recipientIds.includes(userId)) {
      throw new NotFoundException('You are not a member of this DM channel');
    }

    return dmChannel;
  }
}
