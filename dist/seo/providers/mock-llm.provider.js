"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockLlmProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLlmProvider = void 0;
const common_1 = require("@nestjs/common");
let MockLlmProvider = MockLlmProvider_1 = class MockLlmProvider {
    constructor() {
        this.providerName = 'mock-llm-provider-v1';
        this.logger = new common_1.Logger(MockLlmProvider_1.name);
        this.failureMode = 'NONE';
    }
    setFailureMode(mode) {
        this.failureMode = mode;
    }
    async generateSeo(context, options) {
        const latency = 400;
        await new Promise((resolve) => setTimeout(resolve, latency));
        if (this.failureMode === 'TIMEOUT') {
            throw new Error(`Upstream LLM provider request timed out after ${options?.timeoutMs ?? 5000}ms`);
        }
        if (this.failureMode === 'RATE_LIMIT') {
            throw new Error('LLM Provider returned HTTP 429: Rate limit exceeded. Try again later.');
        }
        if (this.failureMode === 'MALFORMED') {
            throw new Error('LLM Provider returned unparseable JSON payload.');
        }
        this.logger.log(`Generating SEO metadata for page: "${context.pageTitle}" via Mock LLM`);
        const titleLower = context.pageTitle.toLowerCase();
        const descLower = context.sanitizedDescription.toLowerCase();
        if (titleLower.includes('space42') || titleLower.includes('summer music') || descLower.includes('abu dhabi')) {
            const faqs = [
                {
                    id: 'faq_1',
                    question: 'Where is the Space42 Arena Summer Music Festival located?',
                    answer: 'The festival takes place at Space42 Arena in Al Raha Beach, Abu Dhabi, featuring indoor air-conditioned stages and outdoor entertainment zones.'
                },
                {
                    id: 'faq_2',
                    question: 'What time do gates open and what entertainment is available?',
                    answer: 'Gates open at 4:00 PM with international live headliners, artisan culinary stalls, family zones, and interactive music workshops.'
                },
                {
                    id: 'faq_3',
                    question: 'Are parking and public transport options available at Space42 Arena?',
                    answer: 'Yes, dedicated on-site parking is provided alongside dedicated rideshare drop-off zones and direct shuttle services from central Abu Dhabi.'
                }
            ];
            return {
                seoTitle: 'Space42 Arena Summer Music Festival 2026 | Abu Dhabi',
                metaDescription: 'Experience Abu Dhabi’s premier live music festival at Space42 Arena. Enjoy top artists, gourmet food stalls, and family entertainment. Book your tickets now!',
                faqs
            };
        }
        if (titleLower.includes('vet') || titleLower.includes('drvet') || descLower.includes('animal') || descLower.includes('pet')) {
            const faqs = [
                {
                    id: 'faq_1',
                    question: 'What veterinary emergency services are provided?',
                    answer: 'DrVet provides 24/7 emergency critical care, urgent diagnostics, routine vaccinations, and surgical treatments.'
                },
                {
                    id: 'faq_2',
                    question: 'Do I need an appointment for routine wellness checks?',
                    answer: 'Appointments are recommended for routine exams and vaccinations, but walk-ins for emergency triage are accepted anytime.'
                }
            ];
            return {
                seoTitle: 'DrVet Veterinary Clinic | 24/7 Pet Care & Diagnostics',
                metaDescription: 'Trusted veterinary clinic offering 24/7 emergency pet care, advanced diagnostics, and wellness services with licensed veterinary specialists.',
                faqs
            };
        }
        const baseTitle = context.pageTitle.length > 40 ? context.pageTitle.slice(0, 38) : context.pageTitle;
        const generatedTitle = `${baseTitle} | Official Event & Guide`.slice(0, 65);
        let generatedDesc = `Discover ${context.pageTitle}. ${context.sanitizedDescription}`;
        if (generatedDesc.length > 155) {
            generatedDesc = generatedDesc.slice(0, 152) + '...';
        }
        const genericFaqs = [
            {
                id: 'faq_1',
                question: `What are the event highlights for ${context.pageTitle}?`,
                answer: `${context.sanitizedDescription.slice(0, 120)}. Join us for an unforgettable live experience.`
            },
            {
                id: 'faq_2',
                question: 'How do I access the venue and entry guidelines?',
                answer: 'Check official admission guidelines online. Doors open early to ensure smooth entry and security screening.'
            }
        ];
        return {
            seoTitle: generatedTitle,
            metaDescription: generatedDesc,
            faqs: genericFaqs
        };
    }
};
exports.MockLlmProvider = MockLlmProvider;
exports.MockLlmProvider = MockLlmProvider = MockLlmProvider_1 = __decorate([
    (0, common_1.Injectable)()
], MockLlmProvider);
//# sourceMappingURL=mock-llm.provider.js.map