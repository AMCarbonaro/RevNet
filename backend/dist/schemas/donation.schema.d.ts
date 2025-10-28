import { Document } from 'mongoose';
export type DonationDocument = Donation & Document;
export declare class Donation {
    revoltId: string;
    amount: number;
    stripePaymentIntentId: string;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    donorName?: string;
    donorEmail?: string;
    message?: string;
    isAnonymous: boolean;
    processingFee: number;
    netAmount: number;
    stripeCustomerId?: string;
    metadata: {
        revoltName?: string;
        donorIp?: string;
        userAgent?: string;
    };
}
export declare const DonationSchema: import("mongoose").Schema<Donation, import("mongoose").Model<Donation, any, any, any, Document<unknown, any, Donation> & Donation & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Donation, Document<unknown, {}, import("mongoose").FlatRecord<Donation>> & import("mongoose").FlatRecord<Donation> & {
    _id: import("mongoose").Types.ObjectId;
}>;
