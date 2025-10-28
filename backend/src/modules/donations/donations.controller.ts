import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import type { AnonymousDonationRequest } from './donations.service';
import { Donation } from '../../schemas/donation.schema';

@Controller('api/donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post('anonymous')
  async createAnonymousDonation(
    @Body() donationData: AnonymousDonationRequest,
  ): Promise<{ data: Donation; clientSecret: string }> {
    try {
      const result = await this.donationsService.createAnonymousDonation(
        donationData,
      );
      return {
        data: result.donation,
        clientSecret: result.clientSecret,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create anonymous donation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('confirm/:paymentIntentId')
  async confirmDonation(
    @Param('paymentIntentId') paymentIntentId: string,
  ): Promise<{ data: Donation }> {
    try {
      const donation = await this.donationsService.confirmDonation(
        paymentIntentId,
      );
      if (!donation) {
        throw new HttpException('Donation not found', HttpStatus.NOT_FOUND);
      }
      return { data: donation };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to confirm donation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('revolt/:revoltId')
  async getDonationsByRevolt(
    @Param('revoltId') revoltId: string,
  ): Promise<{ data: Donation[] }> {
    try {
      const donations = await this.donationsService.getDonationsByRevolt(
        revoltId,
      );
      return { data: donations };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch donations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/:revoltId')
  async getDonationStats(@Param('revoltId') revoltId: string) {
    try {
      const stats = await this.donationsService.getDonationStats(revoltId);
      return { data: stats };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch donation stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
