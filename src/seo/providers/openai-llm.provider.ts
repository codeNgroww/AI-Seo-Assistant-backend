import { Injectable, Logger } from '@nestjs/common';
import { ILlmProvider, PromptContext, LlmOptions } from './llm-provider.interface';
import { SeoContent } from '../dto/seo-response.dto';

/**
 * Production-ready Real LLM Provider implementation template.
 * Highlights:
 * 1. Strict Server-Side Secret Handling: API key read strictly from process.env, never exposed to client.
 * 2. System Prompt Engineering with strict character limits and structured JSON Schema.
 * 3. Timeout & Error Boundary protection.
 */
@Injectable()
export class OpenAiLlmProvider implements ILlmProvider {
  public readonly providerName = 'openai-llm-provider';
  private readonly logger = new Logger(OpenAiLlmProvider.name);
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  }

  public async generateSeo(context: PromptContext, options?: LlmOptions): Promise<SeoContent> {
    if (!this.apiKey) {
      throw new Error(
        'Server Configuration: OPENAI_API_KEY is not defined in server environment variables. ' +
        'Secrets are strictly held on the backend server. To use a real LLM, supply OPENAI_API_KEY.'
      );
    }

    const systemPrompt = `You are a high-performance SEO specialist.
Generate search engine metadata strictly in JSON format with:
- "seoTitle": between 45 and 65 characters (max 70 characters).
- "metaDescription": between 120 and 160 characters (max 160 characters).
- "faqs": array of 2 to 3 objects with "id", "question", and "answer".

Do not fabricate false pricing, medical guarantees, or claims not supported by the context.`;

    const userPrompt = `Page Title: ${context.pageTitle}\nDescription: ${context.sanitizedDescription}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeoutMs ?? 10000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: options?.temperature ?? 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`OpenAI API error (${response.status}): ${errorText}`);
        throw new Error(`Upstream LLM error (${response.status}). Check server logs for details.`);
      }

      const data = await response.json();
      const contentString = data.choices?.[0]?.message?.content;
      if (!contentString) {
        throw new Error('LLM returned an empty response.');
      }

      const parsed = JSON.parse(contentString);
      return {
        seoTitle: parsed.seoTitle ?? context.pageTitle,
        metaDescription: parsed.metaDescription ?? context.sanitizedDescription.slice(0, 155),
        faqs: (parsed.faqs || []).map((faq: any, index: number) => ({
          id: faq.id || `faq_${index + 1}`,
          question: faq.question || '',
          answer: faq.answer || ''
        }))
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
