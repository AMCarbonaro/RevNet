import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChannelDocument = Channel & Document;

@Schema({ timestamps: true })
export class Channel {
  @Prop({ required: true })
  revoltId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: 'text' })
  type: 'text' | 'voice' | 'video' | 'stage';

  @Prop({ required: true, default: 0 })
  position: number;

  @Prop()
  category?: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  permissionOverrides: string[];

  @Prop({ required: true, default: 0 })
  messageCount: number;

  @Prop()
  lastMessageId?: string;

  @Prop()
  lastMessageAt?: Date;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
