export type LegalDocumentType = "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "COOKIE_POLICY";

export type LegalDocumentLocale = "en" | "es" | "ca" | "fr";

export interface LegalDocumentSection {
    title: string;
    content: string;
}

export interface LegalDocument {
    id: string;
    type: LegalDocumentType;
    locale: LegalDocumentLocale;
    version: string;
    sections: LegalDocumentSection[];
    publishedAt: string;
}
