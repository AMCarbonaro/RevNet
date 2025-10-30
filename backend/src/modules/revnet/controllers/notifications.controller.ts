import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationType } from '../entities/notification.entity';

@Controller('api/revnet/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.notificationsService.create(createNotificationDto, userId);
  }

  @Get()
  findAll(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    const userId = req.user?.id || 'user1';
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.notificationsService.findAll(userId, pageNum, limitNum);
  }

  @Get('unread')
  findUnread(@Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.findUnread(userId);
  }

  @Get('unread/count')
  getUnreadCount(@Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('unread/count/type/:type')
  getUnreadCountByType(@Param('type') type: NotificationType, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.getUnreadCountByType(userId, type);
  }

  @Get('unread/count/channel/:channelId')
  getUnreadCountByChannel(@Param('channelId') channelId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.getUnreadCountByChannel(userId, channelId);
  }

  @Get('unread/count/server/:serverId')
  getUnreadCountByServer(@Param('serverId') serverId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.getUnreadCountByServer(userId, serverId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.update(id, updateNotificationDto, userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.archive(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.notificationsService.remove(id, userId);
  }
}
