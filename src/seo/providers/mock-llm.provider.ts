import { Injectable, Logger } from '@nestjs/common';
import { ILlmProvider, PromptContext, LlmOptions } from './llm-provider.interface';
import { SeoContent, FaqItem } from '../dto/seo-response.dto';

@Injectable()
export class MockLlmProvider implements ILlmProvider {
  public readonly providerName = 'mock-llm-provider-v1';
  private readonly logger = new Logger(MockLlmProvider.name);

  // Failure simulation hook for resilience testing
  private failureMode: 'NONE' | 'TIMEOUT' | 'RATE_LIMIT' | 'MALFORMED' = 'NONE';

  public setFailureMode(mode: 'NONE' | 'TIMEOUT' | 'RATE_LIMIT' | 'MALFORMED'): void {
    this.failureMode = mode;
  }

  public async generateSeo(context: PromptContext, options?: LlmOptions): Promise<SeoContent> {
    const latency = 400; // Realistic network simulation
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

    // Context-sensitive generation for Space42 Arena
    if (titleLower.includes('space42') || titleLower.includes('summer music') || descLower.includes('abu dhabi')) {
      const faqs: FaqItem[] = [
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
        seoTitle: 'Space42 Arena Summer Music Festival 2026 | Abu Dhabi', // 55 chars
        metaDescription: 'Experience Abu Dhabi’s premier live music festival at Space42 Arena. Enjoy top artists, gourmet food stalls, and family entertainment. Book your tickets now!', // 158 chars
        faqs
      };
    }

    // Context-sensitive generation for DrVet or medical/veterinary services
    if (titleLower.includes('vet') || titleLower.includes('drvet') || descLower.includes('animal') || descLower.includes('pet')) {
      const faqs: FaqItem[] = [
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
        seoTitle: 'DrVet Veterinary Clinic | 24/7 Pet Care & Diagnostics', // 54 chars
        metaDescription: 'Trusted veterinary clinic offering 24/7 emergency pet care, advanced diagnostics, and wellness services with licensed veterinary specialists.', // 142 chars
        faqs
      };
    }

    // Generic dynamic fallback based on inputs
    const baseTitle = context.pageTitle.length > 40 ? context.pageTitle.slice(0, 38) : context.pageTitle;
    const generatedTitle = `${baseTitle} | Official Event & Guide`.slice(0, 65);

    let generatedDesc = `Discover ${context.pageTitle}. ${context.sanitizedDescription}`;
    if (generatedDesc.length > 155) {
      generatedDesc = generatedDesc.slice(0, 152) + '...';
    }

    const genericFaqs: FaqItem[] = [
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
}
