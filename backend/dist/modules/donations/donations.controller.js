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
exports.DonationsController = void 0;
const common_1 = require("@nestjs/common");
const donations_service_1 = require("./donations.service");
let DonationsController = class DonationsController {
    donationsService;
    constructor(donationsService) {
        this.donationsService = donationsService;
    }
    async createAnonymousDonation(donationData) {
        try {
            const result = await this.donationsService.createAnonymousDonation(donationData);
            return {
                data: result.donation,
                clientSecret: result.clientSecret,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to create anonymous donation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async confirmDonation(paymentIntentId) {
        try {
            const donation = await this.donationsService.confirmDonation(paymentIntentId);
            if (!donation) {
                throw new common_1.HttpException('Donation not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { data: donation };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to confirm donation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDonationsByRevolt(revoltId) {
        try {
            const donations = await this.donationsService.getDonationsByRevolt(revoltId);
            return { data: donations };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to fetch donations', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDonationStats(revoltId) {
        try {
            const stats = await this.donationsService.getDonationStats(revoltId);
            return { data: stats };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to fetch donation stats', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.DonationsController = DonationsController;
__decorate([
    (0, common_1.Post)('anonymous'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "createAnonymousDonation", null);
__decorate([
    (0, common_1.Post)('confirm/:paymentIntentId'),
    __param(0, (0, common_1.Param)('paymentIntentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "confirmDonation", null);
__decorate([
    (0, common_1.Get)('revolt/:revoltId'),
    __param(0, (0, common_1.Param)('revoltId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationsByRevolt", null);
__decorate([
    (0, common_1.Get)('stats/:revoltId'),
    __param(0, (0, common_1.Param)('revoltId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationsController.prototype, "getDonationStats", null);
exports.DonationsController = DonationsController = __decorate([
    (0, common_1.Controller)('api/donations'),
    __metadata("design:paramtypes", [donations_service_1.DonationsService])
], DonationsController);
//# sourceMappingURL=donations.controller.js.map