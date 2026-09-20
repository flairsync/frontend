import { useEffect, useState } from "react";

/**
 * Reads the `?action=` deep link that Easy View's action bars use to open a
 * dialog directly, instead of making someone find the right tab and then the
 * right button.
 *
 * The param is stripped once consumed, so refreshing or navigating back doesn't
 * pop the same dialog open again.
 *
 * `knownActions` is the list this call site handles. Anything else warns in dev
 * rather than failing silently — that's the guard against a registry entry and
 * a page drifting apart after someone renames a tab.
 *
 *   const action = useActionParam(["invite"]);
 *   useEffect(() => { if (action === "invite") setInviteOpen(true); }, [action]);
 */
export function useActionParam(knownActions: readonly string[]): string | null {
    const [action, setAction] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const value = new URLSearchParams(window.location.search).get("action");
        if (!value) return;

        if (!knownActions.includes(value)) {
            if (import.meta.env.DEV) {
                console.warn(
                    `[useActionParam] Unhandled action "${value}" on ${window.location.pathname}. ` +
                    `This page handles: ${knownActions.join(", ") || "(none)"}. ` +
                    `An action bar is probably linking to something that moved.`
                );
            }
            return;
        }

        setAction(value);

        const url = new URL(window.location.href);
        url.searchParams.delete("action");
        window.history.replaceState({}, "", url.toString());
        // Intentionally mount-only: a deep link is consumed once, on arrival.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return action;
}
