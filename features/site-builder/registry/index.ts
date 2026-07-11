import React from "react";
import {
    PanelTop,
    AlignJustify,
    UtensilsCrossed,
    Image as ImageIcon,
    Clock,
    MapPin,
    Star,
    MousePointerClick,
    type LucideIcon,
} from "lucide-react";
import HeaderCentered from "./components/header/HeaderCentered";
import HeaderSplit from "./components/header/HeaderSplit";
import NavbarSimple from "./components/navbar/NavbarSimple";
import MenuListGrid from "./components/menu-list/MenuListGrid";
import MenuListElegant from "./components/menu-list/MenuListElegant";
import GalleryMasonry from "./components/gallery/GalleryMasonry";
import GalleryGrid from "./components/gallery/GalleryGrid";
import OpeningHoursList from "./components/opening-hours/OpeningHoursList";
import OpeningHoursCompact from "./components/opening-hours/OpeningHoursCompact";
import ContactCard from "./components/contact/ContactCard";
import ContactSplit from "./components/contact/ContactSplit";
import ReviewsGrid from "./components/reviews/ReviewsGrid";
import ReviewsSpotlight from "./components/reviews/ReviewsSpotlight";
import CtaBanner from "./components/call-to-action/CtaBanner";
import CtaSplit from "./components/call-to-action/CtaSplit";
import Fallback from "./components/Fallback";

export type PropFieldType = "text" | "textarea" | "color" | "number" | "boolean" | "url" | "image" | "linkPreset" | "navLinks";

export interface PropFieldSchema {
    key: string;
    label: string;
    type: PropFieldType;
    defaultValue?: any;
}

/** Groups + icons for the component picker modal, keyed by the `category` string used on registry entries. */
export const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
    navbar: { label: "Navbar", icon: AlignJustify },
    header: { label: "Header", icon: PanelTop },
    "menu-list": { label: "Menu List", icon: UtensilsCrossed },
    gallery: { label: "Gallery", icon: ImageIcon },
    "opening-hours": { label: "Opening Hours", icon: Clock },
    contact: { label: "Contact", icon: MapPin },
    reviews: { label: "Reviews", icon: Star },
    "call-to-action": { label: "Call to Action", icon: MousePointerClick },
};

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
    { key: "primaryColor", label: "Background Color", type: "color", defaultValue: "#1c1a2e" },
    { key: "textColor", label: "Text Color", type: "color", defaultValue: "#ffffff" },
    { key: "backgroundImage", label: "Background Image URL", type: "image" },
    { key: "showLogo", label: "Show Logo", type: "boolean", defaultValue: true },
    { key: "buttonText", label: "Button Label", type: "text" },
    { key: "buttonHref", label: "Button Link", type: "linkPreset" },
];

const NAVBAR_PROPS_SCHEMA: PropFieldSchema[] = [
    { key: "primaryColor", label: "Background Color", type: "color", defaultValue: "#1c1a2e" },
    { key: "textColor", label: "Text Color", type: "color", defaultValue: "#ffffff" },
    { key: "showLogo", label: "Show Logo", type: "boolean", defaultValue: true },
    { key: "navLinks", label: "Navigation Links", type: "navLinks", defaultValue: [] },
    { key: "buttonText", label: "Button Label", type: "text" },
    { key: "buttonHref", label: "Button Link", type: "linkPreset" },
];

const NAVBAR_BUSINESS_BINDINGS: Record<string, any> = {
    businessName: { source: "businessProfile", field: "name" },
    logo: { source: "businessProfile", field: "logo" },
};

// Business name/tagline/logo/photo/rating are facts, not owner-typed text — always
// auto-bound. `defaultBackgroundImage` lets a freshly-dropped header use one of the
// business's own gallery photos instead of rendering as a flat color block; the
// owner's explicit `backgroundImage` prop (if set) still wins.
const HEADER_BUSINESS_BINDINGS: Record<string, any> = {
    businessName: { source: "businessProfile", field: "name" },
    tagline: { source: "businessProfile", field: "description" },
    logo: { source: "businessProfile", field: "logo" },
    defaultBackgroundImage: { source: "businessProfile", field: "firstMediaUrl" },
    rating: { source: "businessProfile", field: "rating" },
    reviewCount: { source: "businessProfile", field: "reviewCount" },
};

const MENU_LIST_PROPS_SCHEMA: PropFieldSchema[] = [
    { key: "title", label: "Title", type: "text", defaultValue: "Our Menu" },
    { key: "description", label: "Description", type: "textarea" },
];

const MENU_LIST_BINDINGS: Record<string, any> = {
    items: { source: "menuCategory" },
    currency: { source: "businessProfile", field: "currency" },
};

const GALLERY_PROPS_SCHEMA: PropFieldSchema[] = [
    { key: "title", label: "Title", type: "text", defaultValue: "Gallery" },
    { key: "columns", label: "Columns", type: "number", defaultValue: 3 },
];

const GALLERY_BINDINGS: Record<string, any> = {
    images: { source: "businessProfile", field: "media" },
};

const CONTACT_PROPS_SCHEMA: PropFieldSchema[] = [
    { key: "title", label: "Title", type: "text", defaultValue: "Contact & Location" },
];

const CONTACT_BINDINGS: Record<string, any> = {
    address: { source: "businessProfile", field: "address" },
    phone: { source: "businessProfile", field: "phone" },
    email: { source: "businessProfile", field: "email" },
    website: { source: "businessProfile", field: "website" },
};

const REVIEWS_PROPS_SCHEMA: PropFieldSchema[] = [
    { key: "title", label: "Title", type: "text", defaultValue: "What Guests Say" },
    { key: "limit", label: "Max Reviews", type: "number", defaultValue: 6 },
];

const REVIEWS_BINDINGS: Record<string, any> = {
    reviews: { source: "businessReviews" },
    stats: { source: "businessReviewStats" },
};

// Shared prop schema across CTA variants. Static — no business data, just a
// marketing button — so no defaultBindings at all for this category.
const CTA_PROPS_SCHEMA: PropFieldSchema[] = [
    { key: "title", label: "Title", type: "text", defaultValue: "Ready to visit us?" },
    { key: "subtitle", label: "Subtitle", type: "textarea" },
    { key: "buttonText", label: "Button Label", type: "text", defaultValue: "Reserve a Table" },
    { key: "buttonHref", label: "Button Link", type: "linkPreset", defaultValue: "reservations" },
    { key: "backgroundColor", label: "Background Color", type: "color", defaultValue: "#f5b400" },
    { key: "textColor", label: "Text Color", type: "color", defaultValue: "#111827" },
];

export const COMPONENT_REGISTRY: Record<string, RegistryEntry> = {
    "navbar-simple@1": {
        component: NavbarSimple,
        category: "navbar",
        label: "Simple",
        propsSchema: NAVBAR_PROPS_SCHEMA,
        defaultBindings: NAVBAR_BUSINESS_BINDINGS,
    },

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
        propsSchema: MENU_LIST_PROPS_SCHEMA,
        defaultBindings: MENU_LIST_BINDINGS,
    },
    "menu-list-elegant@1": {
        component: MenuListElegant,
        category: "menu-list",
        label: "Elegant",
        propsSchema: MENU_LIST_PROPS_SCHEMA,
        defaultBindings: MENU_LIST_BINDINGS,
    },
    // Deprecated — renamed now that menu-list is a variant category.
    "menu-list@1": {
        deprecated: true,
        migrateTo: "menu-list-grid@1",
        migrate: (old) => old,
    },

    "gallery-masonry@1": {
        component: GalleryMasonry,
        category: "gallery",
        label: "Masonry",
        propsSchema: GALLERY_PROPS_SCHEMA,
        defaultBindings: GALLERY_BINDINGS,
    },
    "gallery-grid@1": {
        component: GalleryGrid,
        category: "gallery",
        label: "Grid",
        propsSchema: GALLERY_PROPS_SCHEMA,
        defaultBindings: GALLERY_BINDINGS,
    },
    // Deprecated — renamed now that gallery is a variant category.
    "gallery@1": {
        deprecated: true,
        migrateTo: "gallery-masonry@1",
        migrate: (old) => old,
    },

    "opening-hours-list@1": {
        component: OpeningHoursList,
        category: "opening-hours",
        label: "List",
        propsSchema: [{ key: "title", label: "Title", type: "text", defaultValue: "Opening Hours" }],
        defaultBindings: { hours: { source: "businessProfile", field: "openingHours" } },
    },
    "opening-hours-compact@1": {
        component: OpeningHoursCompact,
        category: "opening-hours",
        label: "Compact",
        propsSchema: [{ key: "title", label: "Title", type: "text", defaultValue: "Opening Hours" }],
        defaultBindings: { hours: { source: "businessProfile", field: "openingHours" } },
    },
    // Deprecated — renamed now that opening-hours is a variant category.
    "opening-hours@1": {
        deprecated: true,
        migrateTo: "opening-hours-list@1",
        migrate: (old) => old,
    },

    "contact-card@1": {
        component: ContactCard,
        category: "contact",
        label: "Card",
        propsSchema: CONTACT_PROPS_SCHEMA,
        defaultBindings: CONTACT_BINDINGS,
    },
    "contact-split@1": {
        component: ContactSplit,
        category: "contact",
        label: "Split",
        propsSchema: [{ key: "title", label: "Title", type: "text", defaultValue: "Visit Us" }],
        defaultBindings: CONTACT_BINDINGS,
    },
    // Deprecated — renamed now that contact is a variant category. Note: the pre-variant
    // contact@1 bound the whole profile object under a single "profile" key, not
    // individual fields, so old saved instances need re-binding (see defaultBindings
    // fallback in bindings.ts) rather than a prop-level migrate().
    "contact@1": {
        deprecated: true,
        migrateTo: "contact-card@1",
        migrate: (old) => old,
    },

    "reviews-grid@1": {
        component: ReviewsGrid,
        category: "reviews",
        label: "Grid",
        propsSchema: REVIEWS_PROPS_SCHEMA,
        defaultBindings: REVIEWS_BINDINGS,
    },
    "reviews-spotlight@1": {
        component: ReviewsSpotlight,
        category: "reviews",
        label: "Spotlight",
        propsSchema: REVIEWS_PROPS_SCHEMA,
        defaultBindings: REVIEWS_BINDINGS,
    },
    // Deprecated — renamed now that reviews is a variant category.
    "reviews@1": {
        deprecated: true,
        migrateTo: "reviews-grid@1",
        migrate: (old) => old,
    },

    "cta-banner@1": {
        component: CtaBanner,
        category: "call-to-action",
        label: "Banner",
        propsSchema: CTA_PROPS_SCHEMA,
    },
    "cta-split@1": {
        component: CtaSplit,
        category: "call-to-action",
        label: "Split",
        propsSchema: [
            ...CTA_PROPS_SCHEMA,
            { key: "backgroundImage", label: "Background Image URL", type: "image" },
            { key: "imageOnRight", label: "Image on Right", type: "boolean", defaultValue: true },
        ],
    },
    // Deprecated — renamed now that call-to-action is a variant category.
    "call-to-action@1": {
        deprecated: true,
        migrateTo: "cta-banner@1",
        migrate: (old) => old,
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
