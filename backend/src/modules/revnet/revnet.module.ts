import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { Friend } from './entities/friend.entity';
import { DMChannel } from './entities/dm-channel.entity';
import { User } from '../auth/entities/user.entity';
import { ServersService } from './services/servers.service';
import { ChannelsService } from './services/channels.service';
import { MessagesService } from './services/messages.service';
import { NotificationsService } from './services/notifications.service';
import { WebSocketService } from './services/websocket.service';
import { FriendsService } from './services/friends.service';
import { DMService } from './services/dm.service';
import { SeederService } from './services/seeder.service';
import { RevNetSeeder } from './seeders/revnet-seeder';
import { ServersController } from './controllers/servers.controller';
import { ServerDiscoveryController } from './controllers/server-discovery.controller';
import { ChannelsController } from './controllers/channels.controller';
import { MessagesController } from './controllers/messages.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { FriendsController } from './controllers/friends.controller';
import { DMController } from './controllers/dm.controller';
import { RevNetGateway } from './gateways/revnet.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Server, Channel, Message, Notification, Friend, DMChannel, User]),
  ],
  controllers: [
    ServersController,
    ServerDiscoveryController,
    ChannelsController,
    MessagesController,
    NotificationsController,
    FriendsController,
    DMController,
  ],
  providers: [
    ServersService,
    ChannelsService,
    MessagesService,
    NotificationsService,
    WebSocketService,
    FriendsService,
    DMService,
    SeederService,
    RevNetSeeder,
    RevNetGateway,
  ],
  exports: [
    ServersService,
    ChannelsService,
    MessagesService,
    NotificationsService,
    WebSocketService,
    FriendsService,
    DMService,
    RevNetGateway,
  ],
})
export class RevNetModule {}
