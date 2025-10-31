import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, IsNull, Not, In } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Channel } from '../entities/channel.entity';
import { User } from '../../auth/entities/user.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { SearchMessagesQueryDto } from '../dto/search-messages-query.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(channelId: string, createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
    // Check if channel exists
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId, isActive: true },
      relations: ['server'],
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // For now, allow all users to send messages (simplified for development)
    // TODO: Implement proper permission system

    const message = this.messagesRepository.create({
      ...createMessageDto,
      channelId,
      authorId: userId,
      isActive: true,
    });

    const savedMessage = await this.messagesRepository.save(message);
    
    // Fetch author data for the saved message
    const author = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Return message with author data
    return {
      ...savedMessage,
      author: author ? {
        id: author.id,
        username: author.username,
        discriminator: author.discriminator || '0000',
        avatar: author.avatar || null,
        status: author.status || 'offline',
      } : null,
    } as any;
  }

  async findAll(channelId: string, userId: string, page: number = 1, limit: number = 50): Promise<{ messages: any[], total: number, page: number, totalPages: number }> {
    // Check if channel exists
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId, isActive: true },
      relations: ['server'],
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // For now, allow all users to view messages (simplified for development)
    // TODO: Implement proper permission system

    const [messages, total] = await this.messagesRepository.findAndCount({
      where: { channelId, isActive: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    // Get unique author IDs
    const authorIds = [...new Set(messages.map(m => m.authorId))];
    
    // Fetch all authors at once
    const authors = await this.userRepository.find({
      where: { id: In(authorIds) },
    });

    // Create a map for quick lookup
    const authorMap = new Map(authors.map(a => [a.id, a]));

    // Transform messages to include author data
    const messagesWithAuthor = messages.reverse().map(message => ({
      ...message,
      author: message.authorId ? {
        id: message.authorId,
        username: authorMap.get(message.authorId)?.username || 'Unknown User',
        discriminator: authorMap.get(message.authorId)?.discriminator || '0000',
        avatar: authorMap.get(message.authorId)?.avatar || null,
        status: authorMap.get(message.authorId)?.status || 'offline',
      } : null,
    }));

    return {
      messages: messagesWithAuthor,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string, userId: string): Promise<any> {
    const message = await this.messagesRepository.findOne({
      where: { id, isActive: true },
      relations: ['channel', 'channel.server'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user has permission to view this message
    const server = message.channel.server;
    const isOwner = server.ownerId === userId;
    
    if (!isOwner) {
      throw new ForbiddenException('You must be the owner of this server to view this message');
    }

    // Fetch author data
    const author = await this.userRepository.findOne({
      where: { id: message.authorId },
    });

    return {
      ...message,
      author: author ? {
        id: author.id,
        username: author.username,
        discriminator: author.discriminator || '0000',
        avatar: author.avatar || null,
        status: author.status || 'offline',
      } : null,
    };
  }

  async update(id: string, updateMessageDto: UpdateMessageDto, userId: string): Promise<Message> {
    const message = await this.findOne(id, userId);
    
    // Check if user is the author of the message
    if (message.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Check if message is not too old (e.g., 24 hours)
    const now = new Date();
    const messageAge = now.getTime() - message.createdAt.getTime();
    const maxEditAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (messageAge > maxEditAge) {
      throw new ForbiddenException('Messages can only be edited within 24 hours of posting');
    }

    Object.assign(message, updateMessageDto);
    message.editedTimestamp = new Date();
    
    const updatedMessage = await this.messagesRepository.save(message);
    
    // Fetch author data
    const author = await this.userRepository.findOne({
      where: { id: updatedMessage.authorId },
    });

    return {
      ...updatedMessage,
      author: author ? {
        id: author.id,
        username: author.username,
        discriminator: author.discriminator || '0000',
        avatar: author.avatar || null,
        status: author.status || 'offline',
      } : null,
    } as any;
  }

  async remove(id: string, userId: string): Promise<void> {
    const message = await this.findOne(id, userId);
    
    // Check if user is the author or has admin permissions
    const server = message.channel.server;
    const isAuthor = message.authorId === userId;
    const isOwner = server.ownerId === userId;
    
    if (!isAuthor && !isOwner) {
      throw new ForbiddenException('You can only delete your own messages or be a server owner');
    }

    // Soft delete
    message.isActive = false;
    await this.messagesRepository.save(message);
  }

  async addReaction(messageId: string, emoji: string, userId: string): Promise<any> {
    const message = await this.findOne(messageId, userId);
    
    // For now, just return the message (already includes author)
    // In a real implementation, you'd add the reaction to a reactions table
    return message;
  }

  async removeReaction(messageId: string, emoji: string, userId: string): Promise<any> {
    const message = await this.findOne(messageId, userId);
    
    // For now, just return the message (already includes author)
    // In a real implementation, you'd remove the reaction from a reactions table
    return message;
  }

  async pinMessage(messageId: string, userId: string): Promise<any> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, isActive: true },
      relations: ['channel', 'channel.server'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    // Check if user has permission to pin messages
    const server = message.channel.server;
    const isOwner = server.ownerId === userId;
    
    if (!isOwner) {
      throw new ForbiddenException('You must be the owner of this server to pin messages');
    }

    message.pinned = true;
    const updatedMessage = await this.messagesRepository.save(message);
    
    // Fetch author data
    const author = await this.userRepository.findOne({
      where: { id: updatedMessage.authorId },
    });

    return {
      ...updatedMessage,
      author: author ? {
        id: author.id,
        username: author.username,
        discriminator: author.discriminator || '0000',
        avatar: author.avatar || null,
        status: author.status || 'offline',
      } : null,
    };
  }

  async unpinMessage(messageId: string, userId: string): Promise<any> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, isActive: true },
      relations: ['channel', 'channel.server'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    // Check if user has permission to unpin messages
    const server = message.channel.server;
    const isOwner = server.ownerId === userId;
    
    if (!isOwner) {
      throw new ForbiddenException('You must be the owner of this server to unpin messages');
    }

    message.pinned = false;
    const updatedMessage = await this.messagesRepository.save(message);
    
    // Fetch author data
    const author = await this.userRepository.findOne({
      where: { id: updatedMessage.authorId },
    });

    return {
      ...updatedMessage,
      author: author ? {
        id: author.id,
        username: author.username,
        discriminator: author.discriminator || '0000',
        avatar: author.avatar || null,
        status: author.status || 'offline',
      } : null,
    };
  }

  async searchMessages(userId: string, searchQuery: SearchMessagesQueryDto): Promise<{ messages: Message[], total: number }> {
    const { query, serverId, channelId, userId: authorId, hasAttachments, hasEmbeds, before, after, limit = 50 } = searchQuery;

    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('channel.server', 'server')
      .where('message.isActive = :isActive', { isActive: true })
      .andWhere('message.content ILIKE :query', { query: `%${query}%` });

    // Server filter
    if (serverId) {
      queryBuilder.andWhere('server.id = :serverId', { serverId });
    }

    // Channel filter
    if (channelId) {
      queryBuilder.andWhere('channel.id = :channelId', { channelId });
    }

    // Author filter
    if (authorId) {
      queryBuilder.andWhere('message.authorId = :authorId', { authorId });
    }

    // Attachments filter
    if (hasAttachments !== undefined) {
      if (hasAttachments) {
        queryBuilder.andWhere('message.attachments IS NOT NULL AND message.attachments != :emptyArray', { emptyArray: '[]' });
      } else {
        queryBuilder.andWhere('(message.attachments IS NULL OR message.attachments = :emptyArray)', { emptyArray: '[]' });
      }
    }

    // Embeds filter
    if (hasEmbeds !== undefined) {
      if (hasEmbeds) {
        queryBuilder.andWhere('message.embeds IS NOT NULL AND message.embeds != :emptyArray', { emptyArray: '[]' });
      } else {
        queryBuilder.andWhere('(message.embeds IS NULL OR message.embeds = :emptyArray)', { emptyArray: '[]' });
      }
    }

    // Date filters
    if (before) {
      queryBuilder.andWhere('message.createdAt < :before', { before: new Date(before) });
    }

    if (after) {
      queryBuilder.andWhere('message.createdAt > :after', { after: new Date(after) });
    }

    // Order by most recent first
    queryBuilder.orderBy('message.createdAt', 'DESC');

    // Limit results
    queryBuilder.limit(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    // Get unique author IDs
    const authorIds = [...new Set(messages.map(m => m.authorId))];
    
    // Fetch all authors at once
    const authors = await this.userRepository.find({
      where: { id: In(authorIds) },
    });

    // Create a map for quick lookup
    const authorMap = new Map(authors.map(a => [a.id, a]));

    // Transform messages to include author data
    const messagesWithAuthor = messages.map(message => ({
      ...message,
      author: message.authorId ? {
        id: message.authorId,
        username: authorMap.get(message.authorId)?.username || 'Unknown User',
        discriminator: authorMap.get(message.authorId)?.discriminator || '0000',
        avatar: authorMap.get(message.authorId)?.avatar || null,
        status: authorMap.get(message.authorId)?.status || 'offline',
      } : null,
    }));

    return {
      messages: messagesWithAuthor,
      total
    };
  }
}
