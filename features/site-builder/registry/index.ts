import React from "react";
import Header from "./components/Header";
import MenuList from "./components/MenuList";
import Gallery from "./components/Gallery";
import OpeningHours from "./components/OpeningHours";
import Contact from "./components/Contact";
import Reviews from "./components/Reviews";
import CallToAction from "./components/CallToAction";
import Fallback from "./components/Fallback";

export type PropFieldType = "text" | "textarea" | "color" | "number" | "boolean" | "url";

export interface PropFieldSchema {
    key: string;
    label: string;
    type: PropFieldType;
    defaultValue?: any;
}

export interface RegistryEntry {
    component?: React.ComponentType<any>;
    propsSchema?: PropFieldSchema[];
    label?: string;
    deprecated?: boolean;
    migrateTo?: string;
    migrate?: (oldProps: Record<string, any>) => Record<string, any>;
}

export const COMPONENT_REGISTRY: Record<string, RegistryEntry> = {
    "header@1": {
        component: Header,
        label: "Header",
        propsSchema: [
            { key: "title", label: "Title", type: "text" },
            { key: "subtitle", label: "Subtitle", type: "textarea" },
            { key: "backgroundColor", label: "Background Color", type: "color", defaultValue: "#111827" },
            { key: "textColor", label: "Text Color", type: "color", defaultValue: "#ffffff" },
            { key: "showLogo", label: "Show Logo", type: "boolean", defaultValue: true },
            { key: "ctaLabel", label: "Button Label", type: "text" },
            { key: "ctaHref", label: "Button Link", type: "url" },
        ],
    },
    "menu-list@1": {
        component: MenuList,
        label: "Menu List",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "Our Menu" },
            { key: "description", label: "Description", type: "textarea" },
        ],
    },
    "gallery@1": {
        component: Gallery,
        label: "Photo Gallery",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "Gallery" },
            { key: "columns", label: "Columns", type: "number", defaultValue: 3 },
        ],
    },
    "opening-hours@1": {
        component: OpeningHours,
        label: "Opening Hours",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "Opening Hours" },
        ],
    },
    "contact@1": {
        component: Contact,
        label: "Contact & Map",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "Contact & Location" },
        ],
    },
    "reviews@1": {
        component: Reviews,
        label: "Reviews",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "What Guests Say" },
            { key: "limit", label: "Max Reviews", type: "number", defaultValue: 6 },
        ],
    },
    "call-to-action@1": {
        component: CallToAction,
        label: "Reserve / Order Button",
        propsSchema: [
            { key: "title", label: "Title", type: "text", defaultValue: "Ready to visit us?" },
            { key: "subtitle", label: "Subtitle", type: "textarea" },
            { key: "buttonLabel", label: "Button Label", type: "text", defaultValue: "Reserve a Table" },
            { key: "buttonHref", label: "Button Link", type: "url", defaultValue: "#reservation-section" },
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
