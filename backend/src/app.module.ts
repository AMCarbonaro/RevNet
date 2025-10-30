import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestEntity } from './entities/test.entity';
import { User } from './modules/auth/entities/user.entity';
import { Server } from './modules/revnet/entities/server.entity';
import { Channel } from './modules/revnet/entities/channel.entity';
import { Message } from './modules/revnet/entities/message.entity';
import { Notification } from './modules/revnet/entities/notification.entity';
import { LettersModule } from './modules/letters/letters.module';
import { AuthModule } from './modules/auth/auth.module';
import { RevoltsModule } from './modules/revolts/revolts.module';
import { RevNetModule } from './modules/revnet/revnet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Only configure TypeORM if DATABASE_URL is provided
    ...(process.env.DATABASE_URL ? [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [TestEntity, User, Server, Channel, Message, Notification],
      synchronize: process.env.NODE_ENV !== 'production', // Only in development
      logging: false, // Disable logging for production
      // Only use SSL for production (Render PostgreSQL)
      ...(process.env.NODE_ENV === 'production' ? {
        ssl: {
          rejectUnauthorized: false,
        },
      } : {}),
    })
    ] : []),
    LettersModule,
    AuthModule,
    RevoltsModule,
    RevNetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
