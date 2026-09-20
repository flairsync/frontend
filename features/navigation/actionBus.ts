import { useEffect } from "react";

/**
 * A tiny client-side bus for Easy View's action bar.
 *
 * The bar sits on the very page its buttons target, so a click is a same-route
 * navigation: Vike swaps the URL but reconciles the page instead of remounting
 * it, and anything that reads its query params on mount never re-runs. Forcing
 * a real navigation fixes that, but makes the page visibly reload just to open
 * a dialog — which is worse than the problem.
 *
 * So for same-page clicks nothing navigates at all. The bar publishes the
 * params it would have put in the URL, and whoever cares picks them up. Landing
 * on the page from somewhere else still goes through the URL as normal.
 */

export type ActionParams = Record<string, string>;

const listeners = new Set<(params: ActionParams) => void>();

export function emitAction(params: ActionParams): void {
    // Copy per listener so one subscriber can't mutate what the next one sees.
    listeners.forEach((listener) => listener({ ...params }));
}

export function subscribeAction(listener: (params: ActionParams) => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * Runs `onValue` whenever the action bar publishes the given param.
 *
 * Lets a page react to an action-bar click without remounting, without a
 * reload, and without changing how it reads that same param on a cold load:
 *
 *   useParamFromAction("tab", (tab) => {
 *     if (VALID_TABS.includes(tab)) setActiveTab(tab);
 *   });
 */
export function useParamFromAction(name: string, onValue: (value: string) => void): void {
    useEffect(() => {
        return subscribeAction((params) => {
            const value = params[name];
            if (value !== undefined) onValue(value);
        });
        // onValue is typically an inline closure; re-subscribing each render is
        // cheap (a Set add/delete) and keeps the handler from going stale.
    });
}
