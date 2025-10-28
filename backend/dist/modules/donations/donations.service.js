"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const stripe_1 = __importDefault(require("stripe"));
const donation_schema_1 = require("../../schemas/donation.schema");
const revolt_schema_1 = require("../../schemas/revolt.schema");
let DonationsService = class DonationsService {
    donationModel;
    revoltModel;
    stripe;
    constructor(donationModel, revoltModel) {
        this.donationModel = donationModel;
        this.revoltModel = revoltModel;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2023-10-16',
        });
    }
    async createAnonymousDonation(donationData) {
        try {
            const revolt = await this.revoltModel.findById(donationData.revoltId);
            if (!revolt) {
                throw new common_1.HttpException('Revolt not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!revolt.acceptDonations) {
                throw new common_1.HttpException('This revolt does not accept donations', common_1.HttpStatus.BAD_REQUEST);
            }
            const processingFee = Math.round(donationData.amount * 0.029 + 30);
            const netAmount = donationData.amount - processingFee;
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
                clientSecret: paymentIntent.client_secret,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to create donation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async confirmDonation(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                throw new common_1.HttpException('Payment not successful', common_1.HttpStatus.BAD_REQUEST);
            }
            const donation = await this.donationModel.findOneAndUpdate({ stripePaymentIntentId: paymentIntentId }, { status: 'succeeded' }, { new: true });
            if (donation) {
                await this.revoltModel.findByIdAndUpdate(donation.revoltId, { $inc: { currentFunding: donation.netAmount } });
            }
            return donation;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to confirm donation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDonationsByRevolt(revoltId) {
        return this.donationModel
            .find({ revoltId, status: 'succeeded' })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getDonationStats(revoltId) {
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
};
exports.DonationsService = DonationsService;
exports.DonationsService = DonationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(1, (0, mongoose_1.InjectModel)(revolt_schema_1.Revolt.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DonationsService);
//# sourceMappingURL=donations.service.js.map