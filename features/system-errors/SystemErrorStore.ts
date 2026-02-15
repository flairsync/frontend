import { create } from 'zustand';

interface SystemErrorState {
    isLocked: boolean;
    errorType: 'network' | 'server' | 'other' | null;
    message: string | null;
    lock: (type: 'network' | 'server' | 'other', message?: string | null) => void;
    unlock: () => void;
}

export const useSystemErrorStore = create<SystemErrorState>((set) => ({
    isLocked: false,
    errorType: null,
    message: null,
    lock: (type, message = null) => set({ isLocked: true, errorType: type, message }),
    unlock: () => set({ isLocked: false, errorType: null, message: null }),
}));
