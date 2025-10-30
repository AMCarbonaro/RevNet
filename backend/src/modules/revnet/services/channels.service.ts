import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { Server } from '../entities/server.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(Server)
    private serversRepository: Repository<Server>,
  ) {}

  async create(serverId: string, createChannelDto: CreateChannelDto, userId: string): Promise<Channel> {
    // Check if server exists
    const server = await this.serversRepository.findOne({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // For now, allow all users to create channels (simplified for development)
    // TODO: Implement proper permission system

    // Get next position
    const lastChannel = await this.channelsRepository.findOne({
      where: { serverId },
      order: { position: 'DESC' },
    });

    const channel = this.channelsRepository.create({
      ...createChannelDto,
      serverId,
      position: lastChannel ? lastChannel.position + 1 : 0,
    });

    const savedChannel = await this.channelsRepository.save(channel);
    
    return savedChannel;
  }

  async findAll(serverId: string, userId: string): Promise<Channel[]> {
    // Check if server exists
    const server = await this.serversRepository.findOne({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // For now, allow all users to view channels (simplified for development)
    // TODO: Implement proper permission system
    return await this.channelsRepository.find({
      where: { serverId, isActive: true },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { id, isActive: true },
      relations: ['server'],
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // For now, allow all users to view channels (simplified for development)
    // TODO: Implement proper permission system
    return channel;
  }

  async update(id: string, updateChannelDto: UpdateChannelDto, userId: string): Promise<Channel> {
    const channel = await this.findOne(id, userId);
    
    // Check if user is owner or has admin permissions
    const server = channel.server;
    const isOwner = server.ownerId === userId;
    
    if (!isOwner) {
      throw new ForbiddenException('Only server owners can update channel settings');
    }

    Object.assign(channel, updateChannelDto);
    const updatedChannel = await this.channelsRepository.save(channel);
    
    return updatedChannel;
  }

  async remove(id: string, userId: string): Promise<void> {
    const channel = await this.findOne(id, userId);
    
    // Check if user is owner or has admin permissions
    const server = channel.server;
    const isOwner = server.ownerId === userId;
    
    if (!isOwner) {
      throw new ForbiddenException('Only server owners can delete channels');
    }

    // Soft delete
    channel.isActive = false;
    await this.channelsRepository.save(channel);
  }

  async fixActiveChannels(): Promise<{ message: string; updated: number }> {
    const result = await this.channelsRepository.update({}, { isActive: true });
    return {
      message: 'All channels updated to active',
      updated: result.affected || 0
    };
  }
}
