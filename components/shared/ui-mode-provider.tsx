import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";

import {
    getHiddenTiles,
    setHiddenTiles as persistHiddenTiles,
    setUiModeCookie,
    type UiMode,
} from "@/utils/cookies";

export type { UiMode };

// What a user with no cookie gets. Easy View is the default: this is a platform
// for restaurant and café owners and floor staff, most of whom are not technical,
// so the icon-driven shell is the one that should need no explaining. Anyone who
// prefers the full sidebar switches once and the cookie remembers it.
export const DEFAULT_UI_MODE: UiMode = "simple";

type UiModeState = {
    uiMode: UiMode;
    isSimple: boolean;
    setUiMode: (mode: UiMode) => void;
    toggleUiMode: () => void;
    /** Tile keys the user hid from their launcher. Presentation-only. */
    hiddenTiles: string[];
    isTileHidden: (key: string) => boolean;
    toggleTileHidden: (key: string) => void;
    resetHiddenTiles: () => void;
};

const UiModeContext = createContext<UiModeState | null>(null);

export default function UiModeProvider({ children }: { children: React.ReactNode }) {
    const pageContext = usePageContext();
    // pageContext carries the cookie value from the server, so the first paint
    // already renders the right shell. On the client this is the same value,
    // which keeps hydration consistent.
    const initialMode = (pageContext.uiMode as UiMode | null | undefined) ?? DEFAULT_UI_MODE;

    const [uiMode, setUiModeState] = useState<UiMode>(initialMode);
    // Hidden tiles live in a cookie too, but they never affect SSR markup —
    // reading them after mount avoids a hydration mismatch for zero cost.
    const [hiddenTiles, setHiddenTilesState] = useState<string[]>([]);

    useEffect(() => {
        setHiddenTilesState(getHiddenTiles());
    }, []);

    const setUiMode = useCallback((mode: UiMode) => {
        setUiModeCookie(mode);
        setUiModeState(mode);
    }, []);

    const toggleUiMode = useCallback(() => {
        setUiModeState((current) => {
            const next: UiMode = current === "simple" ? "advanced" : "simple";
            setUiModeCookie(next);
            return next;
        });
    }, []);

    const toggleTileHidden = useCallback((key: string) => {
        setHiddenTilesState((current) => {
            const next = current.includes(key)
                ? current.filter((k) => k !== key)
                : [...current, key];
            persistHiddenTiles(next);
            return next;
        });
    }, []);

    const resetHiddenTiles = useCallback(() => {
        persistHiddenTiles([]);
        setHiddenTilesState([]);
    }, []);

    const value = useMemo<UiModeState>(
        () => ({
            uiMode,
            isSimple: uiMode === "simple",
            setUiMode,
            toggleUiMode,
            hiddenTiles,
            isTileHidden: (key: string) => hiddenTiles.includes(key),
            toggleTileHidden,
            resetHiddenTiles,
        }),
        [uiMode, setUiMode, toggleUiMode, hiddenTiles, toggleTileHidden, resetHiddenTiles]
    );

    return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
}

export function useUiMode(): UiModeState {
    const context = useContext(UiModeContext);
    if (!context) {
        throw new Error("useUiMode must be used inside UiModeProvider");
    }
    return context;
}
