import { create } from "zustand";

export interface StaffSession {
    employmentId: string;
    name: string;
    roles: Array<{ id: string; name: string }>;
    shortToken: string;
    loggedInAt: Date;
}

interface StaffSessionStore {
    session: StaffSession | null;
    setSession: (s: StaffSession) => void;
    clearSession: () => void;
}

export const useStaffSession = create<StaffSessionStore>((set) => ({
    session: null,
    setSession: (session) => set({ session }),
    clearSession: () => set({ session: null }),
}));
