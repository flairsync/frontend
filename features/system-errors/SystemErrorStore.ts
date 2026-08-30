import { create } from 'zustand';

interface SystemErrorState {
    isLocked: boolean;
    errorType: 'network' | 'server' | 'other' | null;
    message: string | null;
    permissionDenied: boolean;
    deniedPermission: string | null;
    lock: (type: 'network' | 'server' | 'other', message?: string | null) => void;
    unlock: () => void;
    openPermissionDenied: (permission?: string | null) => void;
    closePermissionDenied: () => void;
}

export const useSystemErrorStore = create<SystemErrorState>((set) => ({
    isLocked: false,
    errorType: null,
    message: null,
    permissionDenied: false,
    deniedPermission: null,
    lock: (type, message = null) => set({ isLocked: true, errorType: type, message }),
    unlock: () => set({ isLocked: false, errorType: null, message: null }),
    openPermissionDenied: (permission = null) => set({ permissionDenied: true, deniedPermission: permission }),
    closePermissionDenied: () => set({ permissionDenied: false, deniedPermission: null }),
}));
