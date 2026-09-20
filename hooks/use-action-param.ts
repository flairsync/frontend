import { useCallback, useEffect, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";

import { subscribeAction } from "@/features/navigation/actionBus";

/**
 * Reads the `action` that Easy View's action bars use to open a dialog
 * directly, instead of making someone find the right tab and then the right
 * button.
 *
 * Two ways it arrives:
 *   - from the action bar on this same page, published straight to the action
 *     bus, so the dialog opens with no navigation and no reload;
 *   - from a `?action=` URL, for links, bookmarks and arrivals from elsewhere.
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

    // Vike hands out a fresh pageContext per navigation, and that object's
    // identity is the only dependable "new arrival" signal — the URL isn't,
    // because we strip the param below to keep it tidy.
    const handledNavigation = useRef<unknown>(null);

    const fire = useCallback(
        (value: string, where: string) => {
            if (!knownActions.includes(value)) {
                if (import.meta.env.DEV) {
                    console.warn(
                        `[useActionParam] Unhandled action "${value}" on ${where}. ` +
                        `This page handles: ${knownActions.join(", ") || "(none)"}. ` +
                        `An action bar is probably linking to something that moved.`
                    );
                }
                return;
            }

            // Two-phase on purpose. Setting the same value twice is a no-op in
            // React, so pressing the same button again — "add another table",
            // which is exactly how you build a floor plan — would leave
            // consumers watching an unchanged value and nothing would reopen.
            // Clearing first, then setting in a later commit, guarantees the
            // null -> value transition every time. The value stays put
            // afterwards, so consumers that wait on their own data (the menu
            // page waits for the plan to load) still fire when it lands.
            setAction(null);
            queueMicrotask(() => setAction(value));
        },
        // knownActions is typically an inline array literal; comparing by
        // identity would rebuild this every render for no benefit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [knownActions.join("|")]
    );

    // Same-page clicks: no URL involved at all.
    useEffect(
        () => subscribeAction((params) => {
            if (params.action) fire(params.action, "the action bar");
        }),
        [fire]
    );

    // Arrivals via a URL.
    useEffect(() => {
        if (handledNavigation.current === pageContext) return;

        const search = pageContext.urlParsed?.search as Record<string, string> | undefined;
        const value =
            search?.action ??
            (typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("action")
                : null);

        if (!value) return;

        // Mark the navigation handled before any early return, so an unknown
        // action can't make this spin on every render.
        handledNavigation.current = pageContext;

        fire(value, pageContext.urlPathname);

        // Drop the param so a refresh or a back-button press doesn't reopen the
        // same dialog. replaceState deliberately bypasses Vike's router: going
        // through navigate() here would re-run the page's data loading for a
        // purely cosmetic tidy-up.
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            if (url.searchParams.has("action")) {
                url.searchParams.delete("action");
                window.history.replaceState({}, "", url.toString());
            }
        }
    }, [pageContext, fire]);

    return action;
}
