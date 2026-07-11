export const LINK_PRESET_OPTIONS = [
    { value: "reservations", label: "Link to Reservations" },
    { value: "menu", label: "Link to Menu" },
] as const;

/** Prefix for a "jump to section" link value, e.g. `section:<sectionId>`. */
export const SECTION_LINK_PREFIX = "section:";

export function isSectionLink(value?: string): boolean {
    return !!value && value.startsWith(SECTION_LINK_PREFIX);
}

export function sectionIdFromLink(value: string): string {
    return value.slice(SECTION_LINK_PREFIX.length);
}

export function sectionLinkValue(sectionId: string): string {
    return `${SECTION_LINK_PREFIX}${sectionId}`;
}

/** Resolves a stored href value — a preset token, a `section:<id>` jump, or a raw custom URL — to a real href. */
export function resolveLinkHref(value?: string): string {
    if (!value) return "#";
    if (value === "reservations") return "#reservation-section";
    if (value === "menu") return "#menu";
    if (isSectionLink(value)) return `#section-${sectionIdFromLink(value)}`;
    return value;
}
