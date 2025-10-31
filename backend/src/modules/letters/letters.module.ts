import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LettersController } from './letters.controller';
import { LettersService } from './letters.service';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LettersController],
  providers: [LettersService],
  exports: [LettersService],
})
export class LettersModule {}
