"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OpenAiLlmProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiLlmProvider = void 0;
const common_1 = require("@nestjs/common");
let OpenAiLlmProvider = OpenAiLlmProvider_1 = class OpenAiLlmProvider {
    constructor() {
        this.providerName = 'openai-llm-provider';
        this.logger = new common_1.Logger(OpenAiLlmProvider_1.name);
        this.apiKey = process.env.OPENAI_API_KEY;
        this.model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    }
    async generateSeo(context, options) {
        if (!this.apiKey) {
            throw new Error('Server Configuration: OPENAI_API_KEY is not defined in server environment variables. ' +
                'Secrets are strictly held on the backend server. To use a real LLM, supply OPENAI_API_KEY.');
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
                faqs: (parsed.faqs || []).map((faq, index) => ({
                    id: faq.id || `faq_${index + 1}`,
                    question: faq.question || '',
                    answer: faq.answer || ''
                }))
            };
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
};
exports.OpenAiLlmProvider = OpenAiLlmProvider;
exports.OpenAiLlmProvider = OpenAiLlmProvider = OpenAiLlmProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OpenAiLlmProvider);
//# sourceMappingURL=openai-llm.provider.js.map