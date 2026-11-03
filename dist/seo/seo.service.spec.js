"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const seo_service_1 = require("./seo.service");
const mock_llm_provider_1 = require("./providers/mock-llm.provider");
const pii_sanitizer_1 = require("./safety/pii-sanitizer");
const accuracy_guard_1 = require("./safety/accuracy-guard");
const seo_draft_repository_1 = require("./repositories/seo-draft.repository");
describe('SeoService (Safety & Approval Workflow)', () => {
    let service;
    let mockLlm;
    let piiSanitizer;
    let accuracyGuard;
    let repo;
    beforeEach(() => {
        mockLlm = new mock_llm_provider_1.MockLlmProvider();
        piiSanitizer = new pii_sanitizer_1.PiiSanitizer();
        accuracyGuard = new accuracy_guard_1.AccuracyGuard();
        repo = new seo_draft_repository_1.SeoDraftRepository();
        service = new seo_service_1.SeoService(mockLlm, piiSanitizer, accuracyGuard, repo);
    });
    describe('1. Generation & Safe Default State', () => {
        it('should generate suggestions and enforce initial status as DRAFT', async () => {
            const draft = await service.generate({
                pageTitle: 'Space42 Arena – Summer Music Festival',
                pageDescription: 'A fictional music festival featuring live performances, food stalls and entertainment in Abu Dhabi.',
            });
            expect(draft).toBeDefined();
            expect(draft.id).toBeDefined();
            expect(draft.status).toBe('DRAFT');
            expect(draft.content.seoTitle).toContain('Space42');
            expect(draft.content.metaDescription.length).toBeLessThanOrEqual(160);
            expect(draft.content.faqs.length).toBeGreaterThanOrEqual(2);
            expect(draft.auditTrail.length).toBe(1);
            expect(draft.auditTrail[0].action).toBe('GENERATED');
        });
        it('should scrub PII from outbound prompt before sending to LLM', async () => {
            const draft = await service.generate({
                pageTitle: 'VIP Lounge Booking at Space42',
                pageDescription: 'Contact organizer at john.doe@vip-arena.ae or call +971-50-9876543 for bookings.',
            });
            expect(draft.safetyReport?.piiRedacted).toBe(true);
            expect(draft.safetyReport?.redactedItemsCount).toBeGreaterThanOrEqual(2);
        });
    });
    describe('2. Human-in-the-Loop Approval & Publishing Gate', () => {
        it('should BLOCK publishing when draft is still in DRAFT status', async () => {
            const draft = await service.generate({
                pageTitle: 'Space42 Arena – Summer Music Festival',
                pageDescription: 'A fictional music festival featuring live performances in Abu Dhabi.',
            });
            expect(draft.status).toBe('DRAFT');
            await expect(service.publishDraft(draft.id)).rejects.toThrow(common_1.BadRequestException);
            await expect(service.publishDraft(draft.id)).rejects.toThrow(/Safe AI policy requires explicit human approval/);
        });
        it('should allow publishing ONLY AFTER human admin approval', async () => {
            const draft = await service.generate({
                pageTitle: 'Space42 Arena – Summer Music Festival',
                pageDescription: 'A fictional music festival featuring live performances in Abu Dhabi.',
            });
            const approved = await service.approveDraft(draft.id, 'Senior Admin');
            expect(approved.status).toBe('APPROVED');
            const published = await service.publishDraft(draft.id, 'Senior Admin');
            expect(published.status).toBe('PUBLISHED');
            expect(published.publishedAt).toBeDefined();
            expect(published.auditTrail.some((a) => a.action === 'PUBLISHED')).toBe(true);
        });
        it('should REVERT status from APPROVED back to DRAFT if content is modified', async () => {
            const draft = await service.generate({
                pageTitle: 'Space42 Arena – Summer Music Festival',
                pageDescription: 'A fictional music festival featuring live performances in Abu Dhabi.',
            });
            await service.approveDraft(draft.id, 'Admin');
            const approved = await service.getDraft(draft.id);
            expect(approved.status).toBe('APPROVED');
            const updated = await service.updateDraft(draft.id, {
                seoTitle: 'Space42 Arena Summer Music Fest 2026 | Abu Dhabi Tickets',
                metaDescription: approved.content.metaDescription,
                faqs: approved.content.faqs,
            });
            expect(updated.status).toBe('DRAFT');
            await expect(service.publishDraft(draft.id)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('3. Accuracy & Hallucination Guard', () => {
        it('should flag unsupported medical guarantees or unverified pricing claims', () => {
            const fakeContent = {
                seoTitle: 'Event Title',
                metaDescription: 'Get 100% cure and free admission for all attendees.',
                faqs: [],
            };
            const result = accuracyGuard.checkAccuracy(fakeContent, 'Just an event description without those claims');
            expect(result.passed).toBe(false);
            expect(result.warnings.length).toBeGreaterThanOrEqual(1);
        });
    });
});
//# sourceMappingURL=seo.service.spec.js.map