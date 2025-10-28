import { Document } from 'mongoose';
export type RevoltDocument = Revolt & Document;
export declare class Revolt {
    name: string;
    description: string;
    shortDescription: string;
    icon?: string;
    banner?: string;
    category: string;
    tags: string[];
    isPublic: boolean;
    isFull: boolean;
    memberCount: number;
    channelCount: number;
    messageCount: number;
    acceptDonations: boolean;
    currentFunding: number;
    fundingGoal?: number;
    isFeatured: boolean;
    settings: {
        allowInvites: boolean;
        requireApproval: boolean;
        maxMembers?: number;
    };
    channelIds: string[];
    memberIds: string[];
    ownerId: string;
}
export declare const RevoltSchema: import("mongoose").Schema<Revolt, import("mongoose").Model<Revolt, any, any, any, Document<unknown, any, Revolt> & Revolt & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Revolt, Document<unknown, {}, import("mongoose").FlatRecord<Revolt>> & import("mongoose").FlatRecord<Revolt> & {
    _id: import("mongoose").Types.ObjectId;
}>;
