"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoModule = void 0;
const common_1 = require("@nestjs/common");
const seo_controller_1 = require("./seo.controller");
const seo_service_1 = require("./seo.service");
const mock_llm_provider_1 = require("./providers/mock-llm.provider");
const openai_llm_provider_1 = require("./providers/openai-llm.provider");
const pii_sanitizer_1 = require("./safety/pii-sanitizer");
const accuracy_guard_1 = require("./safety/accuracy-guard");
const seo_draft_repository_1 = require("./repositories/seo-draft.repository");
const admin_guard_1 = require("./guards/admin.guard");
let SeoModule = class SeoModule {
};
exports.SeoModule = SeoModule;
exports.SeoModule = SeoModule = __decorate([
    (0, common_1.Module)({
        controllers: [seo_controller_1.SeoController],
        providers: [
            seo_service_1.SeoService,
            mock_llm_provider_1.MockLlmProvider,
            openai_llm_provider_1.OpenAiLlmProvider,
            pii_sanitizer_1.PiiSanitizer,
            accuracy_guard_1.AccuracyGuard,
            seo_draft_repository_1.SeoDraftRepository,
            admin_guard_1.AdminGuard,
        ],
        exports: [seo_service_1.SeoService],
    })
], SeoModule);
//# sourceMappingURL=seo.module.js.map