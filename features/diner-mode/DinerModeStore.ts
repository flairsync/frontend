import { create } from 'zustand';
import { BusinessMenuItem } from '@/models/business/menu/BusinessMenuItem';

export interface CartItem {
    menuItemId: string;
    name: string;
    basePrice: number;
    quantity: number;
    variantId?: string;
    variantName?: string;
    modifiers: { modifierItemId: string; name: string; price: number }[];
    notes: string;
    lineTotal: number;
}

interface DinerModeState {
    cart: CartItem[];
    selectedItem: BusinessMenuItem | null;
    orderReadyId: string | null;
    scannedTableId: string | null;
    guestOrderId: string | null;

    openItemSheet: (item: BusinessMenuItem) => void;
    closeItemSheet: () => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (index: number) => void;
    clearCart: () => void;
    cartItemCount: () => number;
    cartTotal: () => number;
    setOrderReadyId: (id: string | null) => void;
    setScannedTableId: (id: string | null) => void;
    setGuestOrderId: (id: string | null) => void;
}

export const useDinerModeStore = create<DinerModeState>((set, get) => ({
    cart: [],
    selectedItem: null,
    orderReadyId: null,
    scannedTableId: null,
    guestOrderId: null,

    openItemSheet: (item) => set({ selectedItem: item }),
    closeItemSheet: () => set({ selectedItem: null }),

    addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),

    removeFromCart: (index) =>
        set((state) => ({ cart: state.cart.filter((_, i) => i !== index) })),

    clearCart: () => set({ cart: [] }),

    cartItemCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),

    cartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.lineTotal, 0),

    setOrderReadyId: (id) => set({ orderReadyId: id }),

    setScannedTableId: (id) => set({ scannedTableId: id }),

    setGuestOrderId: (id) => set({ guestOrderId: id }),
}));
