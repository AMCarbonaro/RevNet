import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestEntity } from './entities/test.entity';
import { LettersModule } from './modules/letters/letters.module';
import { AuthModule } from './modules/auth/auth.module';
import { RevoltsModule } from './modules/revolts/revolts.module';

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
    AuthModule,
    RevoltsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
