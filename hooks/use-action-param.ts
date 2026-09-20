import { useEffect, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";

/**
 * Reads the `?action=` deep link that Easy View's action bars use to open a
 * dialog directly, instead of making someone find the right tab and then the
 * right button.
 *
 * Reads from Vike's pageContext rather than `window.location`, because the
 * action bar sits on the very page its buttons point at: clicking "Add a table"
 * while already on the floor plan is a same-page navigation, and Vike swaps the
 * URL without remounting the page component. A mount-only effect never fires in
 * that case, which is every button on the bar.
 *
 * `knownActions` is the list this call site handles. Anything else warns in dev
 * rather than failing silently — that's the guard against a registry entry and
 * a page drifting apart after someone renames a tab.
 *
 *   const action = useActionParam(["invite"]);
 *   useEffect(() => { if (action === "invite") setInviteOpen(true); }, [action]);
 */
export function useActionParam(knownActions: readonly string[]): string | null {
    const pageContext = usePageContext();
    const [action, setAction] = useState<string | null>(null);

    // Vike hands out a fresh pageContext object per navigation, and that object
    // identity is the only dependable "this is a new arrival" signal — the URL
    // itself isn't, because we rewrite it below to keep it tidy.
    const handledNavigation = useRef<unknown>(null);

    useEffect(() => {
        if (handledNavigation.current === pageContext) return;

        const search = pageContext.urlParsed?.search as Record<string, string> | undefined;
        const value =
            search?.action ??
            // Belt and braces for any context where urlParsed isn't populated.
            (typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("action")
                : null);

        if (!value) return;

        // Mark the navigation handled before any early return, so an unknown
        // action can't make this effect spin on every render.
        handledNavigation.current = pageContext;

        if (!knownActions.includes(value)) {
            if (import.meta.env.DEV) {
                console.warn(
                    `[useActionParam] Unhandled action "${value}" on ${pageContext.urlPathname}. ` +
                    `This page handles: ${knownActions.join(", ") || "(none)"}. ` +
                    `An action bar is probably linking to something that moved.`
                );
            }
            return;
        }

        // Two-phase on purpose. Setting the same value twice is a no-op in
        // React, so a second click on the same button — "add another table",
        // which is exactly how you build a floor plan — would leave consumers
        // watching an unchanged value and the dialog would never reopen.
        // Clearing first, then setting in a later commit, guarantees the
        // null -> value transition every arrival. The value stays put
        // afterwards, so consumers that wait on their own data (the menu page
        // waits for the plan to load) still fire when that data lands.
        setAction(null);
        queueMicrotask(() => setAction(value));

        // Drop the param so a refresh or a back-button press doesn't reopen the
        // same dialog. replaceState deliberately bypasses Vike's router: going
        // through navigate() here would re-run the page's data loading for a
        // purely cosmetic URL tidy-up.
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            if (url.searchParams.has("action")) {
                url.searchParams.delete("action");
                window.history.replaceState({}, "", url.toString());
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageContext]);

    return action;
}
