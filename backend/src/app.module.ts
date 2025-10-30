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
    // Configure TypeORM using DATABASE_URL (Render) or common fallbacks
    ...((() => {
      const databaseUrl = process.env.DATABASE_URL
        || process.env.POSTGRES_URL
        || process.env.POSTGRESQL_URL
        || process.env.DATABASE_CONNECTION_STRING;

      if (!databaseUrl) {
        return [] as any[];
      }

      const sslOption = process.env.NODE_ENV === 'production'
        ? { ssl: { rejectUnauthorized: false } }
        : {};

      // Safe introspection of the DB host for diagnostics without leaking credentials
      try {
        const { host } = new URL(databaseUrl);
        const sslEnabled = !!(process.env.NODE_ENV === 'production');
        console.log(`[DB] Connecting to host: ${host} (ssl=${sslEnabled ? 'on' : 'off'})`);
        if (process.env.NODE_ENV === 'production' && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
          console.error('[DB] Refusing to connect to localhost in production. Ensure DATABASE_URL is set to your Render Postgres connection string.');
        }
      } catch (_) {
        // ignore URL parse errors
      }

      return [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: databaseUrl,
          entities: [TestEntity, User, Server, Channel, Message, Notification],
          synchronize: process.env.NODE_ENV !== 'production',
          logging: false,
          ...sslOption,
        }),
      ];
    })()),
    LettersModule,
    AuthModule,
    RevoltsModule,
    RevNetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
