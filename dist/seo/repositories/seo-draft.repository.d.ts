import { SeoDraft } from '../dto/seo-response.dto';
export interface ISeoDraftRepository {
    create(draft: SeoDraft): Promise<SeoDraft>;
    findById(id: string): Promise<SeoDraft | null>;
    update(id: string, partial: Partial<SeoDraft>): Promise<SeoDraft | null>;
    findAll(): Promise<SeoDraft[]>;
}
export declare class SeoDraftRepository implements ISeoDraftRepository {
    private readonly storage;
    create(draft: SeoDraft): Promise<SeoDraft>;
    findById(id: string): Promise<SeoDraft | null>;
    update(id: string, partial: Partial<SeoDraft>): Promise<SeoDraft | null>;
    findAll(): Promise<SeoDraft[]>;
}
