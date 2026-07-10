export interface SiteComponentInstance {
    id: string;
    typeKey: string;
    order: number;
    props: Record<string, any>;
    bindings?: Record<string, any>;
}

export interface SiteSection {
    id: string;
    order: number;
    components: SiteComponentInstance[];
}

export interface SitePageContent {
    sections: SiteSection[];
}
