import { Module } from '@nestjs/common';
import { RevoltsController } from './revolts.controller';
import { RevoltsService } from './revolts.service';

@Module({
  controllers: [RevoltsController],
  providers: [RevoltsService],
})
export class RevoltsModule {}

