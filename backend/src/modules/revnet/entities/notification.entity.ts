import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NotificationType {
  MESSAGE = 'message',
  MENTION = 'mention',
  REACTION = 'reaction',
  SERVER_INVITE = 'server_invite',
  FRIEND_REQUEST = 'friend_request',
  VOICE_CALL = 'voice_call',
  SYSTEM = 'system'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  channelId: string;

  @Column({ nullable: true })
  serverId: string;

  @Column({ nullable: true })
  messageId: string;

  @Column({ nullable: true })
  senderId: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations removed to avoid circular dependency
  // TODO: Add back when User entity is properly configured
}
