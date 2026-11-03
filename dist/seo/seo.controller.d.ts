import { SeoService } from './seo.service';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { SeoDraft } from './dto/seo-response.dto';
export declare class SeoController {
    private readonly seoService;
    constructor(seoService: SeoService);
    getHealth(): {
        status: string;
        service: string;
        version: string;
        activeProvider: string;
        safetyModules: {
            piiSanitizer: string;
            accuracyGuard: string;
            humanInTheLoopApproval: string;
        };
    };
    generate(dto: GenerateSeoDto, req: any): Promise<SeoDraft>;
    getAllDrafts(): Promise<SeoDraft[]>;
    getDraft(id: string): Promise<SeoDraft>;
    updateDraft(id: string, dto: UpdateDraftDto, req: any): Promise<SeoDraft>;
    approveDraft(id: string, req: any): Promise<SeoDraft>;
    publishDraft(id: string, req: any): Promise<SeoDraft>;
    regenerateDraft(id: string, req: any): Promise<SeoDraft>;
}
