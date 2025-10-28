import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RevoltsController } from './revolts.controller';
import { RevoltsService } from './revolts.service';
import { Revolt, RevoltSchema } from '../../schemas/revolt.schema';
import { Channel, ChannelSchema } from '../../schemas/channel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Revolt.name, schema: RevoltSchema },
      { name: Channel.name, schema: ChannelSchema },
    ]),
  ],
  controllers: [RevoltsController],
  providers: [RevoltsService],
  exports: [RevoltsService],
})
export class RevoltsModule {}
