import { SeoContent } from '../dto/seo-response.dto';
export interface AccuracyCheckResult {
    passed: boolean;
    warnings: string[];
}
export declare class AccuracyGuard {
    private static readonly RISKY_CLAIMS;
    checkAccuracy(content: SeoContent, sourceText: string): AccuracyCheckResult;
}
