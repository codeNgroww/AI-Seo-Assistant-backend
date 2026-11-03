import { Injectable } from '@nestjs/common';
import { SeoContent } from '../dto/seo-response.dto';

export interface AccuracyCheckResult {
  passed: boolean;
  warnings: string[];
}

@Injectable()
export class AccuracyGuard {
  private static readonly RISKY_CLAIMS = [
    { phrase: '100% cure', desc: 'Unverified medical guarantee' },
    { phrase: 'guaranteed cure', desc: 'Clinical guarantee prohibited by regulatory standards' },
    { phrase: 'free admission', desc: 'Unverified pricing claim' },
    { phrase: 'unconditional refund', desc: 'Financial policy claim' },
    { phrase: 'zero pain', desc: 'Misleading clinical claim' }
  ];

  public checkAccuracy(content: SeoContent, sourceText: string): AccuracyCheckResult {
    const warnings: string[] = [];
    const sourceLower = sourceText.toLowerCase();

    const fullGenerated = [
      content.seoTitle,
      content.metaDescription,
      ...content.faqs.map((f) => `${f.question} ${f.answer}`)
    ].join(' ').toLowerCase();

    // Check risky claims
    for (const item of AccuracyGuard.RISKY_CLAIMS) {
      if (fullGenerated.includes(item.phrase) && !sourceLower.includes(item.phrase)) {
        warnings.push(`Accuracy Alert: Generated content contains "${item.phrase}" (${item.desc}) which does not exist in the source input.`);
      }
    }

    // Check unverified price mentions
    const priceRegex = /(?:aed|\$|usd|eur|dhs)\s*\d+/gi;
    const generatedPrices = fullGenerated.match(priceRegex) || [];
    const sourcePrices = sourceLower.match(priceRegex) || [];

    for (const price of generatedPrices) {
      const normalizedPrice = price.toLowerCase().replace(/\s+/g, '');
      const sourceHasPrice = sourcePrices.some((sp) => sp.toLowerCase().replace(/\s+/g, '') === normalizedPrice);
      if (!sourceHasPrice) {
        warnings.push(`Pricing Alert: Unverified price "${price}" introduced by AI.`);
      }
    }

    return {
      passed: warnings.length === 0,
      warnings
    };
  }
}
