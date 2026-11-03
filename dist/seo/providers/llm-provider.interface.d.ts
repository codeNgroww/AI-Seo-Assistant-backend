import { SeoContent } from '../dto/seo-response.dto';
export interface PromptContext {
    pageTitle: string;
    sanitizedDescription: string;
}
export interface LlmOptions {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
}
export interface ILlmProvider {
    readonly providerName: string;
    generateSeo(context: PromptContext, options?: LlmOptions): Promise<SeoContent>;
}
