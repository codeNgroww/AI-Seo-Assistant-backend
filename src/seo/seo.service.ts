import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { SeoDraft, PublicationStatus, AuditLogEntry, SeoContent } from './dto/seo-response.dto';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { PiiSanitizer } from './safety/pii-sanitizer';
import { AccuracyGuard } from './safety/accuracy-guard';
import { SeoDraftRepository } from './repositories/seo-draft.repository';

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(
    private readonly mockLlmProvider: MockLlmProvider,
    private readonly piiSanitizer: PiiSanitizer,
    private readonly accuracyGuard: AccuracyGuard,
    private readonly repository: SeoDraftRepository,
  ) {}

  /**
   * Generates AI SEO suggestions and initializes a new draft in DRAFT status.
   * Throws an error message if confidential customer data (phone, email, cards, tokens) is present.
   */
  async generate(dto: GenerateSeoDto, actor = 'Space42 Admin'): Promise<SeoDraft> {
    this.logger.log(`Initiating SEO generation for: "${dto.pageTitle}" by ${actor}`);

    const combinedSource = `${dto.pageTitle} ${dto.pageDescription}`;

    // 1. PII & Confidential Data Guard: Check for phone numbers, emails, cards, IDs
    const piiDetection = this.piiSanitizer.detect(combinedSource);
    if (piiDetection.hasPii && !dto.allowRedact) {
      throw new BadRequestException(
        `Security Policy Alert: Input contains protected confidential customer data (${piiDetection.details.join('; ')}). ` +
        `Phone numbers, emails, and card tokens are protected and cannot be sent to the AI engine. Please remove them before proceeding.`
      );
    }

    // 2. Outbound Sanitization (if allowed or as defense-in-depth)
    const titleSanitized = this.piiSanitizer.sanitize(dto.pageTitle);
    const descSanitized = this.piiSanitizer.sanitize(dto.pageDescription);
    const totalRedactions = titleSanitized.redactedCount + descSanitized.redactedCount;

    // 3. Invoke LLM Provider
    const generated: SeoContent = await this.mockLlmProvider.generateSeo({
      pageTitle: titleSanitized.sanitizedText,
      sanitizedDescription: descSanitized.sanitizedText,
    });

    // 4. Post-generation Accuracy & Hallucination verification
    const accuracyResult = this.accuracyGuard.checkAccuracy(generated, combinedSource);

    // 5. Construct Audit Trail
    const initialAudit: AuditLogEntry = {
      id: `audit_${Date.now()}_1`,
      timestamp: new Date().toISOString(),
      action: 'GENERATED',
      actor,
      notes: `AI generated initial SEO suggestions. PII redactions: ${totalRedactions}. Status initialized to DRAFT.`,
    };

    // 6. Create Draft with strict DRAFT status
    const draftId = `seo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newDraft: SeoDraft = {
      id: draftId,
      pageTitle: dto.pageTitle,
      pageDescription: dto.pageDescription,
      status: 'DRAFT', // Rule: Must remain in DRAFT status initially
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

  /**
   * Allows an admin to edit suggested title, meta description, and FAQs.
   * If the draft was previously APPROVED, editing resets it back to DRAFT!
   */
  async updateDraft(id: string, dto: UpdateDraftDto, actor = 'Space42 Admin'): Promise<SeoDraft> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`SEO draft with ID "${id}" was not found.`);
    }

    if (existing.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot edit a PUBLISHED draft directly. Duplicate or create a new draft to revise.');
    }

    const previousStatus = existing.status;
    let newStatus: PublicationStatus = existing.status;
    let auditNote = dto.editNotes || 'Admin updated SEO content.';

    // Rule: Modifying approved content invalidates the approval
    if (previousStatus === 'APPROVED') {
      newStatus = 'DRAFT';
      auditNote += ' Reverted status from APPROVED to DRAFT because content was modified.';
    }

    // Re-verify accuracy against source page info
    const updatedContent: SeoContent = {
      seoTitle: dto.seoTitle,
      metaDescription: dto.metaDescription,
      faqs: dto.faqs,
    };
    const combinedSource = `${existing.pageTitle} ${existing.pageDescription}`;
    const accuracyResult = this.accuracyGuard.checkAccuracy(updatedContent, combinedSource);

    const auditEntry: AuditLogEntry = {
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

    return updated!;
  }

  /**
   * Human approval gate: transitions DRAFT -> APPROVED.
   */
  async approveDraft(id: string, actor = 'Space42 Admin'): Promise<SeoDraft> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`SEO draft with ID "${id}" was not found.`);
    }

    if (existing.status === 'PUBLISHED') {
      throw new BadRequestException('Content is already published.');
    }

    if (existing.status === 'APPROVED') {
      return existing; // already approved
    }

    const auditEntry: AuditLogEntry = {
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

    return updated!;
  }

  /**
   * Publishes content to production.
   * STRICT SAFETY GATE: Content MUST be APPROVED prior to publishing.
   */
  async publishDraft(id: string, actor = 'Space42 Admin'): Promise<SeoDraft> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`SEO draft with ID "${id}" was not found.`);
    }

    if (existing.status === 'DRAFT') {
      throw new BadRequestException(
        'Publication Blocked: Content is currently in DRAFT status. ' +
        'Safe AI policy requires explicit human approval (APPROVED status) before publishing.'
      );
    }

    if (existing.status === 'PUBLISHED') {
      return existing; // already published
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLogEntry = {
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

    return updated!;
  }

  /**
   * Regenerates SEO suggestions for an existing draft, resetting status to DRAFT.
   */
  async regenerateDraft(id: string, actor = 'Space42 Admin'): Promise<SeoDraft> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`SEO draft with ID "${id}" was not found.`);
    }

    if (existing.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot regenerate a PUBLISHED draft directly.');
    }

    const combinedSource = `${existing.pageTitle} ${existing.pageDescription}`;
    const piiDetection = this.piiSanitizer.detect(combinedSource);
    if (piiDetection.hasPii) {
      throw new BadRequestException(
        `Security Policy Alert: Input contains protected confidential customer data (${piiDetection.details.join('; ')}). ` +
        `Phone numbers, emails, and card tokens are protected and cannot be sent to the AI engine.`
      );
    }

    const titleSanitized = this.piiSanitizer.sanitize(existing.pageTitle);
    const descSanitized = this.piiSanitizer.sanitize(existing.pageDescription);

    const generated: SeoContent = await this.mockLlmProvider.generateSeo({
      pageTitle: titleSanitized.sanitizedText,
      sanitizedDescription: descSanitized.sanitizedText,
    });

    const accuracyResult = this.accuracyGuard.checkAccuracy(generated, combinedSource);

    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'REGENERATED',
      actor,
      notes: 'Admin triggered regeneration. Suggestions refreshed and status reset to DRAFT.',
    };

    const updated = await this.repository.update(id, {
      content: generated,
      status: 'DRAFT', // Always reset to DRAFT
      safetyReport: {
        piiRedacted: titleSanitized.redactedCount + descSanitized.redactedCount > 0,
        redactedItemsCount: titleSanitized.redactedCount + descSanitized.redactedCount,
        accuracyPassed: accuracyResult.passed,
        warnings: accuracyResult.warnings,
      },
      auditTrail: [...existing.auditTrail, auditEntry],
    });

    return updated!;
  }

  async getDraft(id: string): Promise<SeoDraft> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`SEO draft with ID "${id}" was not found.`);
    }
    return item;
  }

  async getAllDrafts(): Promise<SeoDraft[]> {
    return this.repository.findAll();
  }
}
