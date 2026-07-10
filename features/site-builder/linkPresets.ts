export const LINK_PRESET_OPTIONS = [
    { value: "reservations", label: "Link to Reservations" },
    { value: "menu", label: "Link to Menu" },
] as const;

/** Resolves a stored `buttonHref` value — either a preset token or a raw custom URL — to a real href. */
export function resolveLinkHref(value?: string): string {
    if (!value) return "#";
    if (value === "reservations") return "#reservation-section";
    if (value === "menu") return "#menu";
    return value;
}
