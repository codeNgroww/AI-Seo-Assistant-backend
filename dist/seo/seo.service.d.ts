import { GenerateSeoDto } from './dto/generate-seo.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { SeoDraft } from './dto/seo-response.dto';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { PiiSanitizer } from './safety/pii-sanitizer';
import { AccuracyGuard } from './safety/accuracy-guard';
import { SeoDraftRepository } from './repositories/seo-draft.repository';
export declare class SeoService {
    private readonly mockLlmProvider;
    private readonly piiSanitizer;
    private readonly accuracyGuard;
    private readonly repository;
    private readonly logger;
    constructor(mockLlmProvider: MockLlmProvider, piiSanitizer: PiiSanitizer, accuracyGuard: AccuracyGuard, repository: SeoDraftRepository);
    generate(dto: GenerateSeoDto, actor?: string): Promise<SeoDraft>;
    updateDraft(id: string, dto: UpdateDraftDto, actor?: string): Promise<SeoDraft>;
    approveDraft(id: string, actor?: string): Promise<SeoDraft>;
    publishDraft(id: string, actor?: string): Promise<SeoDraft>;
    regenerateDraft(id: string, actor?: string): Promise<SeoDraft>;
    getDraft(id: string): Promise<SeoDraft>;
    getAllDrafts(): Promise<SeoDraft[]>;
}
