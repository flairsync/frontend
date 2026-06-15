import { create } from 'zustand';

interface SystemErrorState {
    isLocked: boolean;
    errorType: 'network' | 'server' | 'other' | null;
    message: string | null;
    permissionDenied: boolean;
    lock: (type: 'network' | 'server' | 'other', message?: string | null) => void;
    unlock: () => void;
    openPermissionDenied: () => void;
    closePermissionDenied: () => void;
}

export const useSystemErrorStore = create<SystemErrorState>((set) => ({
    isLocked: false,
    errorType: null,
    message: null,
    permissionDenied: false,
    lock: (type, message = null) => set({ isLocked: true, errorType: type, message }),
    unlock: () => set({ isLocked: false, errorType: null, message: null }),
    openPermissionDenied: () => set({ permissionDenied: true }),
    closePermissionDenied: () => set({ permissionDenied: false }),
}));
