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
exports.UpdateDraftDto = exports.FaqItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FaqItemDto {
}
exports.FaqItemDto = FaqItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FaqItemDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Question cannot be empty' }),
    __metadata("design:type", String)
], FaqItemDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Answer cannot be empty' }),
    __metadata("design:type", String)
], FaqItemDto.prototype, "answer", void 0);
class UpdateDraftDto {
}
exports.UpdateDraftDto = UpdateDraftDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'SEO Title is required' }),
    (0, class_validator_1.MaxLength)(100, { message: 'SEO Title exceeds system limit' }),
    __metadata("design:type", String)
], UpdateDraftDto.prototype, "seoTitle", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Meta Description is required' }),
    (0, class_validator_1.MaxLength)(300, { message: 'Meta Description exceeds system limit' }),
    __metadata("design:type", String)
], UpdateDraftDto.prototype, "metaDescription", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FaqItemDto),
    __metadata("design:type", Array)
], UpdateDraftDto.prototype, "faqs", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDraftDto.prototype, "editNotes", void 0);
//# sourceMappingURL=update-draft.dto.js.map