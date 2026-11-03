export type PublicationStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SeoContent {
  seoTitle: string;
  metaDescription: string;
  faqs: FaqItem[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'GENERATED' | 'EDITED' | 'APPROVED' | 'PUBLISHED' | 'REGENERATED';
  actor: string;
  notes?: string;
}

export interface SeoDraft {
  id: string;
  pageTitle: string;
  pageDescription: string;
  status: PublicationStatus;
  content: SeoContent;
  auditTrail: AuditLogEntry[];
  safetyReport?: {
    piiRedacted: boolean;
    redactedItemsCount: number;
    accuracyPassed: boolean;
    warnings: string[];
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
