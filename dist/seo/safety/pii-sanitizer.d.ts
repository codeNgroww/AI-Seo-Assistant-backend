export interface SanitizationResult {
    sanitizedText: string;
    redactedCount: number;
    categories: string[];
}
export declare class PiiSanitizer {
    sanitize(input: string): SanitizationResult;
}
