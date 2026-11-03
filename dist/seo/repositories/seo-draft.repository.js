"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoDraftRepository = void 0;
const common_1 = require("@nestjs/common");
let SeoDraftRepository = class SeoDraftRepository {
    constructor() {
        this.storage = new Map();
    }
    async create(draft) {
        this.storage.set(draft.id, { ...draft });
        return { ...draft };
    }
    async findById(id) {
        const item = this.storage.get(id);
        return item ? { ...item } : null;
    }
    async update(id, partial) {
        const existing = this.storage.get(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...partial,
            updatedAt: new Date().toISOString()
        };
        this.storage.set(id, updated);
        return { ...updated };
    }
    async findAll() {
        return Array.from(this.storage.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
};
exports.SeoDraftRepository = SeoDraftRepository;
exports.SeoDraftRepository = SeoDraftRepository = __decorate([
    (0, common_1.Injectable)()
], SeoDraftRepository);
//# sourceMappingURL=seo-draft.repository.js.map