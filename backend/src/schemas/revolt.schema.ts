import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RevoltDocument = Revolt & Document;

@Schema({ timestamps: true })
export class Revolt {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  shortDescription: string;

  @Prop()
  icon?: string;

  @Prop()
  banner?: string;

  @Prop({ required: true, default: 'activism' })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, default: true })
  isPublic: boolean;

  @Prop({ required: true, default: false })
  isFull: boolean;

  @Prop({ required: true, default: 0 })
  memberCount: number;

  @Prop({ required: true, default: 0 })
  channelCount: number;

  @Prop({ required: true, default: 0 })
  messageCount: number;

  @Prop({ required: true, default: false })
  acceptDonations: boolean;

  @Prop({ required: true, default: 0 })
  currentFunding: number;

  @Prop()
  fundingGoal?: number;

  @Prop({ required: true, default: false })
  isFeatured: boolean;

  @Prop({ type: Object })
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    maxMembers?: number;
  };

  @Prop({ type: [String], default: [] })
  channelIds: string[];

  @Prop({ type: [String], default: [] })
  memberIds: string[];

  @Prop({ required: true })
  ownerId: string;
}

export const RevoltSchema = SchemaFactory.createForClass(Revolt);
