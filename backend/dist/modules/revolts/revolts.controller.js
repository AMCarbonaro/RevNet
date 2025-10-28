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
exports.RevoltsController = void 0;
const common_1 = require("@nestjs/common");
const revolts_service_1 = require("./revolts.service");
let RevoltsController = class RevoltsController {
    revoltsService;
    constructor(revoltsService) {
        this.revoltsService = revoltsService;
    }
    async getFeaturedRevolts() {
        try {
            const revolts = await this.revoltsService.getFeaturedRevolts();
            return { data: revolts };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to fetch featured revolts', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPublicRevolts(category, search, sortBy, limit, offset) {
        try {
            const filters = {
                category,
                search,
                sortBy,
                limit: limit ? parseInt(limit, 10) : 20,
                offset: offset ? parseInt(offset, 10) : 0,
            };
            const result = await this.revoltsService.getPublicRevolts(filters);
            return {
                data: result.revolts,
                total: result.total,
                limit: filters.limit || 20,
                offset: filters.offset || 0,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to fetch public revolts', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRevoltById(id) {
        try {
            const revolt = await this.revoltsService.getRevoltById(id);
            if (!revolt) {
                throw new common_1.HttpException('Revolt not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { data: revolt };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to fetch revolt', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRevoltChannels(id) {
        try {
            const channels = await this.revoltsService.getRevoltChannels(id);
            return { data: channels };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to fetch revolt channels', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createRevolt(revoltData) {
        try {
            const revolt = await this.revoltsService.createRevolt(revoltData);
            return { data: revolt };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to create revolt', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateRevolt(id, updateData) {
        try {
            const revolt = await this.revoltsService.updateRevolt(id, updateData);
            if (!revolt) {
                throw new common_1.HttpException('Revolt not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { data: revolt };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to update revolt', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteRevolt(id) {
        try {
            const success = await this.revoltsService.deleteRevolt(id);
            if (!success) {
                throw new common_1.HttpException('Revolt not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { success: true };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to delete revolt', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RevoltsController = RevoltsController;
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RevoltsController.prototype, "getFeaturedRevolts", null);
__decorate([
    (0, common_1.Get)('public'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('sortBy')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RevoltsController.prototype, "getPublicRevolts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RevoltsController.prototype, "getRevoltById", null);
__decorate([
    (0, common_1.Get)(':id/channels'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RevoltsController.prototype, "getRevoltChannels", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RevoltsController.prototype, "createRevolt", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RevoltsController.prototype, "updateRevolt", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RevoltsController.prototype, "deleteRevolt", null);
exports.RevoltsController = RevoltsController = __decorate([
    (0, common_1.Controller)('api/revolts'),
    __metadata("design:paramtypes", [revolts_service_1.RevoltsService])
], RevoltsController);
//# sourceMappingURL=revolts.controller.js.map