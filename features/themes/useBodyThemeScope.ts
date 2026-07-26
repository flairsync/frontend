import { useEffect } from "react";

// Reused marketplace components (BusinessDetailsMenu, BusinessDetailsTableReservation,
// BusinessDetailsReviews, ...) render their Dialog/Popover/Select via Radix portals that
// mount under document.body, not under the theme's own <main> — so a CSS-var override on
// <main> alone never reaches them. Mirroring the same variables onto document.body covers
// both. This is a DOM side effect (theme scoping), not data fetching, and dialogs only ever
// open after user interaction (well after hydration), so there's no FOUC risk here.
export function useBodyThemeScope(vars: Record<string, string>) {
    useEffect(() => {
        const body = document.body;
        const previous: Record<string, string> = {};
        Object.entries(vars).forEach(([key, value]) => {
            previous[key] = body.style.getPropertyValue(key);
            body.style.setProperty(key, value);
        });
        return () => {
            Object.keys(vars).forEach((key) => {
                if (previous[key]) {
                    body.style.setProperty(key, previous[key]);
                } else {
                    body.style.removeProperty(key);
                }
            });
        };
        // vars is a per-theme constant reference, intentionally not tracked as a dep.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
