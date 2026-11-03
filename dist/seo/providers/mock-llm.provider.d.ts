import { ILlmProvider, PromptContext, LlmOptions } from './llm-provider.interface';
import { SeoContent } from '../dto/seo-response.dto';
export declare class MockLlmProvider implements ILlmProvider {
    readonly providerName = "mock-llm-provider-v1";
    private readonly logger;
    private failureMode;
    setFailureMode(mode: 'NONE' | 'TIMEOUT' | 'RATE_LIMIT' | 'MALFORMED'): void;
    generateSeo(context: PromptContext, options?: LlmOptions): Promise<SeoContent>;
}
