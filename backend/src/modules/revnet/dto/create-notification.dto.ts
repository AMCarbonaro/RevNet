import { IsEnum, IsString, IsOptional, IsUUID, IsObject } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsUUID()
  channelId?: string;

  @IsOptional()
  @IsUUID()
  serverId?: string;

  @IsOptional()
  @IsUUID()
  messageId?: string;

  @IsOptional()
  @IsUUID()
  senderId?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
