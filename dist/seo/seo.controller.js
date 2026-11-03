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
exports.SeoController = void 0;
const common_1 = require("@nestjs/common");
const seo_service_1 = require("./seo.service");
const generate_seo_dto_1 = require("./dto/generate-seo.dto");
const update_draft_dto_1 = require("./dto/update-draft.dto");
const admin_guard_1 = require("./guards/admin.guard");
let SeoController = class SeoController {
    constructor(seoService) {
        this.seoService = seoService;
    }
    getHealth() {
        return {
            status: 'ok',
            service: 'Safe AI SEO Helper API',
            version: '1.0.0',
            activeProvider: 'mock-llm-provider-v1',
            safetyModules: {
                piiSanitizer: 'ENABLED',
                accuracyGuard: 'ENABLED',
                humanInTheLoopApproval: 'ENFORCED',
            },
        };
    }
    async generate(dto, req) {
        const actor = req.user?.name || 'Space42 Admin';
        return this.seoService.generate(dto, actor);
    }
    async getAllDrafts() {
        return this.seoService.getAllDrafts();
    }
    async getDraft(id) {
        return this.seoService.getDraft(id);
    }
    async updateDraft(id, dto, req) {
        const actor = req.user?.name || 'Space42 Admin';
        return this.seoService.updateDraft(id, dto, actor);
    }
    async approveDraft(id, req) {
        const actor = req.user?.name || 'Space42 Admin';
        return this.seoService.approveDraft(id, actor);
    }
    async publishDraft(id, req) {
        const actor = req.user?.name || 'Space42 Admin';
        return this.seoService.publishDraft(id, actor);
    }
    async regenerateDraft(id, req) {
        const actor = req.user?.name || 'Space42 Admin';
        return this.seoService.regenerateDraft(id, actor);
    }
};
exports.SeoController = SeoController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_seo_dto_1.GenerateSeoDto, Object]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('drafts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "getAllDrafts", null);
__decorate([
    (0, common_1.Get)('draft/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "getDraft", null);
__decorate([
    (0, common_1.Put)('draft/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_draft_dto_1.UpdateDraftDto, Object]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "updateDraft", null);
__decorate([
    (0, common_1.Post)('draft/:id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "approveDraft", null);
__decorate([
    (0, common_1.Post)('draft/:id/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "publishDraft", null);
__decorate([
    (0, common_1.Post)('draft/:id/regenerate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "regenerateDraft", null);
exports.SeoController = SeoController = __decorate([
    (0, common_1.Controller)('api/seo'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [seo_service_1.SeoService])
], SeoController);
//# sourceMappingURL=seo.controller.js.map