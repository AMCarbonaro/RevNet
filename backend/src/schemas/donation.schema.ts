import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DonationDocument = Donation & Document;

@Schema({ timestamps: true })
export class Donation {
  @Prop({ required: true })
  revoltId: string;

  @Prop({ required: true })
  amount: number; // Amount in cents

  @Prop({ required: true })
  stripePaymentIntentId: string;

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';

  @Prop()
  donorName?: string;

  @Prop()
  donorEmail?: string;

  @Prop()
  message?: string;

  @Prop({ required: true, default: true })
  isAnonymous: boolean;

  @Prop({ required: true })
  processingFee: number; // Processing fee in cents

  @Prop({ required: true })
  netAmount: number; // Net amount after fees in cents

  @Prop()
  stripeCustomerId?: string;

  @Prop({ type: Object })
  metadata: {
    revoltName?: string;
    donorIp?: string;
    userAgent?: string;
  };
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
