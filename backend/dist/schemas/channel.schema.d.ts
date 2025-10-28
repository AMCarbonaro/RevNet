import { Document } from 'mongoose';
export type ChannelDocument = Channel & Document;
export declare class Channel {
    revoltId: string;
    name: string;
    description?: string;
    type: 'text' | 'voice' | 'video' | 'stage';
    position: number;
    category?: string;
    isActive: boolean;
    permissionOverrides: string[];
    messageCount: number;
    lastMessageId?: string;
    lastMessageAt?: Date;
}
export declare const ChannelSchema: import("mongoose").Schema<Channel, import("mongoose").Model<Channel, any, any, any, Document<unknown, any, Channel> & Channel & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Channel, Document<unknown, {}, import("mongoose").FlatRecord<Channel>> & import("mongoose").FlatRecord<Channel> & {
    _id: import("mongoose").Types.ObjectId;
}>;
