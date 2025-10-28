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
exports.RevoltsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const revolt_schema_1 = require("../../schemas/revolt.schema");
const channel_schema_1 = require("../../schemas/channel.schema");
let RevoltsService = class RevoltsService {
    revoltModel;
    channelModel;
    constructor(revoltModel, channelModel) {
        this.revoltModel = revoltModel;
        this.channelModel = channelModel;
    }
    async getFeaturedRevolts() {
        return this.revoltModel
            .find({ isFeatured: true, isPublic: true })
            .sort({ memberCount: -1 })
            .limit(6)
            .exec();
    }
    async getPublicRevolts(filters = {}) {
        const { category, search, sortBy = 'popular', limit = 20, offset = 0, } = filters;
        const query = { isPublic: true };
        if (category) {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }
        let sort = {};
        switch (sortBy) {
            case 'popular':
                sort = { memberCount: -1 };
                break;
            case 'recent':
                sort = { createdAt: -1 };
                break;
            case 'active':
                sort = { messageCount: -1 };
                break;
            case 'funding':
                sort = { currentFunding: -1 };
                break;
        }
        const [revolts, total] = await Promise.all([
            this.revoltModel
                .find(query)
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .exec(),
            this.revoltModel.countDocuments(query),
        ]);
        return { revolts, total };
    }
    async getRevoltById(id) {
        return this.revoltModel.findById(id).exec();
    }
    async getRevoltChannels(revoltId) {
        return this.channelModel
            .find({ revoltId, isActive: true })
            .sort({ position: 1 })
            .exec();
    }
    async createRevolt(revoltData) {
        const revolt = new this.revoltModel(revoltData);
        return revolt.save();
    }
    async updateRevolt(id, updateData) {
        return this.revoltModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
    }
    async deleteRevolt(id) {
        const result = await this.revoltModel.findByIdAndDelete(id).exec();
        return !!result;
    }
};
exports.RevoltsService = RevoltsService;
exports.RevoltsService = RevoltsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(revolt_schema_1.Revolt.name)),
    __param(1, (0, mongoose_1.InjectModel)(channel_schema_1.Channel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RevoltsService);
//# sourceMappingURL=revolts.service.js.map