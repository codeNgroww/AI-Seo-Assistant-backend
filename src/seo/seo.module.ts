import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { OpenAiLlmProvider } from './providers/openai-llm.provider';
import { PiiSanitizer } from './safety/pii-sanitizer';
import { AccuracyGuard } from './safety/accuracy-guard';
import { SeoDraftRepository } from './repositories/seo-draft.repository';
import { AdminGuard } from './guards/admin.guard';

@Module({
  controllers: [SeoController],
  providers: [
    SeoService,
    MockLlmProvider,
    OpenAiLlmProvider,
    PiiSanitizer,
    AccuracyGuard,
    SeoDraftRepository,
    AdminGuard,
  ],
  exports: [SeoService],
})
export class SeoModule {}
