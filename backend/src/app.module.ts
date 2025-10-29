import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestEntity } from './entities/test.entity';
import { LettersModule } from './modules/letters/letters.module';

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
        entities: [TestEntity],
        synchronize: process.env.NODE_ENV !== 'production', // Only in development
        logging: false, // Disable logging for production
        ssl: {
          rejectUnauthorized: false, // Required for Render PostgreSQL
        },
      })
    ] : []),
    LettersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
