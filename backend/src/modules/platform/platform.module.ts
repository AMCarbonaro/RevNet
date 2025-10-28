import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { Revolt, RevoltSchema } from '../../schemas/revolt.schema';
import { Donation, DonationSchema } from '../../schemas/donation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Revolt.name, schema: RevoltSchema },
      { name: Donation.name, schema: DonationSchema },
    ]),
  ],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
