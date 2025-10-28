import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Donation, DonationDocument } from '../../schemas/donation.schema';
import { Revolt, RevoltDocument } from '../../schemas/revolt.schema';

export interface AnonymousDonationRequest {
  revoltId: string;
  amount: number; // Amount in cents
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous: boolean;
}

@Injectable()
export class DonationsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
    @InjectModel(Revolt.name) private revoltModel: Model<RevoltDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createAnonymousDonation(
    donationData: AnonymousDonationRequest,
  ): Promise<{ donation: Donation; clientSecret: string }> {
    try {
      // Verify revolt exists and accepts donations
      const revolt = await this.revoltModel.findById(donationData.revoltId);
      if (!revolt) {
        throw new HttpException('Revolt not found', HttpStatus.NOT_FOUND);
      }

      if (!revolt.acceptDonations) {
        throw new HttpException(
          'This revolt does not accept donations',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate processing fee (2.9% + $0.30)
      const processingFee = Math.round(donationData.amount * 0.029 + 30);
      const netAmount = donationData.amount - processingFee;

      // Create Stripe Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: donationData.amount,
        currency: 'usd',
        metadata: {
          revoltId: donationData.revoltId,
          revoltName: revolt.name,
          isAnonymous: donationData.isAnonymous.toString(),
          donorName: donationData.donorName || '',
          donorEmail: donationData.donorEmail || '',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create donation record
      const donation = new this.donationModel({
        revoltId: donationData.revoltId,
        amount: donationData.amount,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        donorName: donationData.donorName,
        donorEmail: donationData.donorEmail,
        message: donationData.message,
        isAnonymous: donationData.isAnonymous,
        processingFee,
        netAmount,
        metadata: {
          revoltName: revolt.name,
        },
      });

      await donation.save();

      return {
        donation,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create donation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async confirmDonation(paymentIntentId: string): Promise<Donation | null> {
    try {
      // Verify payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new HttpException(
          'Payment not successful',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update donation status
      const donation = await this.donationModel.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: 'succeeded' },
        { new: true },
      );

      if (donation) {
        // Update revolt funding
        await this.revoltModel.findByIdAndUpdate(
          donation.revoltId,
          { $inc: { currentFunding: donation.netAmount } },
        );
      }

      return donation;
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

  async getDonationsByRevolt(revoltId: string): Promise<Donation[]> {
    return this.donationModel
      .find({ revoltId, status: 'succeeded' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getDonationStats(revoltId: string): Promise<{
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
  }> {
    const stats = await this.donationModel.aggregate([
      { $match: { revoltId, status: 'succeeded' } },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
          averageDonation: { $avg: '$netAmount' },
        },
      },
    ]);

    return stats[0] || {
      totalDonations: 0,
      totalAmount: 0,
      averageDonation: 0,
    };
  }
}
