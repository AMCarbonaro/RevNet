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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const revolt_schema_1 = require("../../schemas/revolt.schema");
const donation_schema_1 = require("../../schemas/donation.schema");
let PlatformService = class PlatformService {
    revoltModel;
    donationModel;
    constructor(revoltModel, donationModel) {
        this.revoltModel = revoltModel;
        this.donationModel = donationModel;
    }
    async getPlatformStats() {
        try {
            const [totalRevolts, totalMembers, totalRaised, activeRevolts, donationStats,] = await Promise.all([
                this.revoltModel.countDocuments({ isPublic: true }),
                this.revoltModel.aggregate([
                    { $match: { isPublic: true } },
                    { $group: { _id: null, total: { $sum: '$memberCount' } } },
                ]),
                this.donationModel.aggregate([
                    { $match: { status: 'succeeded' } },
                    { $group: { _id: null, total: { $sum: '$netAmount' } } },
                ]),
                this.revoltModel.countDocuments({
                    isPublic: true,
                    memberCount: { $gt: 0 },
                }),
                this.donationModel.aggregate([
                    { $match: { status: 'succeeded' } },
                    {
                        $group: {
                            _id: null,
                            totalDonations: { $sum: 1 },
                            averageDonation: { $avg: '$netAmount' },
                        },
                    },
                ]),
            ]);
            return {
                totalRevolts,
                totalMembers: totalMembers[0]?.total || 0,
                totalRaised: totalRaised[0]?.total || 0,
                activeRevolts,
                totalDonations: donationStats[0]?.totalDonations || 0,
                averageDonation: donationStats[0]?.averageDonation || 0,
            };
        }
        catch (error) {
            console.error('Error fetching platform stats:', error);
            return {
                totalRevolts: 0,
                totalMembers: 0,
                totalRaised: 0,
                activeRevolts: 0,
                totalDonations: 0,
                averageDonation: 0,
            };
        }
    }
    async getCategoryStats() {
        try {
            const stats = await this.revoltModel.aggregate([
                { $match: { isPublic: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $project: { category: '$_id', count: 1, _id: 0 } },
            ]);
            return stats;
        }
        catch (error) {
            console.error('Error fetching category stats:', error);
            return [];
        }
    }
    async getRecentActivity(limit = 10) {
        try {
            const recentRevolts = await this.revoltModel
                .find({ isPublic: true })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('name description category memberCount createdAt')
                .exec();
            return recentRevolts.map((revolt) => ({
                type: 'revolt_created',
                revoltId: revolt._id,
                revoltName: revolt.name,
                description: revolt.description,
                category: revolt.category,
                memberCount: revolt.memberCount,
                createdAt: revolt.createdAt || new Date(),
            }));
        }
        catch (error) {
            console.error('Error fetching recent activity:', error);
            return [];
        }
    }
};
exports.PlatformService = PlatformService;
exports.PlatformService = PlatformService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(revolt_schema_1.Revolt.name)),
    __param(1, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PlatformService);
//# sourceMappingURL=platform.service.js.map