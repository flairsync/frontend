export type LegalDocumentType = "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "COOKIE_POLICY";

export interface LegalDocumentSection {
    title: string;
    content: string;
}

export interface LegalDocument {
    id: string;
    type: LegalDocumentType;
    version: string;
    sections: LegalDocumentSection[];
    publishedAt: string;
}
