"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevoltsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const revolts_controller_1 = require("./revolts.controller");
const revolts_service_1 = require("./revolts.service");
const revolt_schema_1 = require("../../schemas/revolt.schema");
const channel_schema_1 = require("../../schemas/channel.schema");
let RevoltsModule = class RevoltsModule {
};
exports.RevoltsModule = RevoltsModule;
exports.RevoltsModule = RevoltsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: revolt_schema_1.Revolt.name, schema: revolt_schema_1.RevoltSchema },
                { name: channel_schema_1.Channel.name, schema: channel_schema_1.ChannelSchema },
            ]),
        ],
        controllers: [revolts_controller_1.RevoltsController],
        providers: [revolts_service_1.RevoltsService],
        exports: [revolts_service_1.RevoltsService],
    })
], RevoltsModule);
//# sourceMappingURL=revolts.module.js.map