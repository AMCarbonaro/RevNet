import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto, userId: string): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      userId,
    });

    return await this.notificationsRepository.save(notification);
  }

  async findAll(userId: string, page: number = 1, limit: number = 50): Promise<{ notifications: Notification[], total: number, page: number, totalPages: number }> {
    const [notifications, total] = await this.notificationsRepository.findAndCount({
      where: { userId, isArchived: false },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findUnread(userId: string): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: { userId, isRead: false, isArchived: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, userId: string): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    
    Object.assign(notification, updateNotificationDto);
    return await this.notificationsRepository.save(notification);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return await this.update(id, { isRead: true, status: NotificationStatus.READ }, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true, status: NotificationStatus.READ }
    );
  }

  async archive(id: string, userId: string): Promise<Notification> {
    return await this.update(id, { isArchived: true, status: NotificationStatus.ARCHIVED }, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationsRepository.remove(notification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, isRead: false, isArchived: false },
    });
  }

  async getUnreadCountByType(userId: string, type: NotificationType): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, type, isRead: false, isArchived: false },
    });
  }

  async getUnreadCountByChannel(userId: string, channelId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, channelId, isRead: false, isArchived: false },
    });
  }

  async getUnreadCountByServer(userId: string, serverId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, serverId, isRead: false, isArchived: false },
    });
  }

  // Helper method to create mention notification
  async createMentionNotification(
    userId: string,
    channelId: string,
    serverId: string,
    messageId: string,
    senderId: string,
    content: string
  ): Promise<Notification> {
    return await this.create({
      title: 'You were mentioned',
      content: content.length > 100 ? content.substring(0, 100) + '...' : content,
      type: NotificationType.MENTION,
      channelId,
      serverId,
      messageId,
      senderId,
      metadata: { isMention: true }
    }, userId);
  }

  // Helper method to create message notification
  async createMessageNotification(
    userId: string,
    channelId: string,
    serverId: string,
    messageId: string,
    senderId: string,
    content: string
  ): Promise<Notification> {
    return await this.create({
      title: 'New message',
      content: content.length > 100 ? content.substring(0, 100) + '...' : content,
      type: NotificationType.MESSAGE,
      channelId,
      serverId,
      messageId,
      senderId,
      metadata: { isMessage: true }
    }, userId);
  }

  // Helper method to create reaction notification
  async createReactionNotification(
    userId: string,
    channelId: string,
    serverId: string,
    messageId: string,
    senderId: string,
    emoji: string
  ): Promise<Notification> {
    return await this.create({
      title: 'New reaction',
      content: `Reacted with ${emoji}`,
      type: NotificationType.REACTION,
      channelId,
      serverId,
      messageId,
      senderId,
      metadata: { emoji, isReaction: true }
    }, userId);
  }
}
