export declare class FaqItemDto {
    id: string;
    question: string;
    answer: string;
}
export declare class UpdateDraftDto {
    seoTitle: string;
    metaDescription: string;
    faqs: FaqItemDto[];
    editNotes?: string;
}
