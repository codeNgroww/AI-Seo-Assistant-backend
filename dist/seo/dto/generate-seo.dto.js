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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSeoDto = void 0;
const class_validator_1 = require("class-validator");
class GenerateSeoDto {
}
exports.GenerateSeoDto = GenerateSeoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Page title is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Page title must be at least 3 characters' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Page title cannot exceed 200 characters' }),
    __metadata("design:type", String)
], GenerateSeoDto.prototype, "pageTitle", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Page description is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Page description must be at least 10 characters' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Page description cannot exceed 1000 characters' }),
    __metadata("design:type", String)
], GenerateSeoDto.prototype, "pageDescription", void 0);
//# sourceMappingURL=generate-seo.dto.js.map