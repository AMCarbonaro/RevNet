"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_controller_1 = require("./platform.controller");
const platform_service_1 = require("./platform.service");
const revolt_schema_1 = require("../../schemas/revolt.schema");
const donation_schema_1 = require("../../schemas/donation.schema");
let PlatformModule = class PlatformModule {
};
exports.PlatformModule = PlatformModule;
exports.PlatformModule = PlatformModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: revolt_schema_1.Revolt.name, schema: revolt_schema_1.RevoltSchema },
                { name: donation_schema_1.Donation.name, schema: donation_schema_1.DonationSchema },
            ]),
        ],
        controllers: [platform_controller_1.PlatformController],
        providers: [platform_service_1.PlatformService],
        exports: [platform_service_1.PlatformService],
    })
], PlatformModule);
//# sourceMappingURL=platform.module.js.map