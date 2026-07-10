import React from "react";
import HeaderCentered from "./components/header/HeaderCentered";
import HeaderSplit from "./components/header/HeaderSplit";
import MenuListGrid from "./components/menu-list/MenuListGrid";
import GalleryMasonry from "./components/gallery/GalleryMasonry";
import OpeningHours from "./components/OpeningHours";
import Contact from "./components/Contact";
import Reviews from "./components/Reviews";
import CallToAction from "./components/CallToAction";
import Fallback from "./components/Fallback";

export type PropFieldType = "text" | "textarea" | "color" | "number" | "boolean" | "url" | "image" | "linkPreset";

export interface PropFieldSchema {
    key: string;
    label: string;
    type: PropFieldType;
    defaultValue?: any;
}

export interface RegistryEntry {
    component?: React.ComponentType<any>;
    /** Groups variants in the palette, e.g. "header", "menu-list". */
    category?: string;
    propsSchema?: PropFieldSchema[];
    /** Auto-applied when the component is first dropped onto the canvas — see §3.2 of the guide. */
    defaultBindings?: Record<string, any>;
    label?: string;
    deprecated?: boolean;
    migrateTo?: string;
    migrate?: (oldProps: Record<string, any>) => Record<string, any>;
}

// Shared prop schema across every header variant — keeping keys identical means an
// owner's color/button choices carry over when they switch variants.
const HEADER_PROPS_SCHEMA: PropFieldSchema[] = [
    { key: "primaryColor", label: "Background Color", type: "color", defaultValue: "#111827" },
    { key: "textColor", label: "Text Color", type: "color", defaultValue: "#ffffff" },
    { key: "backgroundImage", label: "Background Image URL", type: "image" },
    { key: "showLogo", label: "Show Logo", type: "boolean", defaultValue: true },
    { key: "buttonText", label: "Button Label", type: "text" },
    { key: "buttonHref", label: "Button Link", type: "linkPreset" },
];

// Business name/tagline/logo are facts, not owner-typed text — always auto-bound.
const HEADER_BUSINESS_BINDINGS: Record<string, any> = {
    businessName: { source: "businessProfile", field: "name" },
    tagline: { source: "businessProfile", field: "description" },
    logo: { source: "businessProfile", field: "logo" },
};

export const COMPONENT_REGISTRY: Record<string, RegistryEntry> = {
    "header-centered@1": {
        component: HeaderCentered,
        category: "header",
        label: "Centered",
        propsSchema: HEADER_PROPS_SCHEMA,
        defaultBindings: HEADER_BUSINESS_BINDINGS,
    },
    "header-split@1": {
        component: HeaderSplit,
        category: "header",
        label: "Split",
        propsSchema: [
            ...HEADER_PROPS_SCHEMA,
            { key: "imageOnRight", label: "Image on Right", type: "boolean", defaultValue: true },
        ],
        defaultBindings: HEADER_BUSINESS_BINDINGS,
    },
    // Deprecated — superseded by the curated header-*@1 variants (see guide §3.1).
    // Kept only so pages saved before the variant split still resolve to something live.
    "header@1": {
        deprecated: true,
        migrateTo: "header-centered@1",
        migrate: (old) => ({
            primaryColor: old.backgroundColor,
            textColor: old.textColor,
            showLogo: old.showLogo,
            buttonText: old.ctaLabel,
            buttonHref: old.ctaHref,
        }),
    },

    "menu-list-grid@1": {
        component: MenuListGrid,
        category: "menu-list",
        label: "Grid",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "Our Menu" },
            { key: "description", label: "Description", type: "textarea" },
        ],
        defaultBindings: { items: { source: "menuCategory" } },
    },
    // Deprecated — renamed to menu-list-grid@1 now that menu-list is a variant category.
    "menu-list@1": {
        deprecated: true,
        migrateTo: "menu-list-grid@1",
        migrate: (old) => old,
    },

    "gallery-masonry@1": {
        component: GalleryMasonry,
        category: "gallery",
        label: "Masonry",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "Gallery" },
            { key: "columns", label: "Columns", type: "number", defaultValue: 3 },
        ],
        defaultBindings: { images: { source: "businessProfile", field: "media" } },
    },
    // Deprecated — renamed to gallery-masonry@1 now that gallery is a variant category.
    "gallery@1": {
        deprecated: true,
        migrateTo: "gallery-masonry@1",
        migrate: (old) => old,
    },

    "opening-hours@1": {
        component: OpeningHours,
        category: "opening-hours",
        label: "Opening Hours",
        propsSchema: [{ key: "title", label: "Title", type: "text", defaultValue: "Opening Hours" }],
        defaultBindings: { hours: { source: "businessProfile", field: "openingHours" } },
    },

    "contact@1": {
        component: Contact,
        category: "contact",
        label: "Contact & Map",
        propsSchema: [{ key: "title", label: "Title", type: "text", defaultValue: "Contact & Location" }],
        defaultBindings: {
            address: { source: "businessProfile", field: "address" },
            phone: { source: "businessProfile", field: "phone" },
            email: { source: "businessProfile", field: "email" },
            website: { source: "businessProfile", field: "website" },
        },
    },

    "reviews@1": {
        component: Reviews,
        category: "reviews",
        label: "Reviews",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "What Guests Say" },
            { key: "limit", label: "Max Reviews", type: "number", defaultValue: 6 },
        ],
        defaultBindings: {
            reviews: { source: "businessReviews" },
            stats: { source: "businessReviewStats" },
        },
    },

    // Static — no business data at all, just a marketing button. No bindings.
    "call-to-action@1": {
        component: CallToAction,
        category: "call-to-action",
        label: "Button",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "Ready to visit us?" },
            { key: "subtitle", label: "Subtitle", type: "textarea" },
            { key: "buttonText", label: "Button Label", type: "text", defaultValue: "Reserve a Table" },
            { key: "buttonHref", label: "Button Link", type: "linkPreset", defaultValue: "reservations" },
            { key: "backgroundColor", label: "Background Color", type: "color", defaultValue: "#f5b400" },
            { key: "textColor", label: "Text Color", type: "color", defaultValue: "#111827" },
        ],
    },

    // Reserved — never delete this key. Fallback for unresolvable/deprecated typeKeys.
    "fallback@1": {
        component: Fallback,
    },
};

export interface ResolvedComponent {
    Component: React.ComponentType<any>;
    resolvedTypeKey: string;
    mapProps: (raw: Record<string, any>) => Record<string, any>;
}

/**
 * Walks migrateTo chains applying migrate() at each hop until a live component is
 * reached. Falls back to "fallback@1" if the typeKey isn't registered or the chain
 * dead-ends (missing migrateTo target, or a cycle).
 */
export function resolveComponent(typeKey: string): ResolvedComponent {
    const visited = new Set<string>();
    let key = typeKey;
    const migrations: ((raw: Record<string, any>) => Record<string, any>)[] = [];

    while (key && !visited.has(key)) {
        visited.add(key);
        const entry = COMPONENT_REGISTRY[key];
        if (!entry) break;

        if (entry.component) {
            return {
                Component: entry.component,
                resolvedTypeKey: key,
                mapProps: (raw) => migrations.reduce((acc, migrate) => migrate(acc), raw),
            };
        }

        if (entry.migrateTo) {
            if (entry.migrate) migrations.push(entry.migrate);
            key = entry.migrateTo;
            continue;
        }

        break;
    }

    return {
        Component: COMPONENT_REGISTRY["fallback@1"].component!,
        resolvedTypeKey: "fallback@1",
        mapProps: (raw) => raw,
    };
}
