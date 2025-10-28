import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RevoltsModule } from './modules/revolts/revolts.module';
import { DonationsModule } from './modules/donations/donations.module';
import { PlatformModule } from './modules/platform/platform.module';
import { TestEntity } from './entities/test.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.MONGODB_URI || process.env.DATABASE_URL, // Using MONGODB_URI for compatibility
      entities: [TestEntity],
      synchronize: process.env.NODE_ENV !== 'production', // Only in development
      logging: false, // Disable logging for production
    }),
    RevoltsModule,
    DonationsModule,
    PlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
