import { create } from "zustand";

interface SubscriptionState {
    isUpgradeModalOpen: boolean;
    limitMessage: string | null;
    openUpgradeModal: (message?: string | null) => void;
    closeUpgradeModal: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
    isUpgradeModalOpen: false,
    limitMessage: null,
    openUpgradeModal: (message = null) =>
        set({ isUpgradeModalOpen: true, limitMessage: message }),
    closeUpgradeModal: () => set({ isUpgradeModalOpen: false, limitMessage: null }),
}));
