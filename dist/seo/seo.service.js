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
var SeoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const mock_llm_provider_1 = require("./providers/mock-llm.provider");
const pii_sanitizer_1 = require("./safety/pii-sanitizer");
const accuracy_guard_1 = require("./safety/accuracy-guard");
const seo_draft_repository_1 = require("./repositories/seo-draft.repository");
let SeoService = SeoService_1 = class SeoService {
    constructor(mockLlmProvider, piiSanitizer, accuracyGuard, repository) {
        this.mockLlmProvider = mockLlmProvider;
        this.piiSanitizer = piiSanitizer;
        this.accuracyGuard = accuracyGuard;
        this.repository = repository;
        this.logger = new common_1.Logger(SeoService_1.name);
    }
    async generate(dto, actor = 'Space42 Admin') {
        this.logger.log(`Initiating SEO generation for: "${dto.pageTitle}" by ${actor}`);
        const titleSanitized = this.piiSanitizer.sanitize(dto.pageTitle);
        const descSanitized = this.piiSanitizer.sanitize(dto.pageDescription);
        const totalRedactions = titleSanitized.redactedCount + descSanitized.redactedCount;
        const generated = await this.mockLlmProvider.generateSeo({
            pageTitle: titleSanitized.sanitizedText,
            sanitizedDescription: descSanitized.sanitizedText,
        });
        const combinedSource = `${dto.pageTitle} ${dto.pageDescription}`;
        const accuracyResult = this.accuracyGuard.checkAccuracy(generated, combinedSource);
        const initialAudit = {
            id: `audit_${Date.now()}_1`,
            timestamp: new Date().toISOString(),
            action: 'GENERATED',
            actor,
            notes: `AI generated initial SEO suggestions. PII redactions: ${totalRedactions}. Status initialized to DRAFT.`,
        };
        const draftId = `seo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        const newDraft = {
            id: draftId,
            pageTitle: dto.pageTitle,
            pageDescription: dto.pageDescription,
            status: 'DRAFT',
            content: generated,
            safetyReport: {
                piiRedacted: totalRedactions > 0,
                redactedItemsCount: totalRedactions,
                accuracyPassed: accuracyResult.passed,
                warnings: accuracyResult.warnings,
            },
            auditTrail: [initialAudit],
            createdAt: now,
            updatedAt: now,
        };
        return this.repository.create(newDraft);
    }
    async updateDraft(id, dto, actor = 'Space42 Admin') {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`SEO draft with ID "${id}" was not found.`);
        }
        if (existing.status === 'PUBLISHED') {
            throw new common_1.BadRequestException('Cannot edit a PUBLISHED draft directly. Duplicate or create a new draft to revise.');
        }
        const previousStatus = existing.status;
        let newStatus = existing.status;
        let auditNote = dto.editNotes || 'Admin updated SEO content.';
        if (previousStatus === 'APPROVED') {
            newStatus = 'DRAFT';
            auditNote += ' Reverted status from APPROVED to DRAFT because content was modified.';
        }
        const updatedContent = {
            seoTitle: dto.seoTitle,
            metaDescription: dto.metaDescription,
            faqs: dto.faqs,
        };
        const combinedSource = `${existing.pageTitle} ${existing.pageDescription}`;
        const accuracyResult = this.accuracyGuard.checkAccuracy(updatedContent, combinedSource);
        const auditEntry = {
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'EDITED',
            actor,
            notes: auditNote,
        };
        const updated = await this.repository.update(id, {
            content: updatedContent,
            status: newStatus,
            safetyReport: {
                piiRedacted: existing.safetyReport?.piiRedacted ?? false,
                redactedItemsCount: existing.safetyReport?.redactedItemsCount ?? 0,
                accuracyPassed: accuracyResult.passed,
                warnings: accuracyResult.warnings,
            },
            auditTrail: [...existing.auditTrail, auditEntry],
        });
        return updated;
    }
    async approveDraft(id, actor = 'Space42 Admin') {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`SEO draft with ID "${id}" was not found.`);
        }
        if (existing.status === 'PUBLISHED') {
            throw new common_1.BadRequestException('Content is already published.');
        }
        if (existing.status === 'APPROVED') {
            return existing;
        }
        const auditEntry = {
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'APPROVED',
            actor,
            notes: 'Admin reviewed and approved SEO content for publishing.',
        };
        const updated = await this.repository.update(id, {
            status: 'APPROVED',
            auditTrail: [...existing.auditTrail, auditEntry],
        });
        return updated;
    }
    async publishDraft(id, actor = 'Space42 Admin') {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`SEO draft with ID "${id}" was not found.`);
        }
        if (existing.status === 'DRAFT') {
            throw new common_1.BadRequestException('Publication Blocked: Content is currently in DRAFT status. ' +
                'Safe AI policy requires explicit human approval (APPROVED status) before publishing.');
        }
        if (existing.status === 'PUBLISHED') {
            return existing;
        }
        const now = new Date().toISOString();
        const auditEntry = {
            id: `audit_${Date.now()}`,
            timestamp: now,
            action: 'PUBLISHED',
            actor,
            notes: 'Content officially published to Space42 Arena production event page.',
        };
        const updated = await this.repository.update(id, {
            status: 'PUBLISHED',
            publishedAt: now,
            auditTrail: [...existing.auditTrail, auditEntry],
        });
        return updated;
    }
    async regenerateDraft(id, actor = 'Space42 Admin') {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`SEO draft with ID "${id}" was not found.`);
        }
        if (existing.status === 'PUBLISHED') {
            throw new common_1.BadRequestException('Cannot regenerate a PUBLISHED draft directly.');
        }
        const titleSanitized = this.piiSanitizer.sanitize(existing.pageTitle);
        const descSanitized = this.piiSanitizer.sanitize(existing.pageDescription);
        const generated = await this.mockLlmProvider.generateSeo({
            pageTitle: titleSanitized.sanitizedText,
            sanitizedDescription: descSanitized.sanitizedText,
        });
        const combinedSource = `${existing.pageTitle} ${existing.pageDescription}`;
        const accuracyResult = this.accuracyGuard.checkAccuracy(generated, combinedSource);
        const auditEntry = {
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'REGENERATED',
            actor,
            notes: 'Admin triggered regeneration. Suggestions refreshed and status reset to DRAFT.',
        };
        const updated = await this.repository.update(id, {
            content: generated,
            status: 'DRAFT',
            safetyReport: {
                piiRedacted: titleSanitized.redactedCount + descSanitized.redactedCount > 0,
                redactedItemsCount: titleSanitized.redactedCount + descSanitized.redactedCount,
                accuracyPassed: accuracyResult.passed,
                warnings: accuracyResult.warnings,
            },
            auditTrail: [...existing.auditTrail, auditEntry],
        });
        return updated;
    }
    async getDraft(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`SEO draft with ID "${id}" was not found.`);
        }
        return item;
    }
    async getAllDrafts() {
        return this.repository.findAll();
    }
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = SeoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_llm_provider_1.MockLlmProvider,
        pii_sanitizer_1.PiiSanitizer,
        accuracy_guard_1.AccuracyGuard,
        seo_draft_repository_1.SeoDraftRepository])
], SeoService);
//# sourceMappingURL=seo.service.js.map