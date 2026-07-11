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
    /** Owner-set label, used both as the designer's section label and as the target list for "jump to section" nav links. */
    name?: string;
    components: SiteComponentInstance[];
}

export interface SitePageContent {
    sections: SiteSection[];
}
