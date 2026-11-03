import { Injectable } from '@nestjs/common';

export interface SanitizationResult {
  sanitizedText: string;
  redactedCount: number;
  categories: string[];
}

@Injectable()
export class PiiSanitizer {
  public sanitize(input: string): SanitizationResult {
    let text = input;
    let count = 0;
    const categories: string[] = [];

    // Fresh regex instances to avoid stateful lastIndex issues across invocations
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const cardRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
    const emiratesIdRegex = /784-\d{4}-\d{7}-\d{1}/g;
    const secretRegex = /(?:api[_-]?key|secret|token|bearer)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{16,}['"]?/gi;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

    const emailMatches = text.match(emailRegex);
    if (emailMatches && emailMatches.length > 0) {
      count += emailMatches.length;
      categories.push('EMAIL');
      text = text.replace(emailRegex, '[REDACTED_EMAIL]');
    }

    const cardMatches = text.match(cardRegex);
    if (cardMatches && cardMatches.length > 0) {
      count += cardMatches.length;
      categories.push('PAYMENT_CARD');
      text = text.replace(cardRegex, '[REDACTED_CARD]');
    }

    const emiratesMatches = text.match(emiratesIdRegex);
    if (emiratesMatches && emiratesMatches.length > 0) {
      count += emiratesMatches.length;
      categories.push('NATIONAL_ID');
      text = text.replace(emiratesIdRegex, '[REDACTED_ID]');
    }

    const secretMatches = text.match(secretRegex);
    if (secretMatches && secretMatches.length > 0) {
      count += secretMatches.length;
      categories.push('SECRET_KEY');
      text = text.replace(secretRegex, '[REDACTED_SECRET]');
    }

    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches) {
      for (const match of phoneMatches) {
        const digits = match.replace(/\D/g, '');
        if (digits.length >= 8 && digits.length <= 15) {
          count++;
          if (!categories.includes('PHONE')) categories.push('PHONE');
          text = text.replace(match, '[REDACTED_PHONE]');
        }
      }
    }

    return {
      sanitizedText: text,
      redactedCount: count,
      categories,
    };
  }
}
