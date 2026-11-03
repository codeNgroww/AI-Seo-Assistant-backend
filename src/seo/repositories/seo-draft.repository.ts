import { Injectable } from '@nestjs/common';
import { SeoDraft } from '../dto/seo-response.dto';

export interface ISeoDraftRepository {
  create(draft: SeoDraft): Promise<SeoDraft>;
  findById(id: string): Promise<SeoDraft | null>;
  update(id: string, partial: Partial<SeoDraft>): Promise<SeoDraft | null>;
  findAll(): Promise<SeoDraft[]>;
}

@Injectable()
export class SeoDraftRepository implements ISeoDraftRepository {
  // In-memory store; easily swappable with Prisma / TypeORM / MongoDB in production
  private readonly storage: Map<string, SeoDraft> = new Map();

  async create(draft: SeoDraft): Promise<SeoDraft> {
    this.storage.set(draft.id, { ...draft });
    return { ...draft };
  }

  async findById(id: string): Promise<SeoDraft | null> {
    const item = this.storage.get(id);
    return item ? { ...item } : null;
  }

  async update(id: string, partial: Partial<SeoDraft>): Promise<SeoDraft | null> {
    const existing = this.storage.get(id);
    if (!existing) return null;

    const updated: SeoDraft = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    this.storage.set(id, updated);
    return { ...updated };
  }

  async findAll(): Promise<SeoDraft[]> {
    return Array.from(this.storage.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}
