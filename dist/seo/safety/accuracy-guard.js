"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AccuracyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccuracyGuard = void 0;
const common_1 = require("@nestjs/common");
let AccuracyGuard = AccuracyGuard_1 = class AccuracyGuard {
    checkAccuracy(content, sourceText) {
        const warnings = [];
        const sourceLower = sourceText.toLowerCase();
        const fullGenerated = [
            content.seoTitle,
            content.metaDescription,
            ...content.faqs.map((f) => `${f.question} ${f.answer}`)
        ].join(' ').toLowerCase();
        for (const item of AccuracyGuard_1.RISKY_CLAIMS) {
            if (fullGenerated.includes(item.phrase) && !sourceLower.includes(item.phrase)) {
                warnings.push(`Accuracy Alert: Generated content contains "${item.phrase}" (${item.desc}) which does not exist in the source input.`);
            }
        }
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
};
exports.AccuracyGuard = AccuracyGuard;
AccuracyGuard.RISKY_CLAIMS = [
    { phrase: '100% cure', desc: 'Unverified medical guarantee' },
    { phrase: 'guaranteed cure', desc: 'Clinical guarantee prohibited by regulatory standards' },
    { phrase: 'free admission', desc: 'Unverified pricing claim' },
    { phrase: 'unconditional refund', desc: 'Financial policy claim' },
    { phrase: 'zero pain', desc: 'Misleading clinical claim' }
];
exports.AccuracyGuard = AccuracyGuard = AccuracyGuard_1 = __decorate([
    (0, common_1.Injectable)()
], AccuracyGuard);
//# sourceMappingURL=accuracy-guard.js.map