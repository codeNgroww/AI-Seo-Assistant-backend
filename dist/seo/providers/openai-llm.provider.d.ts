import { ILlmProvider, PromptContext, LlmOptions } from './llm-provider.interface';
import { SeoContent } from '../dto/seo-response.dto';
export declare class OpenAiLlmProvider implements ILlmProvider {
    readonly providerName = "openai-llm-provider";
    private readonly logger;
    private readonly apiKey;
    private readonly model;
    constructor();
    generateSeo(context: PromptContext, options?: LlmOptions): Promise<SeoContent>;
}
